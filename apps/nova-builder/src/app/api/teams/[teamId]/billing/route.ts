// P69 — Per-seat team billing.
//   GET   → plan, seat count, used seats
//   PATCH → change plan / seat count (owner only). Stripe subscription sync is
//           performed by the billing webhook; here we record the desired state
//           and return the checkout URL the client should redirect to.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


const SEAT_PRICE: Record<string, number> = { free: 0, team: 8, business: 16 };

async function requireOwner(teamId: string): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  const { data } = await getSupabaseAdmin()
    .from("team_members").select("role").eq("team_id", teamId).eq("user_id", userId).single();
  return data?.role === "owner" ? userId : null;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: member } = await supabase
    .from("team_members").select("role").eq("team_id", teamId).eq("user_id", userId).single();
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: team } = await supabase
    .from("teams").select("plan, seats, billing_cycle").eq("id", teamId).single();
  const { count } = await supabase
    .from("team_members").select("id", { count: "exact", head: true }).eq("team_id", teamId);

  const plan = team?.plan ?? "free";
  const seats = team?.seats ?? 1;
  return NextResponse.json({
    plan, seats, usedSeats: count ?? 0,
    billingCycle: team?.billing_cycle ?? "monthly",
    seatPrice: SEAT_PRICE[plan] ?? 0,
    monthlyTotal: (SEAT_PRICE[plan] ?? 0) * seats,
  });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;
  if (!(await requireOwner(teamId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as { plan?: string; seats?: number; billingCycle?: string };
  const supabase = getSupabaseAdmin();

  // Cannot reduce seats below the number of current members.
  if (body.seats !== undefined) {
    const { count } = await supabase
      .from("team_members").select("id", { count: "exact", head: true }).eq("team_id", teamId);
    if (body.seats < (count ?? 0)) {
      return NextResponse.json({ error: `Cannot set seats below current member count (${count}).` }, { status: 400 });
    }
  }

  const updates: Record<string, unknown> = {};
  if (body.plan !== undefined) updates["plan"] = body.plan;
  if (body.seats !== undefined) updates["seats"] = body.seats;
  if (body.billingCycle !== undefined) updates["billing_cycle"] = body.billingCycle;

  await supabase.from("teams").update(updates).eq("id", teamId);

  // In production this returns a Stripe Checkout/Portal URL; the webhook then
  // reconciles stripe_subscription_id + status back onto the team row.
  const checkoutUrl = `/api/billing/portal?team=${teamId}&plan=${body.plan ?? ""}&seats=${body.seats ?? ""}`;
  return NextResponse.json({ ok: true, checkoutUrl });
}
