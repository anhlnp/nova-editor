"use client";
import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { updateData } from "@/lib/transactions";
import { $selectedState } from "@/lib/nano-states";
import { uid } from "@/lib/uid";
import { UI_VARS as C } from "@/lib/uiTheme";


type UnitValue = { type: "unit"; value: number; unit: string };
type KeywordValue = { type: "keyword"; value: string };
type ColorValue = { type: "color"; value: { r: number; g: number; b: number; alpha?: number } };
type StyleValue = UnitValue | KeywordValue | ColorValue | { type: string; [k: string]: unknown };

type AnyStyleDecl = {
  styleSourceId: string;
  breakpointId: string;
  state?: string;
  property: string;
  value: StyleValue;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function parseNewValue(raw: string): StyleValue {
  const unitMatch = raw.match(/^(-?\d+\.?\d*)(px|%|rem|em|vw|vh|fr|ch|pt|deg|s|ms)$/);
  if (unitMatch) return { type: "unit", value: parseFloat(unitMatch[1]), unit: unitMatch[2] };
  if (/^#[0-9a-f]{3,8}$/i.test(raw)) {
    const rgb = hexToRgb(raw.length === 4 ? raw.replace(/([^#])/g, "$1$1") : raw) ?? { r: 0, g: 0, b: 0 };
    // SDK rgb shape — renderable by the canvas css-engine (legacy "color" is not)
    return { type: "rgb", ...rgb, alpha: 1 };
  }
  const num = Number(raw);
  if (!isNaN(num) && raw.trim() !== "") return { type: "unit", value: num, unit: "px" };
  return { type: "keyword", value: raw };
}

const CSS_PROP_SUGGESTIONS = [
  "display","flexDirection","flexWrap","alignItems","justifyContent","gap","columnGap","rowGap",
  "gridTemplateColumns","gridTemplateRows","gridColumn","gridRow","flexGrow","flexShrink","flexBasis",
  "width","height","minWidth","maxWidth","minHeight","maxHeight","aspectRatio","boxSizing",
  "padding","paddingTop","paddingRight","paddingBottom","paddingLeft",
  "margin","marginTop","marginRight","marginBottom","marginLeft",
  "position","top","right","bottom","left","zIndex",
  "fontFamily","fontSize","fontWeight","fontStyle","lineHeight","letterSpacing",
  "textAlign","textDecoration","textTransform","textOverflow","whiteSpace","wordBreak",
  "color","background","backgroundColor","backgroundImage","backgroundSize","backgroundPosition",
  "border","borderTop","borderRight","borderBottom","borderLeft",
  "borderColor","borderWidth","borderStyle","borderRadius",
  "outline","outlineColor","outlineWidth","outlineStyle",
  "opacity","boxShadow","textShadow","transform","transition","animation",
  "cursor","overflow","overflowX","overflowY","visibility","pointerEvents",
  "filter","backdropFilter","mixBlendMode","isolation","objectFit","objectPosition",
];

export function AddPropertyRow({
  instanceId,
  breakpointId,
}: {
  instanceId: string;
  breakpointId: string | undefined;
}) {
  const [propName, setPropName] = useState("");
  const [propValue, setPropValue] = useState("");
  const activeState = useStore($selectedState);

  const commit = () => {
    const name = propName.trim();
    const val = propValue.trim();
    if (!name || !val || !breakpointId) return;

    updateData(({ styles, styleSources, styleSourceSelections }) => {
      let sourceId: string;
      const selection = (styleSourceSelections as Map<string, { instanceId: string; values: string[] }>).get(instanceId);
      if (selection?.values?.length) {
        sourceId = selection.values[0];
      } else {
        sourceId = uid("src_");
        (styleSources as Map<string, unknown>).set(sourceId, { id: sourceId, type: "local" });
        (styleSourceSelections as Map<string, unknown>).set(instanceId, { instanceId, values: [sourceId] });
      }
      const decl: AnyStyleDecl = {
        styleSourceId: sourceId,
        breakpointId,
        state: activeState || undefined,
        property: name,
        value: parseNewValue(val),
      };
      const key = `${sourceId}:${breakpointId}:${activeState}:${name}`;
      (styles as Map<string, AnyStyleDecl>).set(key, decl);
    });

    setPropName("");
    setPropValue("");
  };

  const inputStyle: React.CSSProperties = {
    background: C.inputBg,
    border: `1px solid ${C.border}`,
    borderRadius: 3,
    color: C.text,
    fontFamily: C.fontMono,
    fontSize: 13,
    padding: "2px 4px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", gap: 4, padding: "6px 8px", borderTop: `1px solid ${C.border}` }}>
      <datalist id="nova-css-props">
        {CSS_PROP_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
      </datalist>
      <input
        list="nova-css-props"
        placeholder="property"
        value={propName}
        onChange={(e) => setPropName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") (e.currentTarget.nextElementSibling as HTMLInputElement | null)?.focus(); }}
        style={{ ...inputStyle, width: "45%" }}
      />
      <input
        placeholder="value"
        value={propValue}
        onChange={(e) => setPropValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        onBlur={commit}
        style={{ ...inputStyle, flex: 1 }}
      />
    </div>
  );
}
