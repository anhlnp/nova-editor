"use client";
import { UI_VARS as C } from "@/lib/uiTheme";

export type ShadowLayer = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
};

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

function parseLayer(css: string, type: "box" | "text"): ShadowLayer {
  let color = "rgba(0,0,0,0.25)";
  let rest = css.trim();
  const rgbaMatch = rest.match(/rgba?\([^)]+\)/i);
  if (rgbaMatch) {
    color = rgbaMatch[0];
    rest = rest.replace(rgbaMatch[0], "").trim();
  } else {
    const hexMatch = rest.match(/#[0-9a-f]{3,8}/i);
    if (hexMatch) { color = hexMatch[0]; rest = rest.replace(hexMatch[0], "").trim(); }
  }
  const inset = /\binset\b/i.test(rest);
  rest = rest.replace(/\binset\b/gi, "").trim();
  const nums = rest.split(/\s+/).filter(Boolean).map((s) => parseFloat(s) || 0);
  return { x: nums[0] ?? 0, y: nums[1] ?? 0, blur: nums[2] ?? 0, spread: type === "box" ? (nums[3] ?? 0) : 0, color, inset };
}

function serializeLayer(l: ShadowLayer, type: "box" | "text"): string {
  const parts: string[] = [];
  if (l.inset && type === "box") parts.push("inset");
  parts.push(`${l.x}px`, `${l.y}px`, `${l.blur}px`);
  if (type === "box") parts.push(`${l.spread}px`);
  parts.push(l.color);
  return parts.join(" ");
}

export function parseLayers(css: string, type: "box" | "text"): ShadowLayer[] {
  if (!css || css === "none") return [];
  try { return splitLayers(css).map((l) => parseLayer(l, type)); } catch { return []; }
}

export function serializeLayers(layers: ShadowLayer[], type: "box" | "text"): string {
  if (layers.length === 0) return "none";
  return layers.map((l) => serializeLayer(l, type)).join(", ");
}

function colorToHex(css: string): string {
  const m = css.match(/rgba?\(\s*(\d+)[, ]+(\d+)[, ]+(\d+)/i);
  if (m) return "#" + [m[1], m[2], m[3]].map((n) => parseInt(n).toString(16).padStart(2, "0")).join("");
  if (/^#[0-9a-f]{3,8}$/i.test(css)) return css.length === 4 ? "#" + css.slice(1).split("").map((c) => c + c).join("") : css;
  return "#000000";
}

function alphaFromColor(css: string): number {
  const m = css.match(/rgba?\(\s*\d+[, ]+\d+[, ]+\d+[, ]+([\d.]+)\s*\)/i);
  return m ? parseFloat(m[1]) : 1;
}

function hexToColorString(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const [r, g, b] = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  return alpha < 1 ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
}


const numInputStyle: React.CSSProperties = {
  background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 3,
  color: C.codeVal, fontFamily: C.fontMono, fontSize: 12,
  padding: "2px 3px", outline: "none", width: 34, textAlign: "center" as const,
};

function NumInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      key={value}
      type="number"
      step="1"
      style={numInputStyle}
      defaultValue={value}
      onBlur={(e) => { const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(n); }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const dir = e.key === "ArrowUp" ? 1 : -1;
          const cur = parseFloat((e.target as HTMLInputElement).value) || 0;
          const next = cur + dir * step;
          (e.target as HTMLInputElement).value = String(next);
          onChange(next);
        }
      }}
    />
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.font, textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", textAlign: "center" as const, marginBottom: 2 }}>
      {text}
    </span>
  );
}

type LayerRowProps = {
  layer: ShadowLayer;
  type: "box" | "text";
  onChange: (l: ShadowLayer) => void;
  onDelete: () => void;
};

export function ShadowLayerRow({ layer, type, onChange, onDelete }: LayerRowProps) {
  const upd = (patch: Partial<ShadowLayer>) => onChange({ ...layer, ...patch });

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 7px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, flexWrap: "wrap" }}>
        <div><FieldLabel text="X" /><NumInput value={layer.x} onChange={(n) => upd({ x: n })} /></div>
        <div><FieldLabel text="Y" /><NumInput value={layer.y} onChange={(n) => upd({ y: n })} /></div>
        <div><FieldLabel text="Blur" /><NumInput value={layer.blur} onChange={(n) => upd({ blur: Math.max(0, n) })} /></div>
        {type === "box" && <div><FieldLabel text="Spread" /><NumInput value={layer.spread} onChange={(n) => upd({ spread: n })} /></div>}
        <div>
          <FieldLabel text="Color" />
          <input
            type="color"
            value={colorToHex(layer.color)}
            onChange={(e) => upd({ color: hexToColorString(e.target.value, alphaFromColor(layer.color)) })}
            style={{ width: 28, height: 22, padding: 0, border: `1px solid ${C.border}`, borderRadius: 3, background: "none", cursor: "pointer", display: "block" }}
          />
        </div>
        {type === "box" && (
          <div>
            <FieldLabel text="Inset" />
            <button
              onClick={() => upd({ inset: !layer.inset })}
              style={{ width: 28, height: 22, padding: 0, border: `1px solid ${layer.inset ? C.accentBorder : C.border}`, borderRadius: 3, background: layer.inset ? C.accent : C.inputBg, color: layer.inset ? C.accentText : C.textMuted, fontSize: 9, cursor: "pointer", fontFamily: C.fontMono, display: "block" }}
            >
              {layer.inset ? "in" : "out"}
            </button>
          </div>
        )}
        <button onClick={onDelete} style={{ marginLeft: "auto", padding: "0 4px", height: 22, border: "none", background: "none", color: "rgba(248,113,113,0.6)", fontSize: 16, lineHeight: 1, cursor: "pointer", alignSelf: "flex-end" }} title="Remove shadow">×</button>
      </div>
    </div>
  );
}
