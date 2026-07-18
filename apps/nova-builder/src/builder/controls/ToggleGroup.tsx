"use client";
// Shared toggle-group control (MV2, ADR-NB-020): a row of mutually-exclusive
// pills. Wraps instead of clipping (broken-layout register V-2).
import { UI_VARS as C, FONT } from "@/lib/uiTheme";

export type ToggleOption<V extends string> = { label: string; value: V };

export function ToggleGroup<V extends string>({
  options,
  value,
  onChange,
  mono = false,
}: {
  options: ToggleOption<V>[];
  value: V;
  onChange: (value: V) => void;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            style={{
              padding: "3px 8px",
              minHeight: 22,
              borderRadius: 10,
              border: `1px solid ${active ? C.accentBorder : C.border}`,
              background: active ? C.accentBg : "transparent",
              color: active ? C.accentText : C.textMuted,
              fontSize: FONT.xs,
              fontFamily: mono ? C.fontMono : C.font,
              fontWeight: active ? 700 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              lineHeight: "16px",
              transition: "all 0.1s",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
