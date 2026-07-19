"use client";
import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { LogoIcon } from "@/components/LogoIcon";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormField } from "@/components/public/FormField";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function SignupForm() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const backHref = callbackUrl.startsWith("/builder/") ? callbackUrl : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError(t.auth.passwordsNoMatch); return; }
    if (password.length < 8) { setError(t.auth.passwordTooShort); return; }

    setBusy(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim() || null }),
    });

    if (!res.ok) {
      const { error: msg } = (await res.json()) as { error?: string };
      setError(msg ?? t.auth.registrationFailed);
      setBusy(false);
      return;
    }

    setBusy(false);
    window.location.href = `/login?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Top nav strip */}
      <div style={{ padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href={backHref} style={{ fontSize: 15, color: "#6d28d9", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t.auth.back}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LanguageSwitcher />
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <LogoIcon width={28} height={28} />
            <span style={{ fontSize: 16, fontWeight: 800, color: "#6d28d9" }}>Nova</span>
          </Link>
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 16px 64px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "36px 36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: "#0f172a", textAlign: "center" }}>{t.auth.signUpTitle}</h1>
          <p style={{ margin: "0 0 24px", fontSize: 15, color: "#64748b", textAlign: "center" }}>{t.auth.allMethodsGiveSameAccount}</p>

          {/* OAuth buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => signIn("google", { callbackUrl })}
              style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#ffffff", color: "#0f172a", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <GoogleIcon />
              {t.auth.continueWithGoogle}
            </button>
            <button
              onClick={() => signIn("github", { callbackUrl })}
              style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 10, background: "#ffffff", color: "#0f172a", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <GitHubIcon />
              {t.auth.continueWithGithub}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
            <span style={{ fontSize: 13, color: "#475569" }}>{t.auth.orSignUpWithEmail}</span>
            <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FormField
              id="signup-name"
              label={t.auth.nameOptionalLabel}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.auth.namePlaceholder}
              autoComplete="name"
            />
            <FormField
              id="signup-email"
              label={t.auth.emailLabel}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
            <FormField
              id="signup-password"
              label={t.auth.passwordMinLabel}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.passwordMinPlaceholder}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <FormField
              id="signup-confirm"
              label={t.auth.confirmPasswordLabel}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t.auth.confirmPasswordPlaceholder}
              required
              autoComplete="new-password"
            />

            {error && <p style={{ fontSize: 14, color: "#ef4444", margin: 0 }}>{error}</p>}

            <button
              type="submit"
              disabled={busy || !email || !password || !confirm}
              style={{
                height: 44, borderRadius: 10, border: "none",
                background: busy || !email || !password || !confirm ? "#c4b5fd" : "#6d28d9",
                color: "#ffffff", fontSize: 15, fontWeight: 700,
                cursor: busy || !email || !password || !confirm ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "system-ui, -apple-system, sans-serif", marginTop: 4,
              }}
            >
              {busy ? (
                <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> {t.common.loading}</>
              ) : (
                t.auth.createAccount
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 14, color: "#64748b", margin: "20px 0 0" }}>
            {t.auth.alreadyHaveAccount}{" "}
            <Link href="/login" style={{ color: "#6d28d9", fontWeight: 600, textDecoration: "none" }}>{t.nav.login}</Link>
          </p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Footer legal */}
      <p style={{ textAlign: "center", fontSize: 13, color: "#475569", padding: "0 16px 24px" }}>
        {t.auth.termsNotice}
      </p>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0f172a">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
