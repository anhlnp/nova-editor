"use client";
// Shared color control (MV2, ADR-NB-020): swatch picker + hex label.
// Always emits the SDK rgb shape (M-S1 color-value fix).
import { UI_VARS as C, FONT } from "@/lib/uiTheme";
import { hexToRgb, rgbToHex } from "@/lib/styleValueConversion";

export function ColorControl({
  r,
  g,
  b,
  alpha = 1,
  onCommit,
}: {
  r: number;
  g: number;
  b: number;
  alpha?: number;
  onCommit: (value: { type: "rgb"; r: number; g: number; b: number; alpha: number }) => void;
}) {
  const hex = rgbToHex(r, g, b);
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <input
        type="color"
        defaultValue={hex}
        onChange={(e) => {
          const rgb = hexToRgb(e.target.value);
          if (rgb) onCommit({ type: "rgb", ...rgb, alpha });
        }}
        style={{
          width: 28,
          height: 22,
          padding: 0,
          border: `1px solid ${C.border}`,
          borderRadius: 3,
          background: "none",
          cursor: "pointer",
        }}
      />
      <span style={{ color: C.text, fontFamily: C.fontMono, fontSize: FONT.sm }}>{hex}</span>
    </div>
  );
}
