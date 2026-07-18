"use client";
import { useRef, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $breakpoints, $styles, $styleSourceSelections } from "@/lib/data-stores";
import { updateData } from "@/lib/transactions";
import { uid } from "@/lib/uid";
import type { Breakpoint } from "@webstudio-is/sdk";
import { UI_VARS as C } from "@/lib/uiTheme";

const inputSt: React.CSSProperties = {
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  color: C.text,
  fontFamily: C.font,
  fontSize: 13,
  padding: "3px 6px",
  outline: "none",
};

export function BreakpointManager({ onClose }: { onClose: () => void }) {
  const bps = useStore($breakpoints);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const sorted = [...bps.values()].sort((a, b) => {
    // Base (no min/max) first; then sort by minWidth desc so desktop → mobile
    if (isBase(a)) return -1;
    if (isBase(b)) return 1;
    const aMin = a.minWidth ?? 0;
    const bMin = b.minWidth ?? 0;
    return bMin - aMin;
  });

  const isBase = (bp: Breakpoint) => bp.maxWidth == null && bp.minWidth == null;

  function updateLabel(id: string, label: string) {
    updateData(({ breakpoints }) => {
      const bp = breakpoints.get(id);
      if (bp) breakpoints.set(id, { ...bp, label });
    });
  }

  function updateMaxWidth(id: string, raw: string) {
    const n = parseInt(raw, 10);
    updateData(({ breakpoints }) => {
      const bp = breakpoints.get(id);
      if (bp) breakpoints.set(id, { ...bp, maxWidth: isNaN(n) || n <= 0 ? undefined : n });
    });
  }

  function updateMinWidth(id: string, raw: string) {
    const n = parseInt(raw, 10);
    updateData(({ breakpoints }) => {
      const bp = breakpoints.get(id);
      if (bp) breakpoints.set(id, { ...bp, minWidth: isNaN(n) || n <= 0 ? undefined : n });
    });
  }

  function updateCondition(id: string, raw: string) {
    updateData(({ breakpoints }) => {
      const bp = breakpoints.get(id);
      if (bp) breakpoints.set(id, { ...bp, condition: raw || undefined });
    });
  }

  function deleteBp(id: string) {
    const bp = bps.get(id);
    if (!bp || isBase(bp)) return;
    const baseBp = [...bps.values()].find((b) => isBase(b));
    updateData(({ breakpoints, styles }) => {
      breakpoints.delete(id);
      const stylesMap = styles as Map<string, any>;
      // Migrate all StyleDecls from deleted breakpoint to base breakpoint
      const toMigrate: any[] = [];
      for (const [key, decl] of stylesMap.entries()) {
        if (decl.breakpointId === id) {
          stylesMap.delete(key);
          if (baseBp) {
            toMigrate.push({ ...decl, breakpointId: baseBp.id });
          }
        }
      }
      for (const decl of toMigrate) {
        const newKey = `${decl.styleSourceId}:${decl.breakpointId}:${decl.state ?? ""}:${decl.property}`;
        if (!stylesMap.has(newKey)) {
          stylesMap.set(newKey, decl);
        }
      }
    });
  }

  function addBreakpoint() {
    const id = uid("bp_");
    updateData(({ breakpoints }) => {
      // Default to a min-width mobile-first breakpoint
      breakpoints.set(id, { id, label: "Mobile", minWidth: 0, maxWidth: 639 });
    });
  }

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 4px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        padding: "10px 12px",
        minWidth: 410,
        fontFamily: C.font,
      }}
    >
      <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
        Breakpoints
      </div>

      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 65px 65px 95px 24px", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Label</span>
        <span style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Min (px)</span>
        <span style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Max (px)</span>
        <span style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Condition</span>
        <span />
      </div>

      {sorted.map((bp) => (
        <div key={bp.id} style={{ display: "grid", gridTemplateColumns: "1fr 65px 65px 95px 24px", gap: 6, marginBottom: 5, alignItems: "center" }}>
          <input
            value={bp.label}
            onChange={(e) => updateLabel(bp.id, e.target.value)}
            style={{ ...inputSt, width: "100%" }}
          />
          <input
            type="number"
            min={0}
            value={bp.minWidth ?? ""}
            placeholder={isBase(bp) ? "—" : "px"}
            disabled={isBase(bp)}
            onChange={(e) => updateMinWidth(bp.id, e.target.value)}
            style={{ ...inputSt, width: "100%", opacity: isBase(bp) ? 0.4 : 1 }}
          />
          <input
            type="number"
            min={1}
            value={bp.maxWidth ?? ""}
            placeholder={isBase(bp) ? "All sizes" : "px"}
            disabled={isBase(bp)}
            onChange={(e) => updateMaxWidth(bp.id, e.target.value)}
            style={{ ...inputSt, width: "100%", opacity: isBase(bp) ? 0.4 : 1 }}
          />
          <input
            type="text"
            value={bp.condition ?? ""}
            placeholder={isBase(bp) ? "—" : "screen and ..."}
            disabled={isBase(bp)}
            onChange={(e) => updateCondition(bp.id, e.target.value)}
            style={{ ...inputSt, width: "100%", opacity: isBase(bp) ? 0.4 : 1 }}
          />
          <button
            onClick={() => deleteBp(bp.id)}
            disabled={isBase(bp)}
            title={isBase(bp) ? "Base breakpoint cannot be deleted" : "Delete breakpoint (migrates styles to Base)"}
            style={{
              background: "none",
              border: "none",
              color: isBase(bp) ? "rgba(255,255,255,0.1)" : C.danger,
              cursor: isBase(bp) ? "default" : "pointer",
              fontSize: 16,
              lineHeight: 1,
              padding: "0 2px",
            }}
          >×</button>
        </div>
      ))}

      <button
        onClick={addBreakpoint}
        style={{
          marginTop: 6,
          width: "100%",
          padding: "4px 0",
          background: "rgba(124,58,237,0.12)",
          border: `1px dashed rgba(124,58,237,0.4)`,
          borderRadius: 4,
          color: C.accentText,
          fontSize: 13,
          fontFamily: C.font,
          cursor: "pointer",
        }}
      >
        + Add breakpoint
      </button>
    </div>
  );
}
