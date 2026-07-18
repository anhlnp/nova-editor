// GET /api/projects/:id/snapshots — list up to 25 snapshots (newest first)
// POST /api/projects/:id/snapshots — save a named snapshot of the current schema_json

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("project_snapshots")
    .select("id, label, created_at")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });
  return NextResponse.json({ snapshots: data ?? [] });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label } = (await req.json()) as { label?: string };

  // Fetch current schema_json from the project
  const { data: project, error: fetchErr } = await getSupabaseAdmin()
    .from("projects")
    .select("schema_json")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (fetchErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: snap, error: insertErr } = await getSupabaseAdmin()
    .from("project_snapshots")
    .insert({
      project_id: projectId,
      user_id: userId,
      label: label?.trim() || null,
      schema_json: project.schema_json,
    })
    .select("id, label, created_at")
    .single();

  if (insertErr) return NextResponse.json({ error: "Save failed" }, { status: 500 });
  return NextResponse.json({ snapshot: snap }, { status: 201 });
}
