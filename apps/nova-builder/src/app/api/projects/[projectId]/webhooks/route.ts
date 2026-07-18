// GET  /api/projects/:id/webhooks — list webhooks for a project
// POST /api/projects/:id/webhooks — create a webhook

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
    .from("project_webhooks")
    .select("id, url, events, active, created_at")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });
  return NextResponse.json({ webhooks: data ?? [] });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, events } = (await req.json()) as { url?: string; events?: string[] };
  if (!url?.trim()) return NextResponse.json({ error: "url required" }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("project_webhooks")
    .insert({
      project_id: projectId,
      user_id: userId,
      url: url.trim(),
      events: events ?? ["deploy", "save"],
      active: true,
    })
    .select("id, url, events, active, created_at")
    .single();

  if (error) return NextResponse.json({ error: "Create failed" }, { status: 500 });
  return NextResponse.json({ webhook: data }, { status: 201 });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { webhookId } = (await req.json()) as { webhookId: string };
  if (!webhookId) return NextResponse.json({ error: "webhookId required" }, { status: 400 });

  const { error } = await getSupabaseAdmin()
    .from("project_webhooks")
    .delete()
    .eq("id", webhookId)
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
