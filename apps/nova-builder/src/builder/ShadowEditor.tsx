"use client";
import { useMemo } from "react";
import { writeStyleProperty } from "@/lib/styleWriteHelper";
import { ShadowLayer, parseLayers, serializeLayers, ShadowLayerRow } from "./ShadowLayerRow";
import { UI_VARS as C } from "@/lib/uiTheme";


type PanelProps = { instanceId: string; currentCss: string };

function ShadowPanelBase({
  label,
  cssProperty,
  type,
  instanceId,
  currentCss,
}: {
  label: string;
  cssProperty: string;
  type: "box" | "text";
  instanceId: string;
  currentCss: string;
}) {
  const layers = useMemo(() => parseLayers(currentCss, type), [currentCss, type]);

  const commit = (newLayers: ShadowLayer[]) =>
    writeStyleProperty(instanceId, cssProperty, serializeLayers(newLayers, type));

  const addLayer = () => commit([...layers, { x: 0, y: 4, blur: 8, spread: 0, color: "rgba(0,0,0,0.25)", inset: false }]);
  const updateLayer = (i: number, l: ShadowLayer) => { const next = [...layers]; next[i] = l; commit(next); };
  const deleteLayer = (i: number) => commit(layers.filter((_, idx) => idx !== i));

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", padding: "5px 12px", background: C.sectionBg }}>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, flex: 1 }}>
          {label}
          {layers.length > 0 && <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, marginLeft: 6 }}>{layers.length}</span>}
        </span>
        <button onClick={addLayer} title={`Add ${label}`} style={{ width: 20, height: 20, border: `1px solid ${C.border}`, borderRadius: 3, background: "none", color: C.textMuted, fontSize: 15, lineHeight: "18px", cursor: "pointer", padding: 0 }}>+</button>
      </div>
      {layers.length > 0 && (
        <div style={{ padding: "4px 8px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {layers.map((layer, i) => (
            <ShadowLayerRow key={i} layer={layer} type={type} onChange={(l) => updateLayer(i, l)} onDelete={() => deleteLayer(i)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BoxShadowPanel({ instanceId, currentCss }: PanelProps) {
  return <ShadowPanelBase label="Box Shadow" cssProperty="boxShadow" type="box" instanceId={instanceId} currentCss={currentCss} />;
}

export function TextShadowPanel({ instanceId, currentCss }: PanelProps) {
  return <ShadowPanelBase label="Text Shadow" cssProperty="textShadow" type="text" instanceId={instanceId} currentCss={currentCss} />;
}

// Kept for backward compatibility with any direct consumers.
export function ShadowPanel({
  label,
  cssProperty,
  type,
  instanceId,
  currentCss,
}: {
  label: string;
  cssProperty: string;
  type: "box" | "text";
  instanceId: string;
  currentCss: string;
}) {
  return <ShadowPanelBase label={label} cssProperty={cssProperty} type={type} instanceId={instanceId} currentCss={currentCss} />;
}
