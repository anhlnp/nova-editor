"use client";
import { useStore } from "@nanostores/react";
import { $customCss } from "@/lib/nano-states";
import { UI_VARS as C } from "@/lib/uiTheme";


export function CustomCSSPanel() {
  const css = useStore($customCss);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: C.font }}>
      <div style={{ padding: "8px 12px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>Custom CSS</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>
          Injected into the canvas &lt;head&gt;. Use any valid CSS rules.
        </div>
      </div>
      <textarea
        value={css}
        onChange={(e) => $customCss.set(e.target.value)}
        spellCheck={false}
        placeholder={`.my-class {\n  color: red;\n}`}
        style={{
          flex: 1,
          width: "100%",
          background: "rgba(255,255,255,0.03)",
          border: "none",
          outline: "none",
          color: C.text,
          fontFamily: C.fontMono,
          fontSize: 13,
          lineHeight: 1.6,
          padding: "10px 12px",
          resize: "none",
          boxSizing: "border-box",
          borderTop: "none",
        }}
      />
      <div style={{ padding: "6px 12px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: C.textMuted }}>
          Changes take effect instantly. Save project (Ctrl+S) to persist.
        </span>
      </div>
    </div>
  );
}
