"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { UI_VARS as C } from "@/lib/uiTheme";

const STORAGE_KEY = "nova-welcome-dismissed";

export function WelcomeCard() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{ margin: "0 0 28px", padding: "24px 28px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.card, fontFamily: C.font }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>{t.welcome.title}</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>{t.welcome.subtitle}</div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss welcome card" style={{ background: "none", border: "none", color: C.textMuted, fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
        {t.welcome.steps.map(({ title, body }, n) => (
          <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.accentBg, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: C.accentText, flexShrink: 0 }}>{n + 1}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>{body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link
          href="/builder/demo"
          style={{ height: 38, padding: "0 18px", borderRadius: 8, background: C.accent, color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", fontFamily: C.font }}
        >
          {t.welcome.tryDemo}
        </Link>
        <button onClick={dismiss} style={{ height: 38, padding: "0 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 13, cursor: "pointer", fontFamily: C.font }}>
          {t.welcome.dismiss}
        </button>
      </div>
    </div>
  );
}
