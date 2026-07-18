// GET /api/admin/users — list all users (admin only).
// PATCH /api/admin/users — update user tier/role.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  const { data } = await getSupabaseAdmin().from("users").select("role").eq("id", userId).single();
  if (data?.role !== "admin") return null;
  return userId;
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("q") ?? "";
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  let query = getSupabaseAdmin()
    .from("users")
    .select("id, email, tier, role, credits_remaining, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) query = query.ilike("email", `%${search}%`);

  const { data, count } = await query;
  const mapped = (data ?? []).map((u: Record<string, unknown>) => ({
    id: u.id,
    email: u.email,
    tier: u.tier,
    role: u.role,
    credits: u.credits_remaining ?? 0,
    created_at: u.created_at,
  }));
  return NextResponse.json({ users: mapped, total: count ?? 0 });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { userId: string; tier?: string; role?: string; credits?: number };
  if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (body.tier !== undefined) updates["tier"] = body.tier;
  if (body.role !== undefined) updates["role"] = body.role;
  if (body.credits !== undefined) updates["credits_remaining"] = body.credits;

  await getSupabaseAdmin().from("users").update(updates).eq("id", body.userId);
  return NextResponse.json({ ok: true });
}
