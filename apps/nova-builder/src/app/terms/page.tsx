"use client";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { t } = useI18n();
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <PublicNav />

      <main style={{ flex: 1, padding: "56px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>{t.legal.termsTitle}</h1>
          <p style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>{t.legal.lastUpdated}</p>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 40, fontStyle: "italic" }}>{t.legal.authoritativeNote}</p>

          {t.legal.terms.map(({ heading, body }) => (
            <section key={heading} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{heading}</h2>
              <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.75, margin: 0 }}>{body}</p>
            </section>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
