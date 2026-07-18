"use client";
import { useMemo } from "react";
import { writeStyleProperty } from "@/lib/styleWriteHelper";
import {
  GradientLayer,
  ColorStop,
  GradientType,
  extractGradients,
  parseGradientLayer,
  serializeGradient,
  colorToHex,
} from "@/lib/gradientParser";
import { UI_VARS as C } from "@/lib/uiTheme";

// ── Write path ─────────────────────────────────────────────────────────────────

const writeGradient = (instanceId: string, cssValue: string) =>
  writeStyleProperty(instanceId, "backgroundImage", cssValue);

// ── Design tokens ──────────────────────────────────────────────────────────────


const numInputStyle: React.CSSProperties = {
  width: 36,
  padding: "1px 3px",
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  color: C.codeVal,
  fontFamily: C.fontMono,
  fontSize: 12,
  outline: "none",
  textAlign: "center",
};

const selectStyle: React.CSSProperties = {
  padding: "1px 4px",
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  color: C.textMuted,
  fontFamily: C.font,
  fontSize: 12,
  outline: "none",
  cursor: "pointer",
};

// ── GradientStopRow ────────────────────────────────────────────────────────────

function GradientStopRow({
  stop,
  onChange,
  onDelete,
  canDelete,
}: {
  stop: ColorStop;
  onChange: (s: ColorStop) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0" }}>
      <input
        type="color"
        value={colorToHex(stop.color)}
        onChange={e => onChange({ ...stop, color: e.target.value })}
        style={{
          width: 24, height: 20, padding: 0,
          border: `1px solid ${C.border}`, borderRadius: 3,
          background: "none", cursor: "pointer",
        }}
      />
      <input
        key={stop.position}
        type="number"
        min={0} max={100} step={1}
        defaultValue={stop.position}
        onBlur={e => {
          const n = parseFloat(e.target.value);
          if (!isNaN(n)) onChange({ ...stop, position: Math.min(100, Math.max(0, n)) });
        }}
        onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        style={numInputStyle}
      />
      <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.font }}>%</span>
      <button
        onClick={onDelete}
        disabled={!canDelete}
        style={{
          marginLeft: "auto", padding: "0 4px", height: 20,
          border: "none", background: "none",
          color: canDelete ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.1)",
          fontSize: 14, lineHeight: 1,
          cursor: canDelete ? "pointer" : "default",
        }}
        title="Remove stop"
      >
        ×
      </button>
    </div>
  );
}

// ── GradientLayerCard ──────────────────────────────────────────────────────────

function GradientLayerCard({
  gradient,
  onChange,
  onDelete,
}: {
  gradient: GradientLayer;
  onChange: (g: GradientLayer) => void;
  onDelete: () => void;
}) {
  const previewCss = serializeGradient(gradient);

  const updateStop = (i: number, s: ColorStop) => {
    const next = [...gradient.stops];
    next[i] = s;
    onChange({ ...gradient, stops: next });
  };

  const addStop = () => {
    const last = gradient.stops[gradient.stops.length - 1];
    const pos = last ? Math.min(100, last.position + 20) : 50;
    onChange({ ...gradient, stops: [...gradient.stops, { color: "#888888", position: pos }] });
  };

  const deleteStop = (i: number) =>
    onChange({ ...gradient, stops: gradient.stops.filter((_, idx) => idx !== i) });

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 5,
      overflow: "hidden",
    }}>
      <div style={{ height: 24, background: previewCss, borderBottom: `1px solid ${C.border}` }} />

      <div style={{ padding: "6px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <select
            value={gradient.type}
            onChange={e => onChange({ ...gradient, type: e.target.value as GradientType })}
            style={selectStyle}
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>

          {gradient.type === "linear" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <input
                key={gradient.angle}
                type="number"
                min={0} max={360} step={1}
                defaultValue={gradient.angle}
                onBlur={e => {
                  const n = parseFloat(e.target.value);
                  if (!isNaN(n)) onChange({ ...gradient, angle: Math.round(((n % 360) + 360) % 360) });
                }}
                onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                style={numInputStyle}
              />
              <span style={{ fontSize: 9, color: C.textMuted, fontFamily: C.font }}>deg</span>
            </div>
          ) : (
            <select
              value={gradient.radialShape}
              onChange={e => onChange({ ...gradient, radialShape: e.target.value as "ellipse" | "circle" })}
              style={selectStyle}
            >
              <option value="ellipse">Ellipse</option>
              <option value="circle">Circle</option>
            </select>
          )}

          <button
            onClick={onDelete}
            style={{
              marginLeft: "auto", padding: "0 4px", height: 20,
              border: "none", background: "none",
              color: "rgba(248,113,113,0.6)", fontSize: 14, lineHeight: 1, cursor: "pointer",
            }}
            title="Remove gradient"
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {gradient.stops.map((stop, i) => (
            <GradientStopRow
              key={i}
              stop={stop}
              onChange={s => updateStop(i, s)}
              onDelete={() => deleteStop(i)}
              canDelete={gradient.stops.length > 2}
            />
          ))}
        </div>

        <button
          onClick={addStop}
          style={{
            marginTop: 5, width: "100%", padding: "2px 0",
            border: `1px dashed ${C.border}`, borderRadius: 3,
            background: "none", color: C.textMuted, fontSize: 12,
            cursor: "pointer", fontFamily: C.font,
          }}
        >
          + Stop
        </button>
      </div>
    </div>
  );
}

// ── GradientPanel ──────────────────────────────────────────────────────────────

type GradientPanelProps = {
  instanceId: string;
  currentCss: string;
};

export function GradientPanel({ instanceId, currentCss }: GradientPanelProps) {
  const gradients = useMemo(() => {
    return extractGradients(currentCss)
      .map(g => parseGradientLayer(g))
      .filter((g): g is GradientLayer => g !== null);
  }, [currentCss]);

  const commit = (layers: GradientLayer[]) => {
    const css = layers.length === 0 ? "none" : layers.map(serializeGradient).join(", ");
    writeGradient(instanceId, css);
  };

  const addGradient = () =>
    commit([
      ...gradients,
      {
        type: "linear",
        angle: 135,
        radialShape: "ellipse",
        stops: [
          { color: "#6366f1", position: 0 },
          { color: "#8b5cf6", position: 100 },
        ],
      },
    ]);

  const updateGradient = (i: number, g: GradientLayer) => {
    const next = [...gradients];
    next[i] = g;
    commit(next);
  };

  const deleteGradient = (i: number) =>
    commit(gradients.filter((_, idx) => idx !== i));

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <div style={{
        display: "flex", alignItems: "center", padding: "5px 12px", background: C.sectionBg,
      }}>
        <span style={{
          fontSize: 12, color: C.textMuted, fontFamily: C.font,
          fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", flex: 1,
        }}>
          Gradient
          {gradients.length > 0 && (
            <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, marginLeft: 6 }}>
              {gradients.length}
            </span>
          )}
        </span>
        <button
          onClick={addGradient}
          title="Add gradient"
          style={{
            width: 20, height: 20, border: `1px solid ${C.border}`, borderRadius: 3,
            background: "none", color: C.textMuted, fontSize: 15, lineHeight: "18px",
            cursor: "pointer", padding: 0,
          }}
        >
          +
        </button>
      </div>

      {gradients.length > 0 && (
        <div style={{ padding: "4px 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {gradients.map((g, i) => (
            <GradientLayerCard
              key={i}
              gradient={g}
              onChange={gr => updateGradient(i, gr)}
              onDelete={() => deleteGradient(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
