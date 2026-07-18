// Display-layer plan catalog derived from TIER_ENTITLEMENTS (lib/tiers.ts).
// Prices come from doc/pricing-policy.md — $0 / $19 / $49 / $29-per-seat.
// This file is the ONLY place that maps tier → display price.
// /pricing and settings/subscription both consume PLAN_CARDS — never hardcode prices elsewhere.

import { TIER_ENTITLEMENTS } from "./tiers";
import type { Tier } from "./tiers";

export interface PlanCard {
  tier: Tier;
  label: string;
  price: string;
  priceMonthly: number;
  features: string[];
  accent: string;
  cta: string;
}

export const PLAN_CARDS: PlanCard[] = [
  {
    tier: "free",
    label: TIER_ENTITLEMENTS.free.label,
    price: "$0 / mo",
    priceMonthly: 0,
    features: [
      `${TIER_ENTITLEMENTS.free.maxProjects ?? "Unlimited"} active projects`,
      `${TIER_ENTITLEMENTS.free.aiCreditsPerMonth} AI credits / month`,
      "Visual editor (all blocks)",
      "Preview links",
      "Nova branding",
    ],
    accent: "rgba(255,255,255,0.08)",
    cta: "Get started free",
  },
  {
    tier: "pro",
    label: TIER_ENTITLEMENTS.pro.label,
    price: "$19 / mo",
    priceMonthly: 19,
    features: [
      "Unlimited projects",
      `${(TIER_ENTITLEMENTS.pro.aiCreditsPerMonth ?? 0).toLocaleString()} AI credits / month`,
      "React (.tsx) code export",
      "Vercel auto-deploy",
      "1 custom domain",
      "Premium templates",
      "Email support",
    ],
    accent: "rgba(109,40,217,0.3)",
    cta: "Upgrade to Pro",
  },
  {
    tier: "max",
    label: TIER_ENTITLEMENTS.max.label,
    price: "$49 / mo",
    priceMonthly: 49,
    features: [
      "Everything in Pro",
      `${(TIER_ENTITLEMENTS.max.aiCreditsPerMonth ?? 0).toLocaleString()} AI credits / month`,
      "5 custom domains",
      "White-label (remove Nova branding)",
      "Priority email support (48 h)",
    ],
    accent: "rgba(5,150,105,0.2)",
    cta: "Upgrade to Max",
  },
  {
    tier: "team",
    label: TIER_ENTITLEMENTS.team.label,
    price: "$29 / seat / mo",
    priceMonthly: 29,
    features: [
      `${TIER_ENTITLEMENTS.team.seats}+ seats (min 3)`,
      `${(TIER_ENTITLEMENTS.team.aiCreditsPerMonth ?? 0).toLocaleString()} credits / seat (pooled)`,
      "Real-time collaboration",
      "Admin dashboard",
      "Priority + onboarding support",
    ],
    accent: "rgba(14,165,233,0.2)",
    cta: "Upgrade to Team",
  },
];
