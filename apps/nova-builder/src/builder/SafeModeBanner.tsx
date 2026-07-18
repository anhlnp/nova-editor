"use client";
import { useStore } from "@nanostores/react";
import { $safeModeActive, $commandPaletteOpen } from "@/lib/nano-states";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";
import { useI18n } from "@/lib/i18n";

// Safe-mode banner — shown when the active page has no elements.
// Floating above the canvas, prompts the user to add their first component.
// Dismissed automatically once instances appear (atom is computed, not toggled).
export function SafeModeBanner() {
  const active = useStore($safeModeActive);
  const { t } = useI18n();

  if (!active) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 20,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "28px 36px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
        textAlign: "center",
        maxWidth: 320,
        pointerEvents: "all",
      }}
    >
      <div style={{ fontSize: 32, lineHeight: 1 }}>📄</div>
      <div style={{ fontSize: FONT.md, fontWeight: 700, color: C.text, fontFamily: C.font }}>
        {t.builder.safeModeTitle}
      </div>
      <div style={{ fontSize: FONT.sm, color: C.textMuted, fontFamily: C.font, lineHeight: 1.5 }}>
        {t.builder.safeModeBody}
      </div>
      <button
        onClick={() => $commandPaletteOpen.set(true)}
        style={{
          padding: "8px 20px",
          borderRadius: 7,
          border: "none",
          background: C.accent,
          color: "#fff",
          fontSize: FONT.sm,
          fontFamily: C.font,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {t.builder.safeModeAction}
      </button>
    </div>
  );
}
