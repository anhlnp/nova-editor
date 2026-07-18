"use client";
// Shared numeric-with-unit control (MV2, ADR-NB-020). Mirrors Webstudio's
// unit input pattern: number field + unit select. Commits on blur/Enter and
// on arrow-key nudge (Shift = ×10), like the style-panel inputs.
import { UI_VARS as C, FONT } from "@/lib/uiTheme";

export const COMMON_UNITS = ["px", "%", "rem", "em", "vw", "vh", "fr", "ch", "deg", "s", "ms"];

export function UnitInput({
  value,
  unit,
  units = COMMON_UNITS,
  onCommit,
}: {
  value: number;
  unit: string;
  units?: string[];
  onCommit: (value: number, unit: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      <input
        type="number"
        step="any"
        defaultValue={value}
        onBlur={(e) => {
          const n = parseFloat(e.target.value);
          if (!isNaN(n)) onCommit(n, unit);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const dir = e.key === "ArrowUp" ? 1 : -1;
            const cur = parseFloat((e.target as HTMLInputElement).value) || 0;
            const next = cur + dir * step;
            (e.target as HTMLInputElement).value = String(next);
            onCommit(next, unit);
          }
        }}
        style={{
          width: 52,
          padding: "3px 4px",
          minHeight: 22,
          background: C.inputBg,
          border: `1px solid ${C.border}`,
          borderRadius: 3,
          color: C.text,
          fontFamily: C.fontMono,
          fontSize: FONT.sm,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <select
        defaultValue={unit}
        onChange={(e) => onCommit(value, e.target.value)}
        style={{
          padding: "3px 2px",
          minHeight: 22,
          background: C.inputBg,
          border: `1px solid ${C.border}`,
          borderRadius: 3,
          color: C.textMuted,
          fontFamily: C.fontMono,
          fontSize: FONT.xs,
          outline: "none",
          cursor: "pointer",
        }}
      >
        {units.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </div>
  );
}
