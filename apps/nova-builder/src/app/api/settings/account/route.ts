// GET /api/settings/account — returns user account info (tier, credits).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: user } = await getSupabaseAdmin()
    .from("users")
    .select("tier, credits_remaining, created_at")
    .eq("id", userId)
    .single();

  return NextResponse.json({
    tier: user?.tier ?? "free",
    credits: user?.credits_remaining ?? 0,
    createdAt: user?.created_at ?? null,
  });
}
