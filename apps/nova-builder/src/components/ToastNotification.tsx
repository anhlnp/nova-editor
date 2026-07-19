"use client";
import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $toast } from "@/lib/nano-states";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";

export function ToastNotification() {
  const toast = useStore($toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => $toast.set(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const color =
    toast.type === "error"
      ? C.danger
      : toast.type === "warning"
      ? C.warning
      : C.success;

  const icon =
    toast.type === "error"
      ? "❌"
      : toast.type === "warning"
      ? "⚠️"
      : "✅";

  return (
    <div
      role="alert"
      onClick={() => $toast.set(null)}
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        maxWidth: 360,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 18px",
        borderRadius: 10,
        background: C.surface || "rgba(30, 41, 59, 0.95)",
        border: `1px solid ${color}`,
        color: C.text || "#fff",
        fontFamily: C.font || "system-ui",
        fontSize: 13,
        boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        backdropFilter: "blur(8px)",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1, lineHeight: 1.4 }}>{toast.text}</div>
    </div>
  );
}
