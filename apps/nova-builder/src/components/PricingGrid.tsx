"use client";

import Link from "next/link";
import { PLAN_CARDS } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";

interface PricingGridProps {
  currentTier?: string;
  onSelectPlan: (tier: string) => void;
}

export default function PricingGrid({ currentTier, onSelectPlan }: PricingGridProps) {
  const { t } = useI18n();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 48 }}>
      {PLAN_CARDS.map((plan) => {
        const copy = t.pricing.planCopy[plan.tier] ?? { label: plan.label, features: plan.features, cta: plan.cta };
        const isCurrent = currentTier === plan.tier;

        return (
          <div
            key={plan.tier}
            style={{
              border: `1.5px solid ${plan.tier === "pro" ? "#6d28d9" : isCurrent ? "rgba(124,58,237,0.5)" : "#e2e8f0"}`,
              borderRadius: 16, padding: "28px 24px",
              background: plan.tier === "pro" ? "#faf5ff" : "#ffffff",
              display: "flex", flexDirection: "column", gap: 16,
              boxShadow: plan.tier === "pro" ? "0 0 0 4px rgba(109,40,217,0.08)" : "none",
              position: "relative",
            }}
          >
            {plan.tier === "pro" && (
              <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#6d28d9", color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>
                {t.pricing.mostPopular}
              </div>
            )}

            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>{copy.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: plan.tier === "pro" ? "#6d28d9" : "#0f172a", letterSpacing: "-0.02em" }}>{plan.price}</div>
            </div>

            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {copy.features.map((f) => (
                <li key={f} style={{ fontSize: 14, color: "#374151", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#10b981", flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <div style={{
                height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700,
                background: "rgba(124,58,237,0.12)",
                color: "#6d28d9",
                border: "1.5px solid rgba(124,58,237,0.3)",
                marginTop: "auto",
              }}>
                Gói hiện tại
              </div>
            ) : plan.tier === "free" ? (
              <Link
                href="/signup"
                style={{
                  height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, textDecoration: "none",
                  background: "transparent",
                  color: "#6d28d9",
                  border: "1.5px solid #6d28d9",
                  marginTop: "auto",
                }}
              >
                {copy.cta}
              </Link>
            ) : (
              <button
                onClick={() => onSelectPlan(plan.tier)}
                style={{
                  height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700,
                  background: plan.tier === "pro" ? "#6d28d9" : "transparent",
                  color: plan.tier === "pro" ? "#ffffff" : "#6d28d9",
                  border: "1.5px solid #6d28d9",
                  marginTop: "auto",
                  cursor: "pointer",
                  width: "100%",
                  fontFamily: "inherit",
                }}
              >
                {copy.cta}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
