// Single source of truth for subscription tiers.
// Copied from apps/studio/src/lib/tiers.ts — keep in sync.
export const TIERS = ["free", "pro", "max", "team"] as const;
export type Tier = (typeof TIERS)[number];

export interface TierEntitlements {
  label: string;
  aiCreditsPerMonth: number | null;
  dailyCreditCap: number | null;
  codeExport: boolean;
  deploy: boolean;
  maxProjects: number | null;
  seats: number;
  rank: number;
}

export const TIER_ENTITLEMENTS: Record<Tier, TierEntitlements> = {
  free:  { label:"Free",  aiCreditsPerMonth:200,   dailyCreditCap:40,   codeExport:true,  deploy:false, maxProjects:3,    seats:1, rank:0 },
  pro:   { label:"Pro",   aiCreditsPerMonth:4000,  dailyCreditCap:null, codeExport:true,  deploy:true,  maxProjects:null, seats:1, rank:1 },
  max:   { label:"Max",   aiCreditsPerMonth:15000, dailyCreditCap:null, codeExport:true,  deploy:true,  maxProjects:null, seats:1, rank:2 },
  team:  { label:"Team",  aiCreditsPerMonth:5000,  dailyCreditCap:null, codeExport:true,  deploy:true,  maxProjects:null, seats:5, rank:3 },
};

export function isKnownTier(t: unknown): t is Tier {
  return typeof t === "string" && (TIERS as readonly string[]).includes(t);
}

export function entitlements(tier: string): TierEntitlements {
  return isKnownTier(tier) ? TIER_ENTITLEMENTS[tier] : TIER_ENTITLEMENTS.free;
}

export function dailyCreditCap(tier: string): number | null {
  return entitlements(tier).dailyCreditCap;
}

export type CreditSource = "monthly" | "topup";

export interface CreditSourceDecision {
  ok: boolean;
  source: CreditSource;
  reason?: "daily_cap" | "insufficient";
}

export function decideCreditSource(args: {
  cost: number;
  monthly: number;
  topup: number;
  dailyCap: number | null;
  spentTodayMonthly: number;
}): CreditSourceDecision {
  const { cost, monthly, topup, dailyCap, spentTodayMonthly } = args;
  const capWouldExceed = dailyCap !== null && spentTodayMonthly + cost > dailyCap;
  const monthlyUsable = monthly >= cost && !capWouldExceed;
  if (monthlyUsable) return { ok: true, source: "monthly" };
  if (topup >= cost) return { ok: true, source: "topup" };
  return { ok: false, source: "topup", reason: capWouldExceed && monthly >= cost ? "daily_cap" : "insufficient" };
}
