import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { nanoid } from "nanoid";
import { uploadToR2, makeAssetKey, assetPublicUrl, type NovaAsset } from "@/lib/r2";
import { uploadToImageKit, projectFolder, isImageKitConfigured } from "@/lib/imagekit";
import { getFolder } from "@/lib/db-folders";

// Chunked upload protocol (bypasses the 10 MB Workers body limit):
//   POST  /api/assets/upload  — initiate: { projectId, fileName, fileType, fileSize, totalParts, folderId? }
//                               returns { uploadId, assetId, key }
//   PUT   /api/assets/upload  — append chunk: FormData { uploadId, chunk (Blob), partIndex, totalParts }
//                               returns { ok: true, received: N }
//   PATCH /api/assets/upload  — complete: { uploadId, assetId, key, fileSize, fileType, fileName }
//                               returns { asset }
//
// In-memory store (per-Worker instance) — sufficient for single-worker dev.
// In production with multiple Workers instances, use R2 multipart API or KV.

type PendingUpload = {
  assetId: string;
  projectId: string;
  key: string;
  parts: Buffer[];
  totalParts: number;
  folderId: string | null;
};

const pending = new Map<string, PendingUpload>();

function getFontMetadata(filename: string): {
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: "normal" | "italic" | "oblique";
} {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  const lower = base.toLowerCase();
  const WEIGHT_MAP: [string, number][] = [
    ["thin", 100], ["extralight", 200], ["extra light", 200],
    ["light", 300], ["regular", 400], ["normal", 400], ["medium", 500],
    ["semibold", 600], ["semi bold", 600], ["demibold", 600],
    ["bold", 700], ["extrabold", 800], ["extra bold", 800],
    ["black", 900], ["heavy", 900],
  ];
  let weight = 400;
  for (const [kw, w] of WEIGHT_MAP) {
    if (lower.includes(kw)) { weight = w; break; }
  }
  const style: "normal" | "italic" | "oblique" =
    lower.includes("italic") ? "italic" :
    lower.includes("oblique") ? "oblique" : "normal";
  const stripWords = new Set([
    "thin","extralight","extra","light","regular","normal","medium",
    "semibold","semi","bold","demibold","demi","extrabold","black","heavy",
    "italic","oblique","variable","condensed","expanded","narrow","wide",
  ]);
  const family = base.split(" ")
    .filter((w) => !stripWords.has(w.toLowerCase()) && w.length > 0)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ") || base.split(" ")[0];
  return { fontFamily: family, fontWeight: weight, fontStyle: style };
}

const FONT_TYPES = new Set(["font/woff", "font/woff2", "application/font-woff", "application/font-woff2"]);

// POST — initiate upload session
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    projectId?: string;
    fileName?: string;
    fileType?: string;
    totalParts?: number;
    folderId?: string | null;
  };
  const { projectId, fileName, fileType, totalParts, folderId = null } = body;
  if (!projectId || !fileName || !fileType || !totalParts) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const assetId = nanoid();
  const uploadId = nanoid();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  // key is a placeholder for R2; for ImageKit path is resolved at PATCH time
  const key = makeAssetKey(projectId, assetId, safeName);

  pending.set(uploadId, {
    assetId, projectId, key, parts: [], totalParts,
    folderId: folderId ?? null,
  });

  return NextResponse.json({ uploadId, assetId, key });
}

// PUT — receive a chunk
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart" }, { status: 400 });
  }

  const uploadId = formData.get("uploadId") as string | null;
  const chunkBlob = formData.get("chunk") as Blob | null;
  const partIndex = parseInt((formData.get("partIndex") as string | null) ?? "0", 10);

  if (!uploadId || !chunkBlob) {
    return NextResponse.json({ error: "Missing uploadId or chunk" }, { status: 400 });
  }

  const entry = pending.get(uploadId);
  if (!entry) return NextResponse.json({ error: "Unknown uploadId" }, { status: 404 });

  const chunk = Buffer.from(await chunkBlob.arrayBuffer());
  entry.parts[partIndex] = chunk;

  return NextResponse.json({ ok: true, received: partIndex });
}

// PATCH — complete upload, reassemble, push to ImageKit or R2
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    uploadId?: string;
    assetId?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  };
  const { uploadId, assetId, fileName, fileType, fileSize } = body;
  if (!uploadId || !assetId || !fileName || !fileType || fileSize === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const entry = pending.get(uploadId);
  if (!entry) return NextResponse.json({ error: "Unknown uploadId" }, { status: 404 });
  if (entry.assetId !== assetId) return NextResponse.json({ error: "Mismatch" }, { status: 400 });

  const data = Buffer.concat(entry.parts.filter(Boolean));
  const { projectId, folderId } = entry;
  pending.delete(uploadId);

  const isFont = FONT_TYPES.has(fileType);
  const fontMeta = isFont ? getFontMetadata(fileName) : {};
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

  let asset: NovaAsset;

  if (isImageKitConfigured()) {
    // ── ImageKit upload ────────────────────────────────────────────────────
    let folderName: string | undefined;
    if (folderId) {
      try {
        const folder = await getFolder(folderId);
        folderName = folder?.name;
      } catch { /* upload to root on error */ }
    }

    const ikFolder = projectFolder(projectId, folderName);

    let ikResult;
    try {
      ikResult = await uploadToImageKit(data, safeName, ikFolder);
    } catch (err) {
      console.error("[api/assets/upload] ImageKit upload failed:", err);
      return NextResponse.json({ error: "ImageKit upload failed" }, { status: 500 });
    }

    asset = {
      id: assetId,
      name: fileName,
      type: isFont ? "font" : "image",
      format: fileType.split("/")[1] ?? "bin",
      size: fileSize,
      url: ikResult.url,
      key: ikResult.fileId,
      imagekitFileId: ikResult.fileId,
      createdAt: new Date().toISOString(),
      folderId,
      width: ikResult.width,
      height: ikResult.height,
      ...fontMeta,
    };
  } else {
    // ── R2 fallback (original behavior) ────────────────────────────────────
    try {
      await uploadToR2(entry.key, data, fileType);
    } catch (err) {
      console.error("[api/assets/upload] R2 upload failed:", err);
      return NextResponse.json({ error: "R2 upload failed" }, { status: 500 });
    }

    asset = {
      id: assetId,
      name: fileName,
      type: isFont ? "font" : "image",
      format: fileType.split("/")[1] ?? "bin",
      size: fileSize,
      url: assetPublicUrl(entry.key),
      key: entry.key,
      createdAt: new Date().toISOString(),
      folderId,
      ...fontMeta,
    };
  }

  return NextResponse.json({ asset }, { status: 201 });
}
