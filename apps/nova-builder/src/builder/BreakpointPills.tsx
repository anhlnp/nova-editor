"use client";
import type { Breakpoint } from "@webstudio-is/sdk";
import { UI_VARS as C } from "@/lib/uiTheme";


export function bpFriendlyName(bp: Breakpoint): string {
  if (!bp.maxWidth && !bp.minWidth) return "Desktop";
  if (bp.label) {
    const lower = bp.label.toLowerCase();
    if (lower.includes("mobile") || lower.includes("phone")) return "Mobile";
    if (lower.includes("tablet")) return "Tablet";
    if (lower.includes("desktop") || lower.includes("wide") || lower.includes("xl")) return "Desktop";
    return bp.label;
  }
  if (bp.maxWidth && bp.maxWidth <= 640) return "Mobile";
  if (bp.maxWidth && bp.maxWidth <= 1024) return "Tablet";
  return "Desktop";
}

export function BreakpointPill({
  bp,
  active,
  onClick,
}: {
  bp: Breakpoint;
  active: boolean;
  onClick: () => void;
}) {
  const label = bpFriendlyName(bp);
  const pxHint = bp.maxWidth != null ? `≤${bp.maxWidth}px` : bp.minWidth != null ? `≥${bp.minWidth}px` : "All sizes";

  return (
    <button
      onClick={onClick}
      title={pxHint}
      style={{
        padding: "3px 11px",
        borderRadius: 20,
        border: `1px solid ${active ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.1)"}`,
        background: active ? "rgba(124,58,237,0.18)" : "transparent",
        color: active ? "#c4b5fd" : C.textMuted,
        fontSize: 13,
        fontFamily: C.font,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        whiteSpace: "nowrap",
        lineHeight: "18px",
        transition: "all 0.12s",
      }}
    >
      {label}
    </button>
  );
}
