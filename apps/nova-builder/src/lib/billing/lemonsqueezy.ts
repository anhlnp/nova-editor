// Lemon Squeezy adapter — all LS constants and helpers live here.
// API routes import from this file; UI pages import named constants (never raw URLs).

export const LS_PORTAL_URL = "https://app.lemonsqueezy.com/my-orders";

export const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

// Plan slug → Lemon Squeezy variant id (set via env).
export function getLsVariantId(plan: string): string | undefined {
  const map: Record<string, string | undefined> = {
    pro: process.env.LEMONSQUEEZY_VARIANT_PRO,
    team: process.env.LEMONSQUEEZY_VARIANT_TEAM,
  };
  return map[plan];
}

// Build a hosted LS checkout URL.
export function buildLsCheckoutUrl(args: {
  storeId: string;
  variantId: string;
  email: string;
  userId: string;
  plan: string;
  teamId?: string;
  seats?: string;
}): string {
  const custom = new URLSearchParams({
    "checkout[email]": args.email,
    "checkout[custom][user_id]": args.userId,
    "checkout[custom][plan]": args.plan,
  });
  if (args.teamId) custom.set("checkout[custom][team_id]", args.teamId);
  if (args.seats) custom.set("checkout[custom][seats]", args.seats);
  return `https://store-${args.storeId}.lemonsqueezy.com/checkout/buy/${args.variantId}?${custom.toString()}`;
}
