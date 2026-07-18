// R3 (P0-2) — Lemon Squeezy webhook.
// Verifies X-Signature (HMAC-SHA256 of the raw body with the webhook secret),
// then reconciles subscription state onto users/teams.
// Public route (middleware whitelists /api/billing/webhook).

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


type LSEvent = {
  meta?: {
    event_name?: string;
    custom_data?: { user_id?: string; plan?: string; team_id?: string; seats?: string };
  };
  data?: { id?: string; attributes?: { status?: string } };
};

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");

  const sigBuf = Buffer.from(signature, "utf8");
  const digBuf = Buffer.from(digest, "utf8");
  if (sigBuf.length !== digBuf.length || !timingSafeEqual(sigBuf, digBuf)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as LSEvent;
  const eventName = event.meta?.event_name ?? "";
  const custom = event.meta?.custom_data ?? {};
  const subscriptionId = event.data?.id ?? null;

  const supabase = getSupabaseAdmin();

  if (eventName === "subscription_created" || eventName === "subscription_updated") {
    const plan = custom.plan === "team" ? "team" : "pro";
    if (custom.team_id) {
      const seats = Math.max(1, parseInt(custom.seats ?? "1", 10) || 1);
      await supabase.from("teams").update({
        plan, seats, stripe_subscription_id: subscriptionId,
      }).eq("id", custom.team_id);
    } else if (custom.user_id) {
      await supabase.from("users").update({ tier: plan }).eq("id", custom.user_id);
    }
  }

  if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
    if (custom.team_id) {
      await supabase.from("teams").update({ plan: "free" }).eq("id", custom.team_id);
    } else if (custom.user_id) {
      await supabase.from("users").update({ tier: "free" }).eq("id", custom.user_id);
    }
  }

  return NextResponse.json({ ok: true });
}
