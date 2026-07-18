// GET/POST/PATCH/DELETE /api/admin/flags — feature flag management (admin only).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return false;
  const { data } = await getSupabaseAdmin().from("users").select("role").eq("id", userId).single();
  return data?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data } = await getSupabaseAdmin()
    .from("feature_flags").select("*").order("key", { ascending: true });
  return NextResponse.json({ flags: data ?? [] });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json()) as { key: string; description?: string };
  if (!body.key) return NextResponse.json({ error: "key required" }, { status: 400 });
  const { data } = await getSupabaseAdmin()
    .from("feature_flags").insert({ key: body.key, description: body.description ?? "" }).select().single();
  return NextResponse.json({ flag: data });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json()) as { id: string; enabled?: boolean; userIds?: string[] };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.enabled !== undefined) updates["enabled"] = body.enabled;
  if (body.userIds !== undefined) updates["user_ids"] = body.userIds;
  await getSupabaseAdmin().from("feature_flags").update(updates).eq("id", body.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json()) as { id: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await getSupabaseAdmin().from("feature_flags").delete().eq("id", body.id);
  return NextResponse.json({ ok: true });
}
