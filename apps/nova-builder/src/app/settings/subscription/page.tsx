"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";
import { PLAN_CARDS } from "@/lib/plans";
import { TIER_ENTITLEMENTS } from "@/lib/tiers";
import type { Tier } from "@/lib/tiers";
import PayOSCheckoutModal from "@/components/PayOSCheckoutModal";

type UserInfo = {
  tier: Tier;
  credits: number;
  createdAt: string;
};

function PlanCard({ plan, current, onPayVietQR }: {
  plan: typeof PLAN_CARDS[0];
  current: boolean;
  onPayVietQR: () => void;
}) {
  return (
    <div style={{
      background: C.card,
      border: `1.5px solid ${current ? (C.accent || "#7c3aed") : (C.border || "rgba(255,255,255,0.08)")}`,
      borderRadius: 12, padding: "24px 20px 20px",
      boxShadow: current ? `0 0 12px ${C.accent || "#7c3aed"}44` : "none",
      display: "flex", flexDirection: "column", gap: 14,
      position: "relative",
    }}>
      {plan.tier === "pro" && (
        <div style={{
          position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
          background: C.accent || "#7c3aed", color: "#fff", fontSize: 10, fontWeight: 700,
          padding: "2px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          Phổ biến nhất
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: FONT.md, fontWeight: 700, color: C.text }}>{plan.tier === "free" ? "Miễn phí" : plan.tier === "pro" ? "Pro" : plan.tier === "max" ? "Max" : "Team"}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: current ? (C.accentText || "#a78bfa") : C.text, marginTop: 4 }}>{plan.price}</div>
        </div>
        {current && (
          <div style={{
            background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 20, padding: "2px 10px", fontSize: FONT.xs, color: C.accentText || "#a78bfa", fontWeight: 700
          }}>
            Gói hiện tại
          </div>
        )}
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ fontSize: FONT.sm, color: C.textDim, display: "flex", alignItems: "flex-start", gap: 6 }}>
            <span style={{ color: C.success || "#10b981", fontSize: FONT.md, flexShrink: 0 }}>✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {current ? (
        <div style={{
          height: 38, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: FONT.sm, fontWeight: 700,
          background: "rgba(124,58,237,0.08)",
          color: C.accentText || "#a78bfa",
          border: "1px solid rgba(124,58,237,0.2)",
          marginTop: "auto",
        }}>
          Gói hiện tại
        </div>
      ) : plan.tier === "free" ? (
        <div style={{
          height: 38, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: FONT.sm, fontWeight: 600,
          background: "rgba(255,255,255,0.02)",
          color: C.textMuted,
          border: `1px solid ${C.border || "rgba(255,255,255,0.08)"}`,
          marginTop: "auto",
        }}>
          Có sẵn
        </div>
      ) : (
        <button
          onClick={onPayVietQR}
          style={{
            height: 38, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: FONT.sm, fontWeight: 700,
            background: plan.tier === "pro" ? (C.accent || "#7c3aed") : "transparent",
            color: plan.tier === "pro" ? "#ffffff" : (C.accentText || "#a78bfa"),
            border: `1.5px solid ${C.accent || "#7c3aed"}`,
            marginTop: "auto",
            cursor: "pointer",
            width: "100%",
            fontFamily: "inherit",
          }}
        >
          {plan.tier === "team" ? "Nâng cấp lên Team" : plan.tier === "max" ? "Nâng cấp lên Max" : "Nâng cấp lên Pro"}
        </button>
      )}
    </div>
  );
}



export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>("pro");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setSelectedTier(tier);
    setIsModalOpen(true);
  };

  const currentTier = user?.tier ?? "free";
  const creditsLeft = user?.credits ?? 0;
  const entitlements = TIER_ENTITLEMENTS[currentTier];
  const maxCredits = entitlements.aiCreditsPerMonth ?? 9999;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => router.push("/projects")}
              style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>
              ←
            </button>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Subscription</h1>
          </div>
          <button
            onClick={() => router.push("/settings/subscription/history")}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${C.border || "rgba(255,255,255,0.08)"}`,
              color: C.text,
              cursor: "pointer",
              fontSize: FONT.sm,
              padding: "6px 12px",
              borderRadius: 6,
              fontWeight: 600,
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = C.accent || "#7c3aed"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border || "rgba(255,255,255,0.08)"}
          >
            Lịch sử giao dịch
          </button>
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
                  onClick={() => handleVietQR("credits")}
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {PLAN_CARDS.map((plan) => (
                <PlanCard
                  key={plan.tier}
                  plan={plan}
                  current={plan.tier === currentTier}
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

      <PayOSCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tier={selectedTier}
      />
    </div>
  );
}
