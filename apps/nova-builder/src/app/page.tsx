"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);

  const isLoading = status === "loading";

  async function handleStart() {
    const trimmed = prompt.trim();
    if (!trimmed || creating) return;

    if (!session) {
      sessionStorage.setItem("nova-pending-prompt", trimmed);
      router.push("/login");
      return;
    }

    setCreating(true);
    try {
      const name = trimmed.slice(0, 48) + (trimmed.length > 48 ? "…" : "");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("failed");
      const { id } = (await res.json()) as { id: string };
      sessionStorage.setItem("nova-pending-prompt", trimmed);
      router.push(`/builder/${id}`);
    } catch {
      setCreating(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <PublicNav />

      {/* Hero */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px 80px", textAlign: "center" }}>
        {/* Decorative glow — subtle on white */}
        <div style={{ position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(109,40,217,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, width: "100%" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: "#f3e8ff", border: "1px solid #ddd6fe", fontSize: 13, fontWeight: 600, color: "#6d28d9", marginBottom: 28 }}>
            {t.landing.badge}
          </div>

          <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.025em", color: "#0f172a", margin: "0 0 20px" }}>
            {t.landing.titleLead}{" "}
            <span style={{ color: "#6d28d9" }}>{t.landing.titleAccent}</span>
          </h1>

          <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.65, margin: "0 auto 40px", maxWidth: 480 }}>
            {t.landing.subtitle}
          </p>

          {/* Prompt box */}
          <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <label htmlFor="site-prompt" className="sr-only">{t.landing.promptSrLabel}</label>
            <textarea
              id="site-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleStart();
                }
              }}
              placeholder={t.landing.promptPlaceholder}
              rows={3}
              style={{ width: "100%", background: "transparent", border: "none", padding: "20px 20px 12px", fontSize: 16, color: "#0f172a", resize: "none", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 16px", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#475569" }}>{t.landing.pressEnter}</span>
              <button
                onClick={handleStart}
                disabled={!prompt.trim() || creating || isLoading}
                style={{
                  height: 44, padding: "0 24px", borderRadius: 10, border: "none",
                  background: !prompt.trim() || creating || isLoading ? "#c4b5fd" : "#6d28d9",
                  color: "#ffffff", fontSize: 15, fontWeight: 700, cursor: !prompt.trim() || creating || isLoading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
                }}
              >
                {creating ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    {t.landing.building}
                  </>
                ) : (
                  t.landing.startBuildingFree
                )}
              </button>
            </div>
          </div>

          {/* Example chips */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 }}>
            <span style={{ fontSize: 13, color: "#475569", display: "flex", alignItems: "center" }}>{t.landing.tryLabel}</span>
            {t.landing.examples.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setPrompt(ex.prompt)}
                style={{
                  height: 36, padding: "0 14px", borderRadius: 999, border: "1.5px solid #e2e8f0",
                  background: "#ffffff", color: "#374151", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {ex.icon} {ex.label}
              </button>
            ))}
          </div>

          {/* Trust line */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px 24px", marginTop: 32 }}>
            {t.landing.trustBadges.map((b) => (
              <span key={b} style={{ fontSize: 14, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#10b981" }}>✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Features strip */}
      <section style={{ borderTop: "1px solid #f1f5f9", padding: "48px 32px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
          {t.landing.features.map(({ icon, title, body }) => (
            <div key={title} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section style={{ padding: "56px 32px", textAlign: "center", background: "#ffffff" }}>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>
          {t.landing.ctaTitle}
        </h2>
        <p style={{ fontSize: 17, color: "#475569", margin: "0 auto 32px", maxWidth: 400 }}>
          {t.landing.ctaSubtitle}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/signup"
            style={{ height: 52, padding: "0 32px", borderRadius: 10, background: "#6d28d9", color: "#ffffff", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          >
            {t.landing.getStartedFree}
          </Link>
          <Link
            href="/builder/demo"
            style={{ height: 52, padding: "0 32px", borderRadius: 10, border: "1.5px solid #d1d5db", color: "#374151", fontSize: 16, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          >
            {t.landing.tryDemo}
          </Link>
        </div>
      </section>

      <PublicFooter />

      {/* Inline keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }`}</style>
    </div>
  );
}
