// Single source of truth for UI design tokens.
//
// Concrete palettes (DARK / ELDER / LIGHT): used only by ThemeProvider and CSS injection.
// Semantic abstraction (UI_VARS): what every component imports — values are var(--ui-*)
// strings so theme switching requires zero component changes (OCP + DIP + Elder-First).
//
// Usage:
//   import { UI_VARS as C } from "@/lib/uiTheme"
//   style={{ color: C.text }}  →  "var(--ui-text)"  →  resolved by active theme CSS vars

export const FONT = { xs: 12, sm: 13, md: 14, lg: 16 } as const;
export const TOUCH_TARGET = 44;

// ── Concrete palettes ────────────────────────────────────────────────────────

export const DARK = {
  // backgrounds
  bg: "#0a0a14",
  card: "#0f172a",
  surface: "#12121f",
  sectionBg: "rgba(255,255,255,0.03)",
  inputBg: "rgba(255,255,255,0.06)",
  hoverBg: "rgba(255,255,255,0.05)",
  cardHover: "#141428",
  // borders
  border: "rgba(255,255,255,0.08)",
  borderHover: "rgba(255,255,255,0.14)",
  borderTop: "rgba(255,255,255,0.06)",
  borderBottom: "rgba(255,255,255,0.06)",
  // text
  text: "#e2e8f0",
  textDim: "rgba(255,255,255,0.72)",
  textMuted: "rgba(255,255,255,0.60)",
  textSelected: "#ffffff",
  // accent (purple)
  accent: "#7c3aed",
  accentHover: "#6d28d9",
  accentLight: "#a78bfa",
  accentText: "#c4b5fd",
  accentBorder: "rgba(124,58,237,0.55)",
  accentBg: "rgba(124,58,237,0.22)",
  // state colors
  success: "#10b981",
  danger: "#f87171",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#60a5fa",
  activeGreen: "#34d399",
  // interactive states
  active: "rgba(124,58,237,0.18)",
  activeBorder: "rgba(124,58,237,0.70)",
  activeText: "#c4b5fd",
  bgSelected: "rgba(124,58,237,0.20)",
  bgHover: "rgba(255,255,255,0.05)",
  bgMultiSelected: "rgba(124,58,237,0.12)",
  bgDropInto: "rgba(124,58,237,0.25)",
  bgInactive: "rgba(255,255,255,0.02)",
  dropIndicator: "#7c3aed",
  // tab / pill states
  tabActive: "#c4b5fd",
  tabInactive: "rgba(255,255,255,0.50)",
  pill: "rgba(255,255,255,0.08)",
  pillHover: "rgba(255,255,255,0.14)",
  pillBorder: "rgba(255,255,255,0.12)",
  pillText: "#e2e8f0",
  // Panel code-syntax colors
  codeKey: "#93c5fd",
  codeVal: "#86efac",
  // typography tokens (not CSS vars — JS-only, seldom need theming)
  font: "var(--font-inter, system-ui, -apple-system, sans-serif)",
  fontMono: `"Cascadia Code", "Fira Code", monospace`,
  mono: "monospace",
  // misc
  overlay: "rgba(0,0,0,0.55)",
  muted: "rgba(255,255,255,0.35)",
  inputBorder: "rgba(255,255,255,0.10)",
  input: "rgba(255,255,255,0.05)",
} as const;

export const ELDER = {
  bg: "#000000",
  card: "#0a0a1a",
  surface: "#0d0d20",
  sectionBg: "rgba(255,255,255,0.05)",
  inputBg: "rgba(255,255,255,0.10)",
  hoverBg: "rgba(255,255,255,0.10)",
  cardHover: "#111128",
  border: "rgba(255,255,255,0.25)",
  borderHover: "rgba(255,255,255,0.45)",
  borderTop: "rgba(255,255,255,0.20)",
  borderBottom: "rgba(255,255,255,0.20)",
  text: "#ffffff",
  textDim: "rgba(255,255,255,0.90)",
  textMuted: "rgba(255,255,255,0.75)",
  textSelected: "#ffffff",
  accent: "#9d5ff5",
  accentHover: "#8b47e8",
  accentLight: "#c4b5fd",
  accentText: "#ddd6fe",
  accentBorder: "rgba(157,95,245,0.70)",
  accentBg: "rgba(157,95,245,0.28)",
  success: "#34d399",
  danger: "#ff6b6b",
  error: "#ff4444",
  warning: "#fbbf24",
  info: "#93c5fd",
  activeGreen: "#6ee7b7",
  active: "rgba(157,95,245,0.22)",
  activeBorder: "rgba(157,95,245,0.80)",
  activeText: "#ddd6fe",
  bgSelected: "rgba(157,95,245,0.26)",
  bgHover: "rgba(255,255,255,0.10)",
  bgMultiSelected: "rgba(157,95,245,0.18)",
  bgDropInto: "rgba(157,95,245,0.30)",
  bgInactive: "rgba(255,255,255,0.03)",
  dropIndicator: "#9d5ff5",
  tabActive: "#ddd6fe",
  tabInactive: "rgba(255,255,255,0.65)",
  pill: "rgba(255,255,255,0.12)",
  pillHover: "rgba(255,255,255,0.20)",
  pillBorder: "rgba(255,255,255,0.18)",
  pillText: "#ffffff",
  codeKey: "#bfdbfe",
  codeVal: "#a7f3d0",
  font: "var(--font-inter, system-ui, -apple-system, sans-serif)",
  fontMono: `"Cascadia Code", "Fira Code", monospace`,
  mono: "monospace",
  overlay: "rgba(0,0,0,0.70)",
  muted: "rgba(255,255,255,0.50)",
  inputBorder: "rgba(255,255,255,0.20)",
  input: "rgba(255,255,255,0.08)",
} as const;

// Light mode palette (landing pages, public-facing surfaces)
export const LIGHT = {
  bg: "#f8fafc",
  card: "#ffffff",
  surface: "#f1f5f9",
  sectionBg: "rgba(0,0,0,0.03)",
  inputBg: "rgba(0,0,0,0.04)",
  hoverBg: "rgba(0,0,0,0.04)",
  cardHover: "#f0f4ff",
  border: "rgba(0,0,0,0.10)",
  borderHover: "rgba(0,0,0,0.18)",
  borderTop: "rgba(0,0,0,0.06)",
  borderBottom: "rgba(0,0,0,0.06)",
  text: "#0f172a",
  textDim: "rgba(0,0,0,0.75)",
  textMuted: "rgba(0,0,0,0.55)",
  textSelected: "#0f172a",
  accent: "#6d28d9",
  accentHover: "#5b21b6",
  accentLight: "#7c3aed",
  accentText: "#5b21b6",
  accentBorder: "rgba(109,40,217,0.40)",
  accentBg: "rgba(109,40,217,0.10)",
  success: "#059669",
  danger: "#dc2626",
  error: "#dc2626",
  warning: "#d97706",
  info: "#2563eb",
  activeGreen: "#10b981",
  active: "rgba(109,40,217,0.12)",
  activeBorder: "rgba(109,40,217,0.60)",
  activeText: "#5b21b6",
  bgSelected: "rgba(109,40,217,0.12)",
  bgHover: "rgba(0,0,0,0.04)",
  bgMultiSelected: "rgba(109,40,217,0.08)",
  bgDropInto: "rgba(109,40,217,0.16)",
  bgInactive: "rgba(0,0,0,0.02)",
  dropIndicator: "#6d28d9",
  tabActive: "#5b21b6",
  tabInactive: "rgba(0,0,0,0.45)",
  pill: "rgba(0,0,0,0.06)",
  pillHover: "rgba(0,0,0,0.10)",
  pillBorder: "rgba(0,0,0,0.10)",
  pillText: "#0f172a",
  codeKey: "#1d4ed8",
  codeVal: "#047857",
  font: "var(--font-inter, system-ui, -apple-system, sans-serif)",
  fontMono: `"Cascadia Code", "Fira Code", monospace`,
  mono: "monospace",
  overlay: "rgba(0,0,0,0.40)",
  muted: "rgba(0,0,0,0.35)",
  inputBorder: "rgba(0,0,0,0.12)",
  input: "rgba(0,0,0,0.04)",
} as const;

// ── Semantic abstraction — what components import ────────────────────────────
//
// Every value is a CSS custom property reference.
// Components never hardcode hex; they only use these strings.
// Theme switching = change data-theme on the builder root (ThemeProvider).

export const UI_VARS = {
  bg:             "var(--ui-bg)",
  card:           "var(--ui-card)",
  surface:        "var(--ui-surface)",
  sectionBg:      "var(--ui-section-bg)",
  inputBg:        "var(--ui-input-bg)",
  hoverBg:        "var(--ui-hover-bg)",
  cardHover:      "var(--ui-card-hover)",
  border:         "var(--ui-border)",
  borderHover:    "var(--ui-border-hover)",
  borderTop:      "var(--ui-border-top)",
  borderBottom:   "var(--ui-border-bottom)",
  text:           "var(--ui-text)",
  textDim:        "var(--ui-text-dim)",
  textMuted:      "var(--ui-text-muted)",
  textSelected:   "var(--ui-text-selected)",
  accent:         "var(--ui-accent)",
  accentHover:    "var(--ui-accent-hover)",
  accentLight:    "var(--ui-accent-light)",
  accentText:     "var(--ui-accent-text)",
  accentBorder:   "var(--ui-accent-border)",
  accentBg:       "var(--ui-accent-bg)",
  success:        "var(--ui-success)",
  danger:         "var(--ui-danger)",
  error:          "var(--ui-error)",
  warning:        "var(--ui-warning)",
  info:           "var(--ui-info)",
  activeGreen:    "var(--ui-active-green)",
  active:         "var(--ui-active)",
  activeBorder:   "var(--ui-active-border)",
  activeText:     "var(--ui-active-text)",
  bgSelected:     "var(--ui-bg-selected)",
  bgHover:        "var(--ui-bg-hover)",
  bgMultiSelected:"var(--ui-bg-multi-selected)",
  bgDropInto:     "var(--ui-bg-drop-into)",
  bgInactive:     "var(--ui-bg-inactive)",
  dropIndicator:  "var(--ui-drop-indicator)",
  tabActive:      "var(--ui-tab-active)",
  tabInactive:    "var(--ui-tab-inactive)",
  pill:           "var(--ui-pill)",
  pillHover:      "var(--ui-pill-hover)",
  pillBorder:     "var(--ui-pill-border)",
  pillText:       "var(--ui-pill-text)",
  codeKey:        "var(--ui-code-key)",
  codeVal:        "var(--ui-code-val)",
  // Font tokens: not CSS vars — pass-through JS constants (no WCAG contrast concern)
  font:           "var(--font-inter, system-ui, -apple-system, sans-serif)",
  fontMono:       `"Cascadia Code", "Fira Code", monospace`,
  mono:           "monospace",
  overlay:        "var(--ui-overlay)",
  muted:          "var(--ui-muted)",
  inputBorder:    "var(--ui-input-border)",
  input:          "var(--ui-input)",
} as const;

export type UiThemeMode = "dark" | "elder" | "light";

// Structural shape shared by all palettes (widened — no literal types).
export type UiThemeTokens = {
  readonly [K in keyof typeof DARK]: string;
};

// Returns the concrete token set for a given mode.
// Used by ThemeProvider and CSS injection — NOT by components.
export function getUiTheme(mode: UiThemeMode): UiThemeTokens {
  if (mode === "elder") return ELDER;
  if (mode === "light") return LIGHT;
  return DARK;
}

// Returns CSS custom-property declarations for a theme mode (injected by ThemeProvider).
// Includes legacy nova-* aliases that redirect to the semantic --ui-* vars so that
// any globals.css consumer of --nova-* automatically tracks the active theme (DIP fix).
export function getThemeCssVars(mode: UiThemeMode): string {
  const t = getUiTheme(mode);
  return `
  --ui-bg: ${t.bg};
  --ui-card: ${t.card};
  --ui-surface: ${t.surface};
  --ui-section-bg: ${t.sectionBg};
  --ui-input-bg: ${t.inputBg};
  --ui-hover-bg: ${t.hoverBg};
  --ui-card-hover: ${t.cardHover};
  --ui-border: ${t.border};
  --ui-border-hover: ${t.borderHover};
  --ui-border-top: ${t.borderTop};
  --ui-border-bottom: ${t.borderBottom};
  --ui-text: ${t.text};
  --ui-text-dim: ${t.textDim};
  --ui-text-muted: ${t.textMuted};
  --ui-text-selected: ${t.textSelected};
  --ui-accent: ${t.accent};
  --ui-accent-hover: ${t.accentHover};
  --ui-accent-light: ${t.accentLight};
  --ui-accent-text: ${t.accentText};
  --ui-accent-border: ${t.accentBorder};
  --ui-accent-bg: ${t.accentBg};
  --ui-success: ${t.success};
  --ui-danger: ${t.danger};
  --ui-error: ${t.error};
  --ui-warning: ${t.warning};
  --ui-info: ${t.info};
  --ui-active-green: ${t.activeGreen};
  --ui-active: ${t.active};
  --ui-active-border: ${t.activeBorder};
  --ui-active-text: ${t.activeText};
  --ui-bg-selected: ${t.bgSelected};
  --ui-bg-hover: ${t.bgHover};
  --ui-bg-multi-selected: ${t.bgMultiSelected};
  --ui-bg-drop-into: ${t.bgDropInto};
  --ui-bg-inactive: ${t.bgInactive};
  --ui-drop-indicator: ${t.dropIndicator};
  --ui-tab-active: ${t.tabActive};
  --ui-tab-inactive: ${t.tabInactive};
  --ui-pill: ${t.pill};
  --ui-pill-hover: ${t.pillHover};
  --ui-pill-border: ${t.pillBorder};
  --ui-pill-text: ${t.pillText};
  --ui-code-key: ${t.codeKey};
  --ui-code-val: ${t.codeVal};
  --ui-overlay: ${t.overlay};
  --ui-muted: ${t.muted};
  --ui-input-border: ${t.inputBorder};
  --ui-input: ${t.input};
  --nova-bg: var(--ui-bg);
  --nova-card: var(--ui-card);
  --nova-surface: var(--ui-surface);
  --nova-border: var(--ui-border);
  --nova-text: var(--ui-text);
  --nova-text-muted: var(--ui-text-muted);
  --nova-accent: var(--ui-accent);
  --nova-accent-text: var(--ui-accent-text);
  --nova-accent-bg: var(--ui-accent-bg);
  --nova-success: var(--ui-success);
  --nova-danger: var(--ui-danger);
  --nova-error: var(--ui-error);
  --nova-warning: var(--ui-warning);
  --nova-info: var(--ui-info);
  --nova-input-bg: var(--ui-input-bg);
  --nova-hover-bg: var(--ui-hover-bg);
  --nova-overlay: var(--ui-overlay);
  `.trim();
}
