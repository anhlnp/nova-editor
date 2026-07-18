"use client";
import { useMemo } from "react";
import { writeStyleProperty } from "@/lib/styleWriteHelper";
import { UI_VARS as C } from "@/lib/uiTheme";

// ── Types ──────────────────────────────────────────────────────────────────────

type TransitionLayer = {
  property: string;
  duration: number; // ms
  easing: string;
  delay: number;    // ms
};

export type AnimationLayer = {
  name: string;
  duration: number;   // ms
  easing: string;
  delay: number;      // ms
  iterations: string; // "1", "2", "infinite"
  direction: string;
  fillMode: string;
};

// ── Time helpers ───────────────────────────────────────────────────────────────

function parseMs(s: string): number {
  s = s.trim();
  if (s.endsWith("ms")) return parseFloat(s) || 0;
  if (s.endsWith("s"))  return (parseFloat(s) || 0) * 1000;
  return 0;
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  return `${parseFloat(s.toFixed(2))}s`;
}

// ── CSS layer splitting (paren-aware) ──────────────────────────────────────────

function splitLayers(css: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "(") depth++;
    else if (css[i] === ")") depth--;
    else if (css[i] === "," && depth === 0) {
      out.push(css.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(css.slice(start).trim());
  return out.filter(Boolean);
}

// ── Token classification ───────────────────────────────────────────────────────

const EASING_KW = new Set(["ease","ease-in","ease-out","ease-in-out","linear","step-start","step-end"]);
export const DIRECTION_KW = new Set(["normal","reverse","alternate","alternate-reverse"]);
export const FILL_KW = new Set(["none","forwards","backwards","both"]);

function isTime(s: string): boolean { return /^-?[\d.]+m?s$/i.test(s); }
function isEasing(s: string): boolean {
  return EASING_KW.has(s) || s.startsWith("cubic-bezier(") || s.startsWith("steps(");
}

function tokenize(css: string): string[] {
  const tokens: string[] = [];
  let cur = "", depth = 0;
  for (const ch of css.trim()) {
    if (ch === "(") { depth++; cur += ch; }
    else if (ch === ")") { depth--; cur += ch; }
    else if ((ch === " " || ch === "\t") && depth === 0) { if (cur) { tokens.push(cur); cur = ""; } }
    else { cur += ch; }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

// ── Transition parse/serialize ─────────────────────────────────────────────────

function parseTransitionLayer(css: string): TransitionLayer {
  const tokens = tokenize(css);
  let property = "all", duration = 300, easing = "ease", delay = 0;
  const times: string[] = [];
  let propFound = false, easingFound = false;

  for (const t of tokens) {
    if (isTime(t)) { times.push(t); }
    else if (isEasing(t) && !easingFound) { easing = t; easingFound = true; }
    else if (!propFound && t !== "none") { property = t; propFound = true; }
  }
  if (times[0]) duration = parseMs(times[0]);
  if (times[1]) delay   = parseMs(times[1]);
  return { property, duration, easing, delay };
}

function serializeTransition(l: TransitionLayer): string {
  return `${l.property} ${formatMs(l.duration)} ${l.easing} ${formatMs(l.delay)}`;
}

export function parseTransitionCss(css: string): TransitionLayer[] {
  if (!css || css === "none") return [];
  try { return splitLayers(css).map(parseTransitionLayer); } catch { return []; }
}

function serializeTransitionLayers(layers: TransitionLayer[]): string {
  if (!layers.length) return "none";
  return layers.map(serializeTransition).join(", ");
}

// ── Animation parse/serialize ──────────────────────────────────────────────────

function parseAnimationLayer(css: string): AnimationLayer {
  const tokens = tokenize(css);
  let name = "none", duration = 1000, easing = "ease", delay = 0;
  let iterations = "1", direction = "normal", fillMode = "none";
  const times: string[] = [];
  let easingFound = false;

  for (const t of tokens) {
    if (isTime(t)) { times.push(t); }
    else if (isEasing(t) && !easingFound) { easing = t; easingFound = true; }
    else if (t === "infinite" || /^\d+(\.\d+)?$/.test(t)) { iterations = t; }
    else if (DIRECTION_KW.has(t)) { direction = t; }
    else if (FILL_KW.has(t)) { fillMode = t; }
    else if (t !== "none" && t !== "running" && t !== "paused") { name = t; }
  }
  if (times[0]) duration = parseMs(times[0]);
  if (times[1]) delay   = parseMs(times[1]);
  return { name, duration, easing, delay, iterations, direction, fillMode };
}

function serializeAnimation(l: AnimationLayer): string {
  return `${l.name} ${formatMs(l.duration)} ${l.easing} ${formatMs(l.delay)} ${l.iterations} ${l.direction} ${l.fillMode}`;
}

export function parseAnimationCss(css: string): AnimationLayer[] {
  if (!css || css === "none") return [];
  try { return splitLayers(css).map(parseAnimationLayer); } catch { return []; }
}

export function serializeAnimationLayers(layers: AnimationLayer[]): string {
  if (!layers.length) return "none";
  return layers.map(serializeAnimation).join(", ");
}

// ── Write path ────────────────────────────────────────────────────────────────

const writeProperty = (instanceId: string, property: string, cssValue: string) =>
  writeStyleProperty(instanceId, property, cssValue);

// ── Design tokens ─────────────────────────────────────────────────────────────

export const baseInput: React.CSSProperties = {
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  color: C.codeVal,
  fontFamily: C.fontMono,
  fontSize: 12,
  padding: "2px 4px",
  outline: "none",
  boxSizing: "border-box" as const,
};

// ── Presets ────────────────────────────────────────────────────────────────────

export const EASING_OPTIONS = [
  "ease", "ease-in", "ease-out", "ease-in-out", "linear",
  "step-start", "step-end",
  "cubic-bezier(0.4,0,0.2,1)",
  "cubic-bezier(0.34,1.56,0.64,1)",
];

const CSS_PROPS = [
  "all","opacity","transform","color","background","background-color",
  "width","height","padding","margin","border","border-radius",
  "box-shadow","filter","left","top","right","bottom","font-size","letter-spacing",
];

export const ANIMATION_NAMES = [
  "fadeIn","fadeOut","slideInLeft","slideInRight","slideInTop","slideInBottom",
  "zoomIn","zoomOut","spin","pulse","bounce","shake",
];

// ── Small input helpers ───────────────────────────────────────────────────────

export function MsInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      key={value}
      type="number"
      step="50"
      min="0"
      style={{ ...baseInput, width: 54 }}
      defaultValue={value}
      onBlur={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(Math.max(0, n)); }}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
    />
  );
}

export function FieldLabel({ text }: { text: string }) {
  return (
    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>
      {text}
    </span>
  );
}

export function SelectField({ value, options, onChange, width = 90 }: { value: string; options: string[]; onChange: (v: string) => void; width?: number }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...baseInput, width, cursor: "pointer" }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      {!options.includes(value) && <option value={value}>{value}</option>}
    </select>
  );
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ border: "none", background: "none", color: "rgba(248,113,113,0.6)", fontSize: 16, lineHeight: 1, cursor: "pointer", padding: "0 2px", flexShrink: 0 }}
      title="Remove"
    >×</button>
  );
}

// ── Panel header ──────────────────────────────────────────────────────────────

export function PanelHeader({ label, count, onAdd }: { label: string; count: number; onAdd: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "5px 12px", background: C.sectionBg }}>
      <span style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, flex: 1 }}>
        {label}
        {count > 0 && <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, marginLeft: 6 }}>{count}</span>}
      </span>
      <button
        onClick={onAdd}
        title={`Add ${label}`}
        style={{ width: 20, height: 20, border: `1px solid ${C.border}`, borderRadius: 3, background: "none", color: C.textMuted, fontSize: 15, lineHeight: "18px", cursor: "pointer", padding: 0 }}
      >+</button>
    </div>
  );
}

// ── TransitionLayerRow ────────────────────────────────────────────────────────

function TransitionLayerRow({ layer, onChange, onDelete }: {
  layer: TransitionLayer;
  onChange: (l: TransitionLayer) => void;
  onDelete: () => void;
}) {
  const upd = (patch: Partial<TransitionLayer>) => onChange({ ...layer, ...patch });
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 7px", display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel text="Property" />
          <input
            list="nova-transition-props"
            defaultValue={layer.property}
            onBlur={(e) => upd({ property: e.target.value.trim() || "all" })}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            style={{ ...baseInput, width: "100%" }}
          />
          <datalist id="nova-transition-props">
            {CSS_PROPS.map((p) => <option key={p} value={p} />)}
          </datalist>
        </div>
        <div style={{ paddingTop: 14 }}>
          <DeleteBtn onClick={onDelete} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <FieldLabel text="Duration" />
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <MsInput value={layer.duration} onChange={(n) => upd({ duration: n })} />
            <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono }}>ms</span>
          </div>
        </div>
        <div>
          <FieldLabel text="Delay" />
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <MsInput value={layer.delay} onChange={(n) => upd({ delay: n })} />
            <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono }}>ms</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 80 }}>
          <FieldLabel text="Easing" />
          <SelectField value={layer.easing} options={EASING_OPTIONS} onChange={(v) => upd({ easing: v })} width={100} />
        </div>
      </div>
    </div>
  );
}

// ── TransitionPanel ───────────────────────────────────────────────────────────

type PanelProps = { instanceId: string; currentCss: string };

export function TransitionPanel({ instanceId, currentCss }: PanelProps) {
  const layers = useMemo(() => parseTransitionCss(currentCss), [currentCss]);

  const commit = (next: TransitionLayer[]) =>
    writeProperty(instanceId, "transition", serializeTransitionLayers(next));

  const addLayer = () => commit([...layers, { property: "all", duration: 300, easing: "ease", delay: 0 }]);
  const updateLayer = (i: number, l: TransitionLayer) => { const n = [...layers]; n[i] = l; commit(n); };
  const deleteLayer = (i: number) => commit(layers.filter((_, idx) => idx !== i));

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <PanelHeader label="Transition" count={layers.length} onAdd={addLayer} />
      {layers.length > 0 && (
        <div style={{ padding: "4px 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {layers.map((l, i) => (
            <TransitionLayerRow key={i} layer={l} onChange={(nl) => updateLayer(i, nl)} onDelete={() => deleteLayer(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
