// POST /api/projects/[projectId]/github
// Push the current project schema_json to a GitHub repo as project.json.
// Body: { token, owner, repo, branch, authorName, authorEmail }
// Returns: { sha, url }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readProject, writeProject } from "@studio/git";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { token: string; owner: string; repo: string; branch: string; authorName?: string; authorEmail?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, owner, repo, branch } = body;
  if (!token || !owner || !repo || !branch) {
    return NextResponse.json({ error: "token, owner, repo, and branch are required" }, { status: 400 });
  }

  // Fetch project from Supabase
  const { data: row, error } = await getSupabaseAdmin()
    .from("projects")
    .select("schema_json")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ctx = { token, owner, repo, branch };

  // Read current SHA (null if file doesn't exist yet)
  const { sha: currentSha } = await readProject(ctx).catch(() => ({ sha: null, project: null }));

  try {
    const newSha = await writeProject({
      ...ctx,
      project: row.schema_json as Record<string, unknown>,
      currentSha,
      authorName: body.authorName ?? "Nova Editor",
      authorEmail: body.authorEmail ?? "nova@novabuilder.app",
    });

    const url = `https://github.com/${owner}/${repo}/blob/${branch}/project.json`;
    return NextResponse.json({ sha: newSha, url });
  } catch (err) {
    console.error("[github] writeProject failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
