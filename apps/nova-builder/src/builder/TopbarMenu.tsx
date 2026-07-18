"use client";
import { useEffect, useRef } from "react";
import { UI_VARS as C } from "@/lib/uiTheme";

export type TopbarMenuItem = {
  label: string;
  title?: string;
  onClick?: () => void;
  href?: string;
  download?: boolean;
  active?: boolean;
};

type Props = {
  trigger: string;
  items: TopbarMenuItem[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function TopbarMenu({ trigger, items, open, onToggle, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        style={{
          padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontFamily: C.font, fontSize: 13,
          border: `1px solid ${open ? "rgba(124,58,237,0.45)" : "rgba(255,255,255,0.1)"}`,
          background: open ? "rgba(124,58,237,0.12)" : "transparent",
          color: open ? C.accentText : C.textMuted, fontWeight: 600,
        }}
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 200,
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "4px 0", minWidth: 160,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {items.map((item) => {
            const sharedStyle = {
              display: "block", width: "100%", padding: "7px 14px", border: "none",
              background: item.active ? "rgba(124,58,237,0.15)" : "transparent",
              color: item.active ? C.accentText : C.text,
              fontSize: 13, fontFamily: C.font, textAlign: "left" as const,
              cursor: "pointer", textDecoration: "none",
              boxSizing: "border-box" as const,
            };
            if (item.href) {
              return (
                <a key={item.label} href={item.href} download={item.download} role="menuitem" style={sharedStyle} onClick={onClose}>
                  {item.label}
                </a>
              );
            }
            return (
              <button key={item.label} role="menuitem" title={item.title} onClick={() => { item.onClick?.(); onClose(); }} style={sharedStyle}>
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
