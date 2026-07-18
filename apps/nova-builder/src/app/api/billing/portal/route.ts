// R3 (P0-2) — Billing portal: builds a provider checkout and redirects.
//   GET /api/billing/portal?provider=lemonsqueezy|payos&plan=pro|team&team=<id>&seats=<n>
//
// Lemon Squeezy → recurring subscriptions (hosted checkout URL with custom data).
// PayOS (VietQR) → one-time payments: plan purchase or prepaid credit top-up.
// Webhooks (/api/billing/webhook, /api/billing/webhook/payos) reconcile state.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createHmac } from "crypto";

// Plan → Lemon Squeezy variant id (configured per store).
const LS_VARIANTS: Record<string, string | undefined> = {
  pro: process.env.LEMONSQUEEZY_VARIANT_PRO,
  team: process.env.LEMONSQUEEZY_VARIANT_TEAM,
};

// Plan → one-time VND price for PayOS (annual purchase / top-up pack).
const PAYOS_PRICES_VND: Record<string, number> = {
  pro: 290_000,
  team: 1_190_000,
  credits: 99_000, // 500-credit top-up pack
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const provider = url.searchParams.get("provider") ?? "lemonsqueezy";
  const plan = url.searchParams.get("plan") ?? "pro";
  const teamId = url.searchParams.get("team") ?? "";
  const seats = url.searchParams.get("seats") ?? "";

  if (provider === "payos") {
    return payosCheckout({ userId: user.id, plan, teamId, origin: url.origin });
  }
  return lemonSqueezyCheckout({ userId: user.id, email: user.email ?? "", plan, teamId, seats });
}

function lemonSqueezyCheckout(args: { userId: string; email: string; plan: string; teamId: string; seats: string }) {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = LS_VARIANTS[args.plan];
  if (!storeId || !variantId) {
    return NextResponse.json(
      { error: "Billing not configured", detail: "Set LEMONSQUEEZY_STORE_ID and variant env vars." },
      { status: 503 }
    );
  }

  // Hosted checkout link with custom data — the webhook reads these back.
  const custom = new URLSearchParams({
    "checkout[email]": args.email,
    "checkout[custom][user_id]": args.userId,
    "checkout[custom][plan]": args.plan,
  });
  if (args.teamId) custom.set("checkout[custom][team_id]", args.teamId);
  if (args.seats) custom.set("checkout[custom][seats]", args.seats);

  const checkoutUrl = `https://store-${storeId}.lemonsqueezy.com/checkout/buy/${variantId}?${custom.toString()}`;
  return NextResponse.redirect(checkoutUrl, 302);
}

async function payosCheckout(args: { userId: string; plan: string; teamId: string; origin: string }) {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    return NextResponse.json(
      { error: "Billing not configured", detail: "Set PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY." },
      { status: 503 }
    );
  }

  const amount = PAYOS_PRICES_VND[args.plan] ?? PAYOS_PRICES_VND.pro;
  // orderCode is numeric per PayOS; timestamp-based, unique enough per user-click.
  const orderCode = Number(`${Date.now()}`.slice(-10));
  // PayOS description max 25 chars; encode the intent for the webhook.
  const description = `nova ${args.plan}`.slice(0, 25);
  const returnUrl = `${args.origin}/settings/subscription?paid=1`;
  const cancelUrl = `${args.origin}/settings/subscription?cancelled=1`;

  // Signature: HMAC-SHA256 over the alphabetically-sorted core fields.
  const signData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
  const signature = createHmac("sha256", checksumKey).update(signData).digest("hex");

  const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
    method: "POST",
    headers: {
      "x-client-id": clientId,
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
      signature,
      // Echoed back in the webhook payload so it can attribute the payment.
      items: [{ name: `nova:${args.plan}:${args.userId}:${args.teamId}`, quantity: 1, price: amount }],
    }),
  });

  const json = (await res.json()) as { code?: string; data?: { checkoutUrl?: string }; desc?: string };
  if (json.code !== "00" || !json.data?.checkoutUrl) {
    return NextResponse.json({ error: json.desc ?? "PayOS checkout failed" }, { status: 502 });
  }
  return NextResponse.redirect(json.data.checkoutUrl, 302);
}
