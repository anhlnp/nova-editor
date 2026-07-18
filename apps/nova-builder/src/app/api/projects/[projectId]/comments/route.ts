// GET /api/projects/:id/comments — list comments (newest first, max 100)
// POST /api/projects/:id/comments — create a comment

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ownsProject } from "@/lib/projectOwnership";


export async function GET(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FA-009: comments are owner-scoped — not readable across tenants.
  if (!(await ownsProject(projectId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const includeResolved = url.searchParams.get("resolved") === "true";

  let query = getSupabaseAdmin()
    .from("project_comments")
    .select("id, body, instance_id, resolved, parent_id, created_at, user_id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!includeResolved) query = query.eq("resolved", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });
  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FA-009: only the owner may post comments to a project.
  if (!(await ownsProject(projectId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { body, instanceId, parentId } = (await req.json()) as {
    body: string;
    instanceId?: string;
    parentId?: string;
  };

  if (!body?.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("project_comments")
    .insert({
      project_id: projectId,
      user_id: userId,
      body: body.trim(),
      instance_id: instanceId ?? null,
      parent_id: parentId ?? null,
    })
    .select("id, body, instance_id, resolved, parent_id, created_at, user_id")
    .single();

  if (error) return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  return NextResponse.json({ comment: data }, { status: 201 });
}
