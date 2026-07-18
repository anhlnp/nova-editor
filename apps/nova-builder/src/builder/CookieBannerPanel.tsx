"use client";
import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { $projectMeta } from "@/lib/data-stores";
import { UI_VARS as C } from "@/lib/uiTheme";


const inputStyle: React.CSSProperties = {
  width: "100%", padding: "6px 8px",
  background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
  borderRadius: 5, color: C.text, fontSize: 13, fontFamily: C.font,
  outline: "none", boxSizing: "border-box",
};

type ConsentConfig = {
  enabled: boolean;
  message: string;
  acceptLabel: string;
  declineLabel: string;
  position: "bottom" | "top" | "bottom-left" | "bottom-right";
  bgColor: string;
  textColor: string;
  buttonColor: string;
};

const DEFAULTS: ConsentConfig = {
  enabled: false,
  message: "We use cookies to improve your experience. By continuing you accept our cookie policy.",
  acceptLabel: "Accept",
  declineLabel: "Decline",
  position: "bottom",
  bgColor: "#1e1e2e",
  textColor: "#e2e8f0",
  buttonColor: "#7c3aed",
};

export function CookieBannerPanel() {
  const meta = useStore($projectMeta);
  const [config, setConfig] = useState<ConsentConfig>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!meta?.id) return;
    fetch(`/api/projects/${meta.id}`)
      .then((r) => r.json())
      .then((json: { cookieConsent?: ConsentConfig }) => {
        if (json.cookieConsent) setConfig({ ...DEFAULTS, ...json.cookieConsent });
      })
      .catch(() => {});
  }, [meta?.id]);

  const set = useCallback(<K extends keyof ConsentConfig>(key: K, value: ConsentConfig[K]) => {
    setConfig((c) => ({ ...c, [key]: value }));
  }, []);

  const save = async () => {
    if (!meta?.id) return;
    await fetch(`/api/projects/${meta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookieConsent: config }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: 12, fontFamily: C.font, color: C.text, overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, marginBottom: 14, letterSpacing: "0.04em" }}>
        COOKIE CONSENT / GDPR
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <input
          type="checkbox"
          id="cookie-enabled"
          checked={config.enabled}
          onChange={(e) => set("enabled", e.target.checked)}
          style={{ accentColor: C.accent }}
        />
        <label htmlFor="cookie-enabled" style={{ fontSize: 13, color: C.text, cursor: "pointer", fontWeight: 600 }}>
          Enable cookie consent banner
        </label>
      </div>

      {config.enabled && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em" }}>MESSAGE</label>
            <textarea
              value={config.message}
              onChange={(e) => set("message", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em", display: "block", marginBottom: 3 }}>ACCEPT LABEL</label>
              <input style={inputStyle} value={config.acceptLabel} onChange={(e) => set("acceptLabel", e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em", display: "block", marginBottom: 3 }}>DECLINE LABEL</label>
              <input style={inputStyle} value={config.declineLabel} onChange={(e) => set("declineLabel", e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, letterSpacing: "0.05em" }}>POSITION</label>
            <select
              value={config.position}
              onChange={(e) => set("position", e.target.value as ConsentConfig["position"])}
              style={{ ...inputStyle }}
            >
              {(["bottom", "top", "bottom-left", "bottom-right"] as const).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {(["bgColor", "textColor", "buttonColor"] as const).map((key) => (
              <div key={key}>
                <label style={{ fontSize: 9, color: C.textMuted, fontWeight: 600, letterSpacing: "0.04em", display: "block", marginBottom: 3 }}>
                  {key === "bgColor" ? "BG" : key === "textColor" ? "TEXT" : "BUTTON"}
                </label>
                <input type="color" value={config[key]} onChange={(e) => set(key, e.target.value)}
                  style={{ width: "100%", height: 28, border: `1px solid ${C.border}`, borderRadius: 4, cursor: "pointer", background: "none" }} />
              </div>
            ))}
          </div>

          {/* Preview */}
          <div style={{ background: config.bgColor, borderRadius: 6, padding: "10px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: config.textColor, flex: 1, lineHeight: 1.4 }}>{config.message}</span>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button style={{ padding: "4px 10px", borderRadius: 4, border: "none", background: config.buttonColor, color: "#fff", fontSize: 12, cursor: "pointer" }}>
                {config.acceptLabel}
              </button>
              <button style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${config.buttonColor}`, background: "transparent", color: config.textColor, fontSize: 12, cursor: "pointer" }}>
                {config.declineLabel}
              </button>
            </div>
          </div>
        </>
      )}

      <button
        onClick={save}
        style={{
          width: "100%", padding: "7px 0", borderRadius: 5, border: "none",
          background: saved ? "rgba(5,150,105,0.8)" : "rgba(124,58,237,0.8)",
          color: "#fff", fontSize: 12, fontFamily: C.font, cursor: "pointer", fontWeight: 600,
        }}
      >
        {saved ? "✓ Saved!" : "Save Banner Settings"}
      </button>
    </div>
  );
}
