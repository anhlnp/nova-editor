"use client";
import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogoIcon } from "@/components/LogoIcon";
import { FormField } from "@/components/public/FormField";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function ResetForm() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? t.common.error);
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/login" style={{ fontSize: 15, color: "#6d28d9", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t.auth.backToLogin}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LanguageSwitcher />
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <LogoIcon width={28} height={28} />
            <span style={{ fontSize: 16, fontWeight: 800, color: "#6d28d9" }}>Nova</span>
          </Link>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px 64px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "40px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{t.auth.resetSuccessTitle}</h1>
              <p style={{ margin: "0 0 24px", fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>{t.auth.resetSuccessBody}</p>
              <Link href="/login" style={{ color: "#6d28d9", fontWeight: 600, textDecoration: "none", fontSize: 15 }}>{t.auth.backToLogin}</Link>
            </div>
          ) : (
            <>
              <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: "#0f172a", textAlign: "center" }}>{t.auth.resetTitle}</h1>
              <p style={{ margin: "0 0 28px", fontSize: 15, color: "#64748b", textAlign: "center", lineHeight: 1.6 }}>{t.auth.resetSubtitle}</p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <FormField
                  id="reset-password"
                  label={t.auth.newPasswordLabel}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />

                {error && <p style={{ fontSize: 14, color: "#ef4444", margin: 0 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={busy || !password || !token}
                  style={{
                    height: 44, borderRadius: 10, border: "none",
                    background: busy || !password || !token ? "#c4b5fd" : "#6d28d9",
                    color: "#ffffff", fontSize: 15, fontWeight: 700,
                    cursor: busy || !password || !token ? "not-allowed" : "pointer",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {busy ? t.common.loading : t.auth.resetSubmit}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
