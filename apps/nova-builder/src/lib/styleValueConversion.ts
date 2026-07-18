// StyleDecl value types and CSS conversion helpers (pure — no runtime deps).

export type UnitValue = { type: "unit"; value: number; unit: string };
export type KeywordValue = { type: "keyword"; value: string };
// Legacy Nova color shape — pre-v20 documents only. New writes use RgbValue
// (the css-engine/SDK shape) so the canvas renderer and exporters understand them.
export type ColorValue = { type: "color"; value: { r: number; g: number; b: number; alpha?: number } };
export type RgbValue = { type: "rgb"; r: number; g: number; b: number; alpha: number };
export type StyleValue = UnitValue | KeywordValue | ColorValue | RgbValue | { type: string; [k: string]: unknown };

// Convert the legacy Nova color shape to the SDK rgb shape; undefined when not legacy.
// Guard on the nested {r,g,b} object — the SDK also has a "color" type (css-tree),
// which carries a `kind` discriminator instead of a value object.
export function legacyColorToRgb(value: unknown): RgbValue | undefined {
  const v = value as ColorValue;
  if (
    v?.type === "color" &&
    typeof v.value === "object" &&
    v.value !== null &&
    typeof v.value.r === "number" &&
    typeof v.value.g === "number" &&
    typeof v.value.b === "number"
  ) {
    return { type: "rgb", r: v.value.r, g: v.value.g, b: v.value.b, alpha: v.value.alpha ?? 1 };
  }
  return undefined;
}

export type AnyStyleDecl = {
  styleSourceId: string;
  breakpointId: string;
  state?: string;
  property: string;
  value: StyleValue;
};

export function styleValueToString(value: StyleValue): string {
  if (value.type === "unit") return `${(value as UnitValue).value}${(value as UnitValue).unit}`;
  if (value.type === "keyword") return String((value as KeywordValue).value ?? "");
  if (value.type === "rgb") {
    const c = value as RgbValue;
    return `rgba(${c.r},${c.g},${c.b},${c.alpha ?? 1})`;
  }
  if (value.type === "color") {
    const c = (value as ColorValue).value;
    if (c) return `rgba(${c.r},${c.g},${c.b},${c.alpha ?? 1})`;
  }
  if (value.type === "var") return `var(${(value as { value?: string }).value ?? ""})`;
  return JSON.stringify(value);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
