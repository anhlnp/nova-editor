import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteFolder, getFolder } from "@/lib/db-folders";

// DELETE /api/assets/folders/[folderId]
// Deletes the folder. Assets inside become root-level (folderId becomes orphaned).
// Does NOT delete the assets themselves — only removes the folder container.
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify folder exists before deleting
  const folder = await getFolder(folderId);
  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  try {
    await deleteFolder(folderId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/assets/folders] delete error:", err);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
