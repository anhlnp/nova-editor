"use client";
import { useMemo } from "react";
import { writeStyleProperty } from "@/lib/styleWriteHelper";
import { UI_VARS as C } from "@/lib/uiTheme";

// ── Filter function registry ───────────────────────────────────────────────────

type FilterFn =
  | "blur" | "brightness" | "contrast" | "grayscale" | "hue-rotate"
  | "invert" | "opacity" | "saturate" | "sepia" | "drop-shadow";

const ALL_FNS: FilterFn[] = [
  "blur","brightness","contrast","grayscale","hue-rotate",
  "invert","opacity","saturate","sepia","drop-shadow",
];

type FnConfig = { unit: string; min: number; max: number; step: number; defaultValue: number };
const FN_CFG: Record<Exclude<FilterFn, "drop-shadow">, FnConfig> = {
  blur:          { unit: "px",  min: 0,    max: 100,  step: 1,    defaultValue: 4   },
  brightness:    { unit: "%",   min: 0,    max: 200,  step: 1,    defaultValue: 100 },
  contrast:      { unit: "%",   min: 0,    max: 200,  step: 1,    defaultValue: 100 },
  grayscale:     { unit: "%",   min: 0,    max: 100,  step: 1,    defaultValue: 100 },
  "hue-rotate":  { unit: "deg", min: -360, max: 360,  step: 1,    defaultValue: 0   },
  invert:        { unit: "%",   min: 0,    max: 100,  step: 1,    defaultValue: 100 },
  opacity:       { unit: "%",   min: 0,    max: 100,  step: 1,    defaultValue: 100 },
  saturate:      { unit: "%",   min: 0,    max: 200,  step: 1,    defaultValue: 100 },
  sepia:         { unit: "%",   min: 0,    max: 100,  step: 1,    defaultValue: 100 },
};

// ── Types ──────────────────────────────────────────────────────────────────────

type FilterLayer = {
  fn: FilterFn;
  value: number;    // for single-value functions
  unit: string;
  dsX: number;      // drop-shadow offset-x (px)
  dsY: number;      // drop-shadow offset-y (px)
  dsBlur: number;   // drop-shadow blur-radius (px)
  dsColor: string;  // drop-shadow color
};

function defaultLayer(fn: FilterFn): FilterLayer {
  if (fn === "drop-shadow") {
    return { fn, value: 0, unit: "px", dsX: 0, dsY: 2, dsBlur: 4, dsColor: "rgba(0,0,0,0.2)" };
  }
  const cfg = FN_CFG[fn];
  return { fn, value: cfg.defaultValue, unit: cfg.unit, dsX: 0, dsY: 2, dsBlur: 4, dsColor: "rgba(0,0,0,0.2)" };
}

// ── CSS token extractor (paren-depth aware) ────────────────────────────────────

function extractFilterTokens(css: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < css.length) {
    while (i < css.length && css[i] === " ") i++;
    const fnStart = i;
    while (i < css.length && /[\w-]/.test(css[i])) i++;
    if (i >= css.length || css[i] !== "(") { i++; continue; }
    let depth = 0;
    while (i < css.length) {
      if (css[i] === "(") depth++;
      else if (css[i] === ")") { depth--; if (depth === 0) { i++; break; } }
      i++;
    }
    tokens.push(css.slice(fnStart, i));
  }
  return tokens;
}

// ── Paren-aware space tokenizer ────────────────────────────────────────────────

function spaceSplit(s: string): string[] {
  const tokens: string[] = [];
  let cur = "", depth = 0;
  for (const ch of s.trim()) {
    if (ch === "(") { depth++; cur += ch; }
    else if (ch === ")") { depth--; cur += ch; }
    else if (ch === " " && depth === 0) { if (cur) { tokens.push(cur); cur = ""; } }
    else cur += ch;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

// ── Parse single filter token ──────────────────────────────────────────────────

function parseFilterToken(token: string): FilterLayer | null {
  const match = token.match(/^([\w-]+)\((.+)\)$/s);
  if (!match) return null;
  const fn = match[1] as FilterFn;
  const args = match[2].trim();

  if (fn === "drop-shadow") {
    const parts = spaceSplit(args);
    // Find numeric length values (first 3 with units or plain numbers)
    const nums: number[] = [];
    let colorStr = "rgba(0,0,0,0.2)";
    for (const p of parts) {
      const nm = p.match(/^(-?[\d.]+)(px|em|rem|)$/);
      if (nm && nums.length < 3) { nums.push(parseFloat(nm[1])); }
      else if (nums.length >= 2) { colorStr = p; }
    }
    return {
      fn: "drop-shadow",
      value: 0, unit: "px",
      dsX: nums[0] ?? 0,
      dsY: nums[1] ?? 2,
      dsBlur: nums[2] ?? 4,
      dsColor: colorStr,
    };
  }

  if (!Object.keys(FN_CFG).includes(fn)) return null;
  const nm = args.match(/^(-?[\d.]+)(px|%|deg|)$/);
  if (!nm) return null;
  const cfg = FN_CFG[fn as Exclude<FilterFn, "drop-shadow">];
  return { fn, value: parseFloat(nm[1]), unit: nm[2] || cfg.unit, dsX: 0, dsY: 2, dsBlur: 4, dsColor: "rgba(0,0,0,0.2)" };
}

// ── Parse / serialize ──────────────────────────────────────────────────────────

export function parseFilterCss(css: string): FilterLayer[] {
  if (!css || css === "none") return [];
  try { return extractFilterTokens(css).map(parseFilterToken).filter(Boolean) as FilterLayer[]; }
  catch { return []; }
}

function serializeFilterLayer(l: FilterLayer): string {
  if (l.fn === "drop-shadow") {
    return `drop-shadow(${l.dsX}px ${l.dsY}px ${l.dsBlur}px ${l.dsColor})`;
  }
  return `${l.fn}(${l.value}${l.unit})`;
}

function serializeLayers(layers: FilterLayer[]): string {
  return layers.length ? layers.map(serializeFilterLayer).join(" ") : "none";
}

// ── Write path ─────────────────────────────────────────────────────────────────

const writeProperty = (instanceId: string, property: string, cssValue: string) =>
  writeStyleProperty(instanceId, property, cssValue);

// ── Color helpers ──────────────────────────────────────────────────────────────

function colorToHex(color: string): string {
  if (color.startsWith("#")) return color.slice(0, 7).padEnd(7, "0");
  const m = color.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return "#000000";
  return "#" + [m[1], m[2], m[3]].map((n) => parseInt(n).toString(16).padStart(2, "0")).join("");
}

function alphaFromColor(color: string): number {
  const m = color.match(/rgba?\([^)]+,\s*([\d.]+)\)/);
  return m ? parseFloat(m[1]) : 1;
}

function hexAndAlphaToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
}

// ── Design tokens ──────────────────────────────────────────────────────────────


const baseInput: React.CSSProperties = {
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  color: "#86efac",
  fontFamily: C.fontMono,
  fontSize: 12,
  padding: "2px 4px",
  outline: "none",
  boxSizing: "border-box" as const,
};

function FieldLabel({ text }: { text: string }) {
  return (
    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", marginBottom: 2 }}>
      {text}
    </span>
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ border: "none", background: "none", color: "rgba(248,113,113,0.6)", fontSize: 16, lineHeight: 1, cursor: "pointer", padding: "0 2px", flexShrink: 0 }}
      title="Remove"
    >×</button>
  );
}

function PanelHeader({ label, count, onAdd }: { label: string; count: number; onAdd: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "5px 12px", background: C.sectionBg }}>
      <span style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, flex: 1 }}>
        {label}
        {count > 0 && <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, marginLeft: 6 }}>{count}</span>}
      </span>
      <button
        onClick={onAdd}
        title={`Add ${label} function`}
        style={{ width: 20, height: 20, border: `1px solid ${C.border}`, borderRadius: 3, background: "none", color: C.textMuted, fontSize: 15, lineHeight: "18px", cursor: "pointer", padding: 0 }}
      >+</button>
    </div>
  );
}

// ── FilterLayerRow ─────────────────────────────────────────────────────────────

function FilterLayerRow({ layer, onChange, onDelete }: {
  layer: FilterLayer;
  onChange: (l: FilterLayer) => void;
  onDelete: () => void;
}) {
  const upd = (patch: Partial<FilterLayer>) => onChange({ ...layer, ...patch });

  const handleFnChange = (fn: FilterFn) => {
    onChange(defaultLayer(fn));
  };

  const isDropShadow = layer.fn === "drop-shadow";
  const cfg = isDropShadow ? null : FN_CFG[layer.fn as Exclude<FilterFn, "drop-shadow">];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 7px", display: "flex", flexDirection: "column", gap: 5 }}>
      {/* Row 1: function select + (single-value input) + delete */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel text="Function" />
          <select
            value={layer.fn}
            onChange={(e) => handleFnChange(e.target.value as FilterFn)}
            style={{ ...baseInput, width: "100%", cursor: "pointer" }}
          >
            {ALL_FNS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {!isDropShadow && cfg && (
          <div>
            <FieldLabel text="Value" />
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <input
                key={layer.value}
                type="number"
                step={cfg.step}
                min={cfg.min}
                max={cfg.max}
                defaultValue={layer.value}
                style={{ ...baseInput, width: 52 }}
                onBlur={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) upd({ value: n }); }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              />
              <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono }}>{layer.unit}</span>
            </div>
          </div>
        )}

        <div style={{ paddingTop: isDropShadow ? 14 : 14 }}>
          <DeleteBtn onClick={onDelete} />
        </div>
      </div>

      {/* Drop-shadow sub-row: X / Y / Blur / Color */}
      {isDropShadow && (
        <div style={{ display: "flex", gap: 5, alignItems: "flex-end", flexWrap: "wrap" }}>
          {(["dsX", "dsY", "dsBlur"] as const).map((field, i) => (
            <div key={field}>
              <FieldLabel text={["X", "Y", "Blur"][i]} />
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  key={layer[field]}
                  type="number"
                  step={1}
                  defaultValue={layer[field]}
                  style={{ ...baseInput, width: 44 }}
                  onBlur={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) upd({ [field]: n }); }}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                />
                <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono }}>px</span>
              </div>
            </div>
          ))}
          <div>
            <FieldLabel text="Color" />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="color"
                value={colorToHex(layer.dsColor)}
                onChange={(e) => {
                  const alpha = alphaFromColor(layer.dsColor);
                  upd({ dsColor: hexAndAlphaToRgba(e.target.value, alpha) });
                }}
                style={{ width: 28, height: 22, border: `1px solid ${C.border}`, borderRadius: 3, cursor: "pointer", padding: 1 }}
              />
              <input
                key={alphaFromColor(layer.dsColor)}
                type="number"
                min={0}
                max={1}
                step={0.01}
                defaultValue={alphaFromColor(layer.dsColor)}
                title="Alpha"
                style={{ ...baseInput, width: 38 }}
                onBlur={(e) => {
                  const a = Math.max(0, Math.min(1, parseFloat(e.target.value)));
                  if (!isNaN(a)) upd({ dsColor: hexAndAlphaToRgba(colorToHex(layer.dsColor), a) });
                }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared panel shell ─────────────────────────────────────────────────────────

type PanelProps = { instanceId: string; currentCss: string };

function FilterPanelShell({ instanceId, currentCss, property, label }: PanelProps & { property: string; label: string }) {
  const layers = useMemo(() => parseFilterCss(currentCss), [currentCss]);

  const commit = (next: FilterLayer[]) =>
    writeProperty(instanceId, property, serializeLayers(next));

  const addLayer = () => commit([...layers, defaultLayer("blur")]);
  const updateLayer = (i: number, l: FilterLayer) => { const n = [...layers]; n[i] = l; commit(n); };
  const deleteLayer = (i: number) => commit(layers.filter((_, idx) => idx !== i));

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <PanelHeader label={label} count={layers.length} onAdd={addLayer} />
      {layers.length > 0 && (
        <div style={{ padding: "4px 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {layers.map((l, i) => (
            <FilterLayerRow key={i} layer={l} onChange={(nl) => updateLayer(i, nl)} onDelete={() => deleteLayer(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Public exports ─────────────────────────────────────────────────────────────

export function FilterPanel({ instanceId, currentCss }: PanelProps) {
  return (
    <FilterPanelShell
      instanceId={instanceId}
      currentCss={currentCss}
      property="filter"
      label="Filter"
    />
  );
}

export function BackdropFilterPanel({ instanceId, currentCss }: PanelProps) {
  return (
    <FilterPanelShell
      instanceId={instanceId}
      currentCss={currentCss}
      property="backdropFilter"
      label="Backdrop Filter"
    />
  );
}
