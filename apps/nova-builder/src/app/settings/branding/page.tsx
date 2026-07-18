"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UI_VARS as C } from "@/lib/uiTheme";


export default function BrandingPage() {
  const router = useRouter();
  const [logo, setLogo] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/branding");
      const json = await res.json() as { logo: string | null; name: string | null };
      setLogo(json.logo ?? "");
      setName(json.name ?? "");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo: logo.trim() || null, name: name.trim() || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box" as const,
    background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
    borderRadius: 6, color: C.text, fontSize: 12, fontFamily: C.font,
    padding: "8px 12px", outline: "none",
  };
  const labelStyle = { fontSize: 13, color: C.textMuted, fontFamily: C.font,
    fontWeight: 600 as const, letterSpacing: "0.05em", display: "block" as const, marginBottom: 6 };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: 32, fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={() => router.back()}
            style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18 }}>
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>White-label Branding</h1>
        </div>

        {loading ? (
          <div style={{ fontSize: 12, color: C.textMuted }}>Loading…</div>
        ) : (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Brand name */}
            <div>
              <label style={labelStyle}>BRAND NAME</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Company (replaces Nova in the editor)"
                style={inputStyle}
              />
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
                Shown in the builder topbar and exported HTML instead of &quot;Nova&quot;.
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label style={labelStyle}>LOGO URL</label>
              <input
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://example.com/logo.svg"
                style={inputStyle}
              />
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
                Enter a public image URL. Displayed at 24px height in the builder topbar.
              </div>
            </div>

            {/* Preview */}
            {(logo || name) && (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8, fontWeight: 600 }}>PREVIEW</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {logo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={logo} alt="Brand logo" style={{ height: 24, objectFit: "contain" }} />
                  ) : null}
                  {name ? (
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#a78bfa" }}>{name}</span>
                  ) : null}
                </div>
              </div>
            )}

            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "9px 0", borderRadius: 6, border: "none",
                background: saved ? C.success : C.accent,
                color: "#fff", fontSize: 13, fontFamily: C.font,
                cursor: saving ? "default" : "pointer", fontWeight: 700,
                transition: "background 0.2s", opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Branding"}
            </button>
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
          White-label branding removes Nova references from the builder interface and exported HTML.
          Available on Pro and higher plans.
        </div>
      </div>
    </div>
  );
}
