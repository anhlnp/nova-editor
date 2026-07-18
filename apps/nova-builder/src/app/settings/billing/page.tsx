"use client";
import { useRouter } from "next/navigation";
import { LS_PORTAL_URL } from "@/lib/billing/lemonsqueezy";
import { UI_VARS as C } from "@/lib/uiTheme";


export default function BillingPage() {
  const router = useRouter();

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={() => router.push("/projects")}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Billing & Invoices</h1>
        </div>

        {/* Billing address / tax info */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em", marginBottom: 12 }}>BILLING INFORMATION</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["Company name", "Tax ID / VAT", "Billing email", "Country"].map((label) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>{label.toUpperCase()}</label>
                <input
                  type="text"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  style={{
                    padding: "6px 8px", background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${C.border}`, borderRadius: 4,
                    color: C.text, fontSize: 13, fontFamily: C.font, outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
          <button style={{
            marginTop: 12, padding: "6px 16px", borderRadius: 5, border: "none",
            background: "rgba(124,58,237,0.7)", color: "#fff", fontSize: 13, fontFamily: C.font,
            cursor: "pointer", fontWeight: 600,
          }}>
            Save Billing Info
          </button>
        </div>

        {/* Invoices — issued and hosted by the payment providers */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.textMuted, letterSpacing: "0.05em" }}>
            INVOICES & RECEIPTS
          </div>
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>
              Subscription invoices (PDF, tax details) are issued by Lemon Squeezy and available in
              your customer portal. PayOS (VietQR) payments are confirmed instantly via webhook and
              receipted by your bank.
            </div>
            <a
              href={LS_PORTAL_URL}
              target="_blank"
              rel="noopener"
              style={{
                alignSelf: "flex-start", padding: "6px 16px", borderRadius: 6,
                border: "1px solid rgba(124,58,237,0.4)", background: "rgba(124,58,237,0.12)",
                color: "#c4b5fd", fontSize: 12, fontFamily: C.font, fontWeight: 600, textDecoration: "none",
              }}
            >
              Open Lemon Squeezy portal ↗
            </a>
          </div>
          <div style={{ padding: "10px 16px", fontSize: 13, color: C.textMuted, borderTop: `1px solid ${C.border}` }}>
            For refunds or disputes, contact support.
          </div>
        </div>
      </div>
    </div>
  );
}
