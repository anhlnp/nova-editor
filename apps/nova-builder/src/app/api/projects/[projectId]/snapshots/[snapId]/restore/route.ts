// POST /api/projects/:id/snapshots/:snapId/restore
// Copies schema_json from snapshot back to the project (1-click rollback).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function POST(
  _req: Request,
  context: { params: Promise<{ projectId: string; snapId: string }> }
) {
  const { projectId, snapId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch the snapshot (ownership via user_id)
  const { data: snap, error: snapErr } = await getSupabaseAdmin()
    .from("project_snapshots")
    .select("schema_json")
    .eq("id", snapId)
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .single();

  if (snapErr || !snap) {
    return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
  }

  // Save a "before restore" snapshot so the user can undo the rollback
  try {
    const { data: current } = await getSupabaseAdmin()
      .from("projects")
      .select("schema_json")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();
    await getSupabaseAdmin().from("project_snapshots").insert({
      project_id: projectId,
      user_id: userId,
      label: "Before restore",
      schema_json: current?.schema_json,
    });
  } catch {/* non-fatal — checkpoint failure should not block restore */}

  // Apply the snapshot
  const { error: updateErr } = await getSupabaseAdmin()
    .from("projects")
    .update({ schema_json: snap.schema_json, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (updateErr) return NextResponse.json({ error: "Restore failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
