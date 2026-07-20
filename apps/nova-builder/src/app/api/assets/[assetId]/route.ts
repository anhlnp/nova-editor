import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";
import { deleteFromImageKit, isImageKitConfigured } from "@/lib/imagekit";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let projectId: string;
  let key: string;
  let force = false;
  let imagekitFileId: string | undefined;

  try {
    const body = (await req.json()) as {
      projectId?: string;
      key?: string;
      force?: boolean;
      imagekitFileId?: string;
    };
    if (!body.projectId || !body.key) {
      return NextResponse.json({ error: "Missing projectId or key" }, { status: 400 });
    }
    projectId = body.projectId;
    key = body.key;
    force = body.force ?? false;
    imagekitFileId = body.imagekitFileId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!force) {
    // ImageKit: use imagekitFileId if provided, otherwise try R2
    if (imagekitFileId && isImageKitConfigured()) {
      try {
        await deleteFromImageKit(imagekitFileId);
      } catch (err) {
        console.error("[api/assets] ImageKit delete failed:", err);
        // Non-fatal — asset record is still removed from builder
      }
    } else {
      // R2 path — verify the key belongs to this project and assetId
      const expectedSegment = `assets/${projectId}/${assetId}/`;
      if (!key.startsWith(expectedSegment)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      try {
        await deleteFromR2(key);
      } catch (err) {
        console.error("[api/assets] R2 delete failed:", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}

// GET /api/assets/[assetId]?projectId=X — auth check only (ref count computed client-side)
export async function GET(
  _req: Request,
  context: { params: Promise<{ assetId: string }> }
) {
  await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
