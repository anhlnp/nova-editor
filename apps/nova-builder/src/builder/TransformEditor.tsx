"use client";
import { useMemo } from "react";
import { writeStyleProperty } from "@/lib/styleWriteHelper";
import { UI_VARS as C } from "@/lib/uiTheme";

// ── Types ──────────────────────────────────────────────────────────────────────

type TranslateT = { x: number; y: number };
type RotateT = { x: number; y: number; z: number };
type ScaleT = { x: number; y: number };
type SkewT = { x: number; y: number };
type OtherFn = { fn: string; args: string };

type Parsed = {
  translate: TranslateT | null;
  rotate: RotateT | null;
  scale: ScaleT | null;
  skew: SkewT | null;
  other: OtherFn[];
};

// ── CSS parsing ────────────────────────────────────────────────────────────────

function num(args: string, idx = 0): number {
  return parseFloat(args.split(/[\s,]+/)[idx] ?? "0") || 0;
}

export function parseTransformCss(css: string): Parsed {
  const result: Parsed = { translate: null, rotate: null, scale: null, skew: null, other: [] };
  if (!css || css === "none") return result;

  let tx = 0, ty = 0, hasT = false;
  let rx = 0, ry = 0, rz = 0, hasR = false;
  let sx = 1, sy = 1, hasS = false;
  let skX = 0, skY = 0, hasSk = false;

  const re = /([\w-]+)\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const fn = m[1];
    const args = m[2].trim();
    if (fn === "translateX")    { tx = num(args); hasT = true; }
    else if (fn === "translateY")   { ty = num(args); hasT = true; }
    else if (fn === "translate")    { tx = num(args, 0); ty = num(args, 1); hasT = true; }
    else if (fn === "translate3d")  { tx = num(args, 0); ty = num(args, 1); hasT = true; }
    else if (fn === "translateZ")   { hasT = true; /* z not shown */ }
    else if (fn === "rotate" || fn === "rotateZ") { rz = num(args); hasR = true; }
    else if (fn === "rotateX")  { rx = num(args); hasR = true; }
    else if (fn === "rotateY")  { ry = num(args); hasR = true; }
    else if (fn === "rotate3d") { hasR = true; /* complex, preserved in other */ result.other.push({ fn, args }); }
    else if (fn === "scaleX")   { sx = num(args); hasS = true; }
    else if (fn === "scaleY")   { sy = num(args); hasS = true; }
    else if (fn === "scale")    { sx = num(args, 0); sy = num(args, 1) || num(args, 0); hasS = true; }
    else if (fn === "scale3d")  { sx = num(args, 0); sy = num(args, 1); hasS = true; }
    else if (fn === "scaleZ")   { hasS = true; }
    else if (fn === "skewX")    { skX = num(args); hasSk = true; }
    else if (fn === "skewY")    { skY = num(args); hasSk = true; }
    else if (fn === "skew")     { skX = num(args, 0); skY = num(args, 1); hasSk = true; }
    else { result.other.push({ fn, args }); }
  }

  if (hasT)  result.translate = { x: tx, y: ty };
  if (hasR)  result.rotate    = { x: rx, y: ry, z: rz };
  if (hasS)  result.scale     = { x: sx, y: sy };
  if (hasSk) result.skew      = { x: skX, y: skY };
  return result;
}

// ── CSS serialization ──────────────────────────────────────────────────────────

function fmt(n: number): string {
  // Drop trailing zeros: 1.50 → "1.5", 1.0 → "1"
  return parseFloat(n.toFixed(3)).toString();
}

export function serializeParsed(p: Parsed): string {
  const parts: string[] = [];

  if (p.translate) {
    parts.push(`translateX(${fmt(p.translate.x)}px)`, `translateY(${fmt(p.translate.y)}px)`);
  }
  if (p.rotate) {
    if (p.rotate.x !== 0) parts.push(`rotateX(${fmt(p.rotate.x)}deg)`);
    if (p.rotate.y !== 0) parts.push(`rotateY(${fmt(p.rotate.y)}deg)`);
    parts.push(`rotate(${fmt(p.rotate.z)}deg)`);
  }
  if (p.scale) {
    parts.push(`scaleX(${fmt(p.scale.x)})`, `scaleY(${fmt(p.scale.y)})`);
  }
  if (p.skew) {
    parts.push(`skewX(${fmt(p.skew.x)}deg)`, `skewY(${fmt(p.skew.y)}deg)`);
  }
  for (const { fn, args } of p.other) {
    parts.push(`${fn}(${args})`);
  }

  return parts.length === 0 ? "none" : parts.join(" ");
}

// ── Write path ────────────────────────────────────────────────────────────────

const writeTransform = (instanceId: string, cssValue: string) =>
  writeStyleProperty(instanceId, "transform", cssValue);

// ── Design tokens ─────────────────────────────────────────────────────────────


const numInputStyle: React.CSSProperties = {
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  color: C.codeVal,
  fontFamily: C.fontMono,
  fontSize: 12,
  padding: "2px 3px",
  outline: "none",
  width: 38,
  textAlign: "center" as const,
};

// ── NumInput ──────────────────────────────────────────────────────────────────

function NumInput({ value, onChange, step = 1 }: { value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <input
      key={value}
      type="number"
      step={step}
      style={numInputStyle}
      defaultValue={value}
      onBlur={(e) => {
        const n = parseFloat(e.target.value);
        if (!isNaN(n)) onChange(n);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const s = e.shiftKey ? step * 10 : step;
          const dir = e.key === "ArrowUp" ? 1 : -1;
          const cur = parseFloat((e.target as HTMLInputElement).value) || 0;
          const next = parseFloat((cur + dir * s).toFixed(3));
          (e.target as HTMLInputElement).value = String(next);
          onChange(next);
        }
      }}
    />
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <span style={{
      fontSize: 9, color: C.textMuted, fontFamily: C.font,
      textTransform: "uppercase" as const, letterSpacing: "0.05em",
      display: "block", textAlign: "center" as const, marginBottom: 2,
    }}>
      {text}
    </span>
  );
}

function Field({ label, value, onChange, step }: { label: string; value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <div>
      <FieldLabel text={label} />
      <NumInput value={value} onChange={onChange} step={step} />
    </div>
  );
}

// ── Section rows ──────────────────────────────────────────────────────────────

function SectionHeader({
  icon, label, active, onAdd, onRemove,
}: { icon: string; label: string; active: boolean; onAdd: () => void; onRemove: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "4px 8px",
      background: active ? C.card : C.bgInactive,
    }}>
      <span style={{ fontSize: 13, width: 16, textAlign: "center" as const, flexShrink: 0, color: active ? C.text : C.textMuted }}>
        {icon}
      </span>
      <span style={{
        fontSize: 13, fontFamily: C.font,
        color: active ? C.text : C.textMuted,
        flex: 1, fontWeight: active ? 500 : 400,
      }}>
        {label}
      </span>
      {active ? (
        <button
          onClick={onRemove}
          title={`Remove ${label}`}
          style={{ border: "none", background: "none", color: "rgba(248,113,113,0.55)", fontSize: 16, lineHeight: 1, cursor: "pointer", padding: "0 2px" }}
        >×</button>
      ) : (
        <button
          onClick={onAdd}
          title={`Add ${label}`}
          style={{ border: `1px solid ${C.border}`, borderRadius: 3, background: "none", color: C.textMuted, fontSize: 15, lineHeight: "18px", width: 20, height: 20, cursor: "pointer", padding: 0 }}
        >+</button>
      )}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 5, padding: "3px 8px 7px 30px", flexWrap: "wrap", alignItems: "flex-end" }}>
      {children}
    </div>
  );
}

// ── TransformPanel ─────────────────────────────────────────────────────────────

type Props = { instanceId: string; currentCss: string };

export function TransformPanel({ instanceId, currentCss }: Props) {
  const parsed = useMemo(() => parseTransformCss(currentCss), [currentCss]);

  const commit = (patch: Partial<Parsed>) => {
    const next = { ...parsed, ...patch };
    writeTransform(instanceId, serializeParsed(next));
  };

  const activeCount = [parsed.translate, parsed.rotate, parsed.scale, parsed.skew]
    .filter(Boolean).length;

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", padding: "5px 12px", background: C.sectionBg }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, flex: 1 }}>
          Transform
          {activeCount > 0 && (
            <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, marginLeft: 6 }}>{activeCount}</span>
          )}
        </span>
      </div>

      {/* Translate */}
      <SectionHeader
        icon="↔"
        label="Translate"
        active={parsed.translate !== null}
        onAdd={() => commit({ translate: { x: 0, y: 0 } })}
        onRemove={() => commit({ translate: null })}
      />
      {parsed.translate && (
        <FieldRow>
          <Field label="X" value={parsed.translate.x} step={1}
            onChange={(n) => commit({ translate: { ...parsed.translate!, x: n } })} />
          <Field label="Y" value={parsed.translate.y} step={1}
            onChange={(n) => commit({ translate: { ...parsed.translate!, y: n } })} />
          <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono, alignSelf: "center", marginTop: 12 }}>px</span>
        </FieldRow>
      )}

      {/* Rotate */}
      <div style={{ borderTop: `1px solid ${C.border}` }}>
        <SectionHeader
          icon="↻"
          label="Rotate"
          active={parsed.rotate !== null}
          onAdd={() => commit({ rotate: { x: 0, y: 0, z: 0 } })}
          onRemove={() => commit({ rotate: null })}
        />
        {parsed.rotate && (
          <FieldRow>
            <Field label="X" value={parsed.rotate.x} step={1}
              onChange={(n) => commit({ rotate: { ...parsed.rotate!, x: n } })} />
            <Field label="Y" value={parsed.rotate.y} step={1}
              onChange={(n) => commit({ rotate: { ...parsed.rotate!, y: n } })} />
            <Field label="Z" value={parsed.rotate.z} step={1}
              onChange={(n) => commit({ rotate: { ...parsed.rotate!, z: n } })} />
            <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono, alignSelf: "center", marginTop: 12 }}>deg</span>
          </FieldRow>
        )}
      </div>

      {/* Scale */}
      <div style={{ borderTop: `1px solid ${C.border}` }}>
        <SectionHeader
          icon="⇱"
          label="Scale"
          active={parsed.scale !== null}
          onAdd={() => commit({ scale: { x: 1, y: 1 } })}
          onRemove={() => commit({ scale: null })}
        />
        {parsed.scale && (
          <FieldRow>
            <Field label="X" value={parsed.scale.x} step={0.01}
              onChange={(n) => commit({ scale: { ...parsed.scale!, x: n } })} />
            <Field label="Y" value={parsed.scale.y} step={0.01}
              onChange={(n) => commit({ scale: { ...parsed.scale!, y: n } })} />
            <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono, alignSelf: "center", marginTop: 12 }}>×</span>
          </FieldRow>
        )}
      </div>

      {/* Skew */}
      <div style={{ borderTop: `1px solid ${C.border}` }}>
        <SectionHeader
          icon="⟋"
          label="Skew"
          active={parsed.skew !== null}
          onAdd={() => commit({ skew: { x: 0, y: 0 } })}
          onRemove={() => commit({ skew: null })}
        />
        {parsed.skew && (
          <FieldRow>
            <Field label="X" value={parsed.skew.x} step={1}
              onChange={(n) => commit({ skew: { ...parsed.skew!, x: n } })} />
            <Field label="Y" value={parsed.skew.y} step={1}
              onChange={(n) => commit({ skew: { ...parsed.skew!, y: n } })} />
            <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.fontMono, alignSelf: "center", marginTop: 12 }}>deg</span>
          </FieldRow>
        )}
      </div>
    </div>
  );
}
