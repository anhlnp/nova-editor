"use client";
// M5 — content-model warning toast. Shows the message set on $nestingWarning when
// an insertion (DnD / paste / AI-apply) is blocked, then auto-clears after 4s.
import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $nestingWarning } from "@/lib/nano-states";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";

export function NestingToast() {
  const message = useStore($nestingWarning);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => $nestingWarning.set(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="alert"
      onClick={() => $nestingWarning.set(null)}
      style={{
        position: "fixed",
        bottom: 52,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        maxWidth: 420,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 8,
        background: C.surface,
        border: `1px solid ${C.warning}`,
        color: C.text,
        fontFamily: C.font,
        fontSize: FONT.sm,
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        cursor: "pointer",
      }}
    >
      <span style={{ flexShrink: 0, color: C.warning }}>⚠</span>
      {message}
    </div>
  );
}
