import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";

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
  try {
    const body = (await req.json()) as { projectId?: string; key?: string; force?: boolean };
    if (!body.projectId || !body.key) {
      return NextResponse.json({ error: "Missing projectId or key" }, { status: 400 });
    }
    projectId = body.projectId;
    key = body.key;
    force = body.force ?? false;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Verify the key belongs to this project and this assetId.
  const expectedSegment = `assets/${projectId}/${assetId}/`;
  if (!key.startsWith(expectedSegment)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!force) {
    try {
      await deleteFromR2(key);
    } catch (err) {
      console.error("[api/assets] R2 delete failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

// GET /api/assets/[assetId]?projectId=X — returns { refCount } so the client can
// show a confirmation before deleting an in-use asset.
// Refcount is computed client-side (passed in body); this endpoint is a no-op
// safety wrapper — actual count is driven by the AssetsPanel which already has
// the $props / $styles atoms in memory. This route just validates auth.
export async function GET(
  _req: Request,
  context: { params: Promise<{ assetId: string }> }
) {
  await context.params; // consume params
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
