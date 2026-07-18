"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";
import { PLAN_CARDS } from "@/lib/plans";
import { TIER_ENTITLEMENTS } from "@/lib/tiers";
import type { Tier } from "@/lib/tiers";

type UserInfo = {
  tier: Tier;
  credits: number;
  createdAt: string;
};

function PlanCard({ plan, current, onUpgrade, onPayVietQR }: {
  plan: typeof PLAN_CARDS[0];
  current: boolean;
  onUpgrade: () => void;
  onPayVietQR: () => void;
}) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${current ? "rgba(124,58,237,0.5)" : C.border}`,
      borderRadius: 12, padding: "20px 20px 16px",
      boxShadow: current ? "0 0 0 1px rgba(124,58,237,0.2)" : "none",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: FONT.md, fontWeight: 700, color: C.text }}>{plan.label}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: current ? C.accentText : C.text, marginTop: 4 }}>{plan.price}</div>
        </div>
        {current && (
          <div style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 20, padding: "2px 10px", fontSize: FONT.xs, color: C.accentText, fontWeight: 700 }}>
            Current plan
          </div>
        )}
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ fontSize: FONT.sm, color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: C.success, fontSize: FONT.md }}>✓</span> {f}
          </li>
        ))}
      </ul>

      {!current && plan.tier !== "free" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
          <button
            onClick={onUpgrade}
            style={{
              padding: "7px 0", borderRadius: 6, border: "none",
              background: "rgba(124,58,237,0.8)", color: "#fff",
              fontSize: FONT.sm, fontFamily: C.font, cursor: "pointer", fontWeight: 600,
            }}
          >
            {plan.cta} →
          </button>
          <button
            onClick={onPayVietQR}
            title="One-time annual payment via Vietnamese bank QR"
            style={{
              padding: "6px 0", borderRadius: 6,
              border: "1px solid rgba(124,58,237,0.35)", background: "transparent",
              color: C.accentText, fontSize: FONT.xs, fontFamily: C.font, cursor: "pointer", fontWeight: 600,
            }}
          >
            Pay with VietQR (PayOS)
          </button>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/account")
      .then((r) => r.json())
      .then((json: UserInfo) => setUser(json))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = (tier: string) => {
    window.location.href = `/api/billing/portal?provider=lemonsqueezy&plan=${tier}`;
  };
  const handleVietQR = (tier: string) => {
    window.location.href = `/api/billing/portal?provider=payos&plan=${tier}`;
  };

  const currentTier = user?.tier ?? "free";
  const creditsLeft = user?.credits ?? 0;
  const entitlements = TIER_ENTITLEMENTS[currentTier];
  const maxCredits = entitlements.aiCreditsPerMonth ?? 9999;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={() => router.push("/projects")}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Subscription</h1>
        </div>

        {loading && <div style={{ color: C.textMuted, fontSize: FONT.sm }}>Loading…</div>}

        {!loading && (
          <>
            {/* Usage meter */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: FONT.xs, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em" }}>
                  AI CREDITS REMAINING
                </div>
                <button
                  onClick={() => { window.location.href = "/api/billing/portal?provider=payos&plan=credits"; }}
                  title="Buy a credit top-up pack (VietQR)"
                  style={{ padding: "3px 10px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, fontSize: FONT.xs, fontFamily: C.font, cursor: "pointer", fontWeight: 600 }}
                >
                  + Top up
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: FONT.sm, fontWeight: 700, color: C.text }}>{creditsLeft.toLocaleString()} left</span>
                <span style={{ fontSize: FONT.xs, color: C.textMuted }}>{maxCredits === 9999 ? "Unlimited plan" : `${maxCredits.toLocaleString()} / month`}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: maxCredits === 9999 ? "100%" : `${Math.min(100, Math.round((creditsLeft / maxCredits) * 100))}%`,
                  background: creditsLeft / maxCredits < 0.2 ? "#f59e0b" : C.accent,
                  borderRadius: 3, transition: "width 0.4s",
                }} />
              </div>
            </div>

            {/* Plan cards — 3 displayed (free/pro/max); team on request */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {PLAN_CARDS.filter((p) => p.tier !== "team").map((plan) => (
                <PlanCard
                  key={plan.tier}
                  plan={plan}
                  current={plan.tier === currentTier}
                  onUpgrade={() => handleUpgrade(plan.tier)}
                  onPayVietQR={() => handleVietQR(plan.tier)}
                />
              ))}
            </div>

            <div style={{ marginTop: 20, fontSize: FONT.xs, color: C.textMuted, textAlign: "center" }}>
              Need a custom plan?{" "}
              <a href="mailto:support@nova.build" style={{ color: C.accent, textDecoration: "none" }}>Contact us</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
