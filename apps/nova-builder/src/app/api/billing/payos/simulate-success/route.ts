import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Only available in development mode" }, { status: 403 });
  }

  let body: { orderCode?: number | string; plan?: string; userId?: string; teamId?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { orderCode, plan, userId, teamId } = body;

  if (!orderCode || !plan) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Claim this orderCode first to mimic webhook idempotency
  const { error: claimError } = await supabase.from("processed_payments").insert({
    order_code: String(orderCode),
    provider: "payos",
    kind: plan === "credits" ? "credits" : "plan",
    user_id: userId || null,
  });

  if (claimError) {
    console.error("[Simulate Success Claim Error]:", claimError);
    // If it's a unique constraint violation, it's code "23505"
    if (claimError.code === "23505") {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }
    return NextResponse.json({ error: claimError.message, details: claimError.details }, { status: 500 });
  }

  console.log("[Simulate Success] Order claimed successfully. Updating plan/credits...", { plan, userId, teamId });

  // Apply simulated changes
  if (plan === "credits" && userId) {
    const { data: user, error: selectErr } = await supabase.from("users").select("credits_remaining").eq("id", userId).single();
    if (selectErr) {
      console.error("[Simulate Select User Error]:", selectErr);
    }
    const { error: updateErr } = await supabase.from("users").update({ credits_remaining: (user?.credits_remaining ?? 0) + 500 }).eq("id", userId);
    if (updateErr) {
      console.error("[Simulate Update User Credits Error]:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
  } else if (teamId) {
    const { error: updateErr } = await supabase.from("teams").update({ plan: plan === "team" ? "team" : plan === "max" ? "max" : "pro" }).eq("id", teamId);
    if (updateErr) {
      console.error("[Simulate Update Team Plan Error]:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
  } else if (userId) {
    const { error: updateErr } = await supabase.from("users").update({ tier: plan === "team" ? "team" : plan === "max" ? "max" : "pro" }).eq("id", userId);
    if (updateErr) {
      console.error("[Simulate Update User Tier Error]:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
  }

  console.log("[Simulate Success] Plan/credits updated successfully!");
  return NextResponse.json({ success: true });
}
