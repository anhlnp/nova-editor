"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogoIcon } from "@/components/LogoIcon";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function VerifyEmail() {
  const { t } = useI18n();
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"verifying" | "ok" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React 18 double-effect
    ran.current = true;
    if (!token) {
      setState("error");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setError(body.error ?? t.common.error);
          setState("error");
          return;
        }
        setState("ok");
      } catch {
        setState("error");
      }
    })();
  }, [token, t.common.error]);

  const title =
    state === "verifying" ? t.auth.verifyingEmail
    : state === "ok" ? t.auth.emailVerifiedTitle
    : t.auth.verifyFailedTitle;

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LanguageSwitcher />
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <LogoIcon width={28} height={28} />
            <span style={{ fontSize: 16, fontWeight: 800, color: "#6d28d9" }}>Nova</span>
          </Link>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px 64px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "40px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {state === "verifying" ? "⏳" : state === "ok" ? "✅" : "⚠️"}
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{title}</h1>
          {state === "ok" && <p style={{ margin: "0 0 24px", fontSize: 15, color: "#64748b", lineHeight: 1.6 }}>{t.auth.emailVerifiedBody}</p>}
          {state === "error" && error && <p style={{ margin: "0 0 24px", fontSize: 15, color: "#ef4444", lineHeight: 1.6 }}>{error}</p>}
          {state !== "verifying" && (
            <Link href="/projects" style={{ color: "#6d28d9", fontWeight: 600, textDecoration: "none", fontSize: 15 }}>
              {t.auth.continueToProjects}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
