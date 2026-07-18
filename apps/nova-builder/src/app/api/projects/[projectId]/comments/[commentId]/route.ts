// PATCH /api/projects/:id/comments/:commentId — resolve/unresolve or update body
// DELETE /api/projects/:id/comments/:commentId — delete

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


type Ctx = { params: Promise<{ projectId: string; commentId: string }> };

export async function PATCH(req: Request, context: Ctx) {
  const { projectId, commentId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patch = (await req.json()) as { resolved?: boolean; body?: string };
  const updates: Record<string, unknown> = {};
  if (typeof patch.resolved === "boolean") updates["resolved"] = patch.resolved;
  if (patch.body?.trim()) updates["body"] = patch.body.trim();

  const { error } = await getSupabaseAdmin()
    .from("project_comments")
    .update(updates)
    .eq("id", commentId)
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, context: Ctx) {
  const { projectId, commentId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await getSupabaseAdmin()
    .from("project_comments")
    .delete()
    .eq("id", commentId)
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
