"use client";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PLAN_CARDS } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";

export default function PricingPage() {
  const { t } = useI18n();
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <PublicNav />

      <main style={{ flex: 1, padding: "64px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.025em", margin: "0 0 16px" }}>
              {t.pricing.title}
            </h1>
            <p style={{ fontSize: 18, color: "#475569", margin: "0 auto", maxWidth: 480, lineHeight: 1.6 }}>
              {t.pricing.subtitle}
            </p>
          </div>

          {/* Plan cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 48 }}>
            {PLAN_CARDS.map((plan) => {
              // Copy is localized (t.pricing.planCopy); price stays single-sourced in plans.ts.
              const copy = t.pricing.planCopy[plan.tier] ?? { label: plan.label, features: plan.features, cta: plan.cta };
              return (
              <div
                key={plan.tier}
                style={{
                  border: `1.5px solid ${plan.tier === "pro" ? "#6d28d9" : "#e2e8f0"}`,
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

                <Link
                  href={plan.tier === "free" ? "/signup" : "/signup"}
                  style={{
                    height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, fontWeight: 700, textDecoration: "none",
                    background: plan.tier === "pro" ? "#6d28d9" : "transparent",
                    color: plan.tier === "pro" ? "#ffffff" : "#6d28d9",
                    border: plan.tier === "pro" ? "none" : "1.5px solid #6d28d9",
                    marginTop: "auto",
                  }}
                >
                  {copy.cta}
                </Link>
              </div>
              );
            })}
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 24, textAlign: "center" }}>{t.pricing.faqTitle}</h2>
            {t.pricing.faq.map(({ q, a }) => (
              <details key={q} style={{ borderBottom: "1px solid #f1f5f9", padding: "16px 0" }}>
                <summary style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", cursor: "pointer", listStyle: "none" }}>{q}</summary>
                <p style={{ fontSize: 15, color: "#475569", margin: "10px 0 0", lineHeight: 1.65 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
