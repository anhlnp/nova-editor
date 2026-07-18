"use client";
// Shared collapsible panel section (MV2, ADR-NB-020). Mirrors Webstudio's
// collapsible-section pattern: uppercase header + count badge, native <details>.
import type { ReactNode } from "react";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";

export function CollapsibleSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} style={{ borderBottom: `1px solid ${C.border}` }}>
      <summary
        style={{
          padding: "7px 12px",
          minHeight: 28,
          boxSizing: "border-box",
          fontSize: FONT.xs,
          fontFamily: C.font,
          color: C.textMuted,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          cursor: "pointer",
          userSelect: "none",
          listStyle: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {title}
        {badge !== undefined && (
          <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, marginLeft: "auto" }}>
            {badge}
          </span>
        )}
      </summary>
      {children}
    </details>
  );
}
