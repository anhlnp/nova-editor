"use client";
import { useEffect, useState } from "react";
import { UI_VARS as C } from "@/lib/uiTheme";


const SHORTCUTS = [
  {
    group: "Edit",
    items: [
      { keys: ["Ctrl", "Z"], label: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], label: "Redo" },
      { keys: ["Ctrl", "C"], label: "Copy selected element" },
      { keys: ["Ctrl", "V"], label: "Paste element" },
      { keys: ["Ctrl", "D"], label: "Duplicate element" },
      { keys: ["Del"], label: "Delete selected element" },
    ],
  },
  {
    group: "Selection",
    items: [
      { keys: ["Click"], label: "Select element" },
      { keys: ["Esc"], label: "Deselect / close panel" },
      { keys: ["↑ ↓"], label: "Navigate tree rows" },
    ],
  },
  {
    group: "Canvas",
    items: [
      { keys: ["Ctrl", "+"], label: "Zoom in" },
      { keys: ["Ctrl", "−"], label: "Zoom out" },
      { keys: ["Ctrl", "0"], label: "Reset zoom to 100%" },
      { keys: ["Space"], label: "Preview mode toggle" },
    ],
  },
  {
    group: "Panels",
    items: [
      { keys: ["Ctrl", "K"], label: "Open command palette" },
      { keys: ["?"], label: "Open this shortcuts dialog" },
      { keys: ["Ctrl", "S"], label: "Save project" },
    ],
  },
  {
    group: "AI",
    items: [
      { keys: ["Ctrl", "Enter"], label: "Generate with AI (in AI panel)" },
    ],
  },
];

function Key({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "2px 7px", borderRadius: 4, minWidth: 24,
      background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
      color: C.textDim, fontSize: 12, fontFamily: "monospace", fontWeight: 600,
      lineHeight: 1.6,
    }}>
      {label}
    </span>
  );
}

export function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = SHORTCUTS.map((g) => ({
    ...g,
    items: g.items.filter((item) =>
      !search || item.label.toLowerCase().includes(search.toLowerCase()) || item.keys.some((k) => k.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: C.overlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, fontFamily: C.font }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, width: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text, flex: 1 }}>Keyboard Shortcuts</span>
          <input
            autoFocus
            type="text"
            placeholder="Search shortcuts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "5px 10px", background: "rgba(255,255,255,0.05)",
              border: `1px solid ${C.border}`, borderRadius: 6,
              color: C.text, fontSize: 13, fontFamily: C.font, outline: "none", width: 160,
            }}
          />
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: "2px 6px", lineHeight: 1 }}>×</button>
        </div>

        {/* Shortcut list */}
        <div style={{ overflowY: "auto", padding: "12px 20px 20px" }}>
          {filtered.length === 0 && (
            <div style={{ color: C.textMuted, fontSize: 12, textAlign: "center", padding: "24px 0" }}>No shortcuts match &ldquo;{search}&rdquo;</div>
          )}
          {filtered.map((group) => (
            <div key={group.group} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>
                {group.group}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {group.items.map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 12, color: C.textDim }}>{item.label}</span>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                      {item.keys.map((k, i) => (
                        <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          {i > 0 && <span style={{ fontSize: 9, color: C.textMuted }}>+</span>}
                          <Key label={k} />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 20px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textMuted, textAlign: "center" }}>
          Press <Key label="?" /> anywhere in the builder to open this dialog
        </div>
      </div>
    </div>
  );
}
