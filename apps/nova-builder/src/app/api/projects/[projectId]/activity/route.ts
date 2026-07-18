// GET /api/projects/:id/activity — list recent project events (newest first, max 50)
// POST /api/projects/:id/activity — log an activity event (called by other routes)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ownsProject } from "@/lib/projectOwnership";


export async function GET(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FA-008: activity feed is owner-scoped — not readable across tenants.
  if (!(await ownsProject(projectId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("project_activity")
    .select("id, action, meta, created_at, user_id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });
  return NextResponse.json({ events: data ?? [] });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FA-008: only the owner may write activity events to a project.
  if (!(await ownsProject(projectId, userId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { action, meta } = (await req.json()) as { action: string; meta?: Record<string, unknown> };
  if (!action) return NextResponse.json({ error: "action required" }, { status: 400 });

  await getSupabaseAdmin().from("project_activity").insert({
    project_id: projectId,
    user_id: userId,
    action,
    meta: meta ?? null,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

