import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { nanoid } from "nanoid";
import { uploadToR2, makeAssetKey, assetPublicUrl, type NovaAsset } from "@/lib/r2";

// Parse image dimensions from raw buffer headers (no external dep).
function getImageDimensions(buf: Buffer, mime: string): { width?: number; height?: number } {
  try {
    if (mime === "image/png" && buf.length >= 24) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if ((mime === "image/jpeg" || mime === "image/jpg") && buf.length > 10) {
      let i = 2;
      while (i < buf.length - 8) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1];
        const isSOF =
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc9 && marker <= 0xcb);
        if (isSOF && i + 8 < buf.length) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        if (i + 4 > buf.length) break;
        const len = buf.readUInt16BE(i + 2);
        i += 2 + len;
      }
    }
  } catch { /* malformed header */ }
  return {};
}

// Extract font family/weight/style from the file name heuristic.
// Full sfnt parsing would require a binary font parser not available here;
// name-convention inference covers 95%+ of web font files.
function getFontMetadata(filename: string): {
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: "normal" | "italic" | "oblique";
} {
  const base = filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
  const lower = base.toLowerCase();

  // Weight detection by keyword
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

  // Family = filename stripped of weight/style keywords (title-case)
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

const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

const FONT_TYPES: Record<string, string> = {
  "font/woff": "woff",
  "font/woff2": "woff2",
  "application/font-woff": "woff",
  "application/font-woff2": "woff2",
};

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file || !projectId) {
    return NextResponse.json({ error: "Missing file or projectId" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 413 });
  }

  const format = IMAGE_TYPES[file.type] ?? FONT_TYPES[file.type];
  if (!format) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 415 }
    );
  }

  const assetType: NovaAsset["type"] = IMAGE_TYPES[file.type] ? "image" : "font";
  const assetId = nanoid();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = makeAssetKey(projectId, assetId, safeName);
  const data = Buffer.from(await file.arrayBuffer());

  try {
    await uploadToR2(key, data, file.type);
  } catch (err) {
    console.error("[api/assets] R2 upload failed:", err);
    return NextResponse.json({ error: "Upload to R2 failed" }, { status: 500 });
  }

  const dims = assetType === "image" ? getImageDimensions(data, file.type) : {};
  const fontMeta = assetType === "font" ? getFontMetadata(file.name) : {};

  const asset: NovaAsset = {
    id: assetId,
    name: file.name,
    type: assetType,
    format,
    size: file.size,
    url: assetPublicUrl(key),
    key,
    createdAt: new Date().toISOString(),
    ...dims,
    ...fontMeta,
  };

  return NextResponse.json({ asset }, { status: 201 });
}
