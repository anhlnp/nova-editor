import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createFolder, listFolders } from "@/lib/db-folders";

// GET /api/assets/folders?projectId=xxx — list all folders for a project
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  try {
    const folders = await listFolders(projectId);
    return NextResponse.json({ folders });
  } catch (err) {
    console.error("[api/assets/folders] list error:", err);
    return NextResponse.json({ error: "Failed to list folders" }, { status: 500 });
  }
}

// POST /api/assets/folders — create a new folder
// Body: { name: string, projectId: string, parentId?: string | null }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: string; projectId?: string; parentId?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, projectId, parentId = null } = body;
  if (!name || !projectId) {
    return NextResponse.json({ error: "Missing name or projectId" }, { status: 400 });
  }

  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length > 64) {
    return NextResponse.json(
      { error: "Folder name must be 1–64 characters" },
      { status: 422 }
    );
  }

  try {
    const folder = await createFolder(projectId, trimmedName, parentId ?? null);
    return NextResponse.json({ folder }, { status: 201 });
  } catch (err) {
    console.error("[api/assets/folders] create error:", err);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
