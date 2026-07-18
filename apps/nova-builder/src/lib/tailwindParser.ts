// M7 — Tailwind class parser.
// Maps a subset of common Tailwind utility classes to CSS declarations so pasted
// HTML with Tailwind classes lands as real styles rather than dead className props.
// Pure + data-driven (OCP: extend the maps, no control-flow changes).

export type CssDecl = { property: string; value: string };

const SPACING: Record<string, string> = {
  "0": "0px", "0.5": "2px", "1": "4px", "1.5": "6px", "2": "8px", "2.5": "10px",
  "3": "12px", "3.5": "14px", "4": "16px", "5": "20px", "6": "24px", "7": "28px",
  "8": "32px", "9": "36px", "10": "40px", "11": "44px", "12": "48px", "14": "56px",
  "16": "64px", "20": "80px", "24": "96px", "px": "1px",
};

const FONT_SIZE: Record<string, string> = {
  xs: "12px", sm: "14px", base: "16px", lg: "18px", xl: "20px",
  "2xl": "24px", "3xl": "30px", "4xl": "36px", "5xl": "48px", "6xl": "60px",
};

const FONT_WEIGHT: Record<string, string> = {
  thin: "100", light: "300", normal: "400", medium: "500",
  semibold: "600", bold: "700", extrabold: "800", black: "900",
};

const COLORS: Record<string, string> = {
  white: "#ffffff", black: "#000000", transparent: "transparent",
  "gray-100": "#f3f4f6", "gray-200": "#e5e7eb", "gray-300": "#d1d5db",
  "gray-500": "#6b7280", "gray-700": "#374151", "gray-900": "#111827",
  "red-500": "#ef4444", "blue-500": "#3b82f6", "blue-600": "#2563eb",
  "green-500": "#22c55e", "purple-600": "#7c3aed", "indigo-600": "#4f46e5",
  "yellow-400": "#facc15",
};

// Static class → decl(s).
const STATIC: Record<string, CssDecl[]> = {
  flex: [{ property: "display", value: "flex" }],
  "inline-flex": [{ property: "display", value: "inline-flex" }],
  grid: [{ property: "display", value: "grid" }],
  block: [{ property: "display", value: "block" }],
  "inline-block": [{ property: "display", value: "inline-block" }],
  hidden: [{ property: "display", value: "none" }],
  "flex-col": [{ property: "flex-direction", value: "column" }],
  "flex-row": [{ property: "flex-direction", value: "row" }],
  "flex-wrap": [{ property: "flex-wrap", value: "wrap" }],
  "items-center": [{ property: "align-items", value: "center" }],
  "items-start": [{ property: "align-items", value: "flex-start" }],
  "items-end": [{ property: "align-items", value: "flex-end" }],
  "justify-center": [{ property: "justify-content", value: "center" }],
  "justify-between": [{ property: "justify-content", value: "space-between" }],
  "justify-start": [{ property: "justify-content", value: "flex-start" }],
  "justify-end": [{ property: "justify-content", value: "flex-end" }],
  "text-center": [{ property: "text-align", value: "center" }],
  "text-left": [{ property: "text-align", value: "left" }],
  "text-right": [{ property: "text-align", value: "right" }],
  "font-bold": [{ property: "font-weight", value: "700" }],
  italic: [{ property: "font-style", value: "italic" }],
  underline: [{ property: "text-decoration", value: "underline" }],
  rounded: [{ property: "border-radius", value: "4px" }],
  "rounded-md": [{ property: "border-radius", value: "6px" }],
  "rounded-lg": [{ property: "border-radius", value: "8px" }],
  "rounded-full": [{ property: "border-radius", value: "9999px" }],
  "w-full": [{ property: "width", value: "100%" }],
  "h-full": [{ property: "height", value: "100%" }],
  "mx-auto": [{ property: "margin-left", value: "auto" }, { property: "margin-right", value: "auto" }],
  relative: [{ property: "position", value: "relative" }],
  absolute: [{ property: "position", value: "absolute" }],
  fixed: [{ property: "position", value: "fixed" }],
};

// Prefix → (value) → decl(s). Keys ordered longest-first at match time.
const PREFIX: Array<[string, (v: string) => CssDecl[] | null]> = [
  ["p-", (v) => (SPACING[v] ? [{ property: "padding", value: SPACING[v] }] : null)],
  ["px-", (v) => (SPACING[v] ? [{ property: "padding-left", value: SPACING[v] }, { property: "padding-right", value: SPACING[v] }] : null)],
  ["py-", (v) => (SPACING[v] ? [{ property: "padding-top", value: SPACING[v] }, { property: "padding-bottom", value: SPACING[v] }] : null)],
  ["pt-", (v) => (SPACING[v] ? [{ property: "padding-top", value: SPACING[v] }] : null)],
  ["pb-", (v) => (SPACING[v] ? [{ property: "padding-bottom", value: SPACING[v] }] : null)],
  ["pl-", (v) => (SPACING[v] ? [{ property: "padding-left", value: SPACING[v] }] : null)],
  ["pr-", (v) => (SPACING[v] ? [{ property: "padding-right", value: SPACING[v] }] : null)],
  ["m-", (v) => (SPACING[v] ? [{ property: "margin", value: SPACING[v] }] : null)],
  ["mt-", (v) => (SPACING[v] ? [{ property: "margin-top", value: SPACING[v] }] : null)],
  ["mb-", (v) => (SPACING[v] ? [{ property: "margin-bottom", value: SPACING[v] }] : null)],
  ["ml-", (v) => (SPACING[v] ? [{ property: "margin-left", value: SPACING[v] }] : null)],
  ["mr-", (v) => (SPACING[v] ? [{ property: "margin-right", value: SPACING[v] }] : null)],
  ["gap-", (v) => (SPACING[v] ? [{ property: "gap", value: SPACING[v] }] : null)],
  ["text-", (v) => (FONT_SIZE[v] ? [{ property: "font-size", value: FONT_SIZE[v] }] : COLORS[v] ? [{ property: "color", value: COLORS[v] }] : null)],
  ["font-", (v) => (FONT_WEIGHT[v] ? [{ property: "font-weight", value: FONT_WEIGHT[v] }] : null)],
  ["bg-", (v) => (COLORS[v] ? [{ property: "background-color", value: COLORS[v] }] : null)],
  ["w-", (v) => (SPACING[v] ? [{ property: "width", value: SPACING[v] }] : null)],
  ["h-", (v) => (SPACING[v] ? [{ property: "height", value: SPACING[v] }] : null)],
];

// Parse one class → decls, or [] when unrecognised.
export function parseTailwindClass(cls: string): CssDecl[] {
  if (STATIC[cls]) return STATIC[cls];
  // longest prefix first
  for (const [prefix, fn] of [...PREFIX].sort((a, b) => b[0].length - a[0].length)) {
    if (cls.startsWith(prefix)) {
      const decls = fn(cls.slice(prefix.length));
      if (decls) return decls;
    }
  }
  return [];
}

// Parse a full className string → merged decls (later classes win per property).
export function parseTailwindClasses(className: string): CssDecl[] {
  const byProp = new Map<string, string>();
  for (const cls of className.trim().split(/\s+/).filter(Boolean)) {
    for (const decl of parseTailwindClass(cls)) byProp.set(decl.property, decl.value);
  }
  return [...byProp].map(([property, value]) => ({ property, value }));
}
