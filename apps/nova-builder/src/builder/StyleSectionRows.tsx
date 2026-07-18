"use client";
import { useCallback } from "react";
import { useStore } from "@nanostores/react";
import { $instances, $styleSources } from "@/lib/data-stores";
import { $selectedInstanceId } from "@/lib/nano-states";
import type { UnitValue, KeywordValue, ColorValue, RgbValue, StyleValue, AnyStyleDecl } from "@/lib/styleValueConversion";
import { styleValueToString } from "@/lib/styleValueConversion";
import { writeStyle } from "@/lib/styleInspectorWrite";
import { UI_VARS as C } from "@/lib/uiTheme";
import { UnitInput } from "./controls/UnitInput";
import { ColorControl } from "./controls/ColorControl";
import { CollapsibleSection } from "./controls/CollapsibleSection";

type StyleSrc = { id: string; type: string; name?: string };

// ─── Style value editor ───────────────────────────────────────────────────────

export function StyleValueEditor({
  decl,
  onWrite,
}: {
  decl: AnyStyleDecl;
  onWrite: (newValue: StyleValue) => void;
}) {
  const value = decl.value;

  if (value.type === "unit") {
    const uv = value as UnitValue;
    return (
      <UnitInput
        value={uv.value}
        unit={uv.unit}
        onCommit={(v, u) => onWrite({ type: "unit", value: v, unit: u })}
      />
    );
  }

  if (value.type === "color" || value.type === "rgb") {
    // Read both shapes (legacy Nova "color" from pre-v20 docs and SDK "rgb");
    // ColorControl always writes the SDK "rgb" shape (canvas-renderable).
    const c =
      value.type === "rgb"
        ? (value as RgbValue)
        : { ...(value as ColorValue).value, alpha: (value as ColorValue).value.alpha ?? 1 };
    return <ColorControl r={c.r} g={c.g} b={c.b} alpha={c.alpha ?? 1} onCommit={onWrite} />;
  }

  if (value.type === "keyword") {
    const kv = value as KeywordValue;
    return (
      <input
        type="text"
        defaultValue={kv.value}
        onBlur={(e) => onWrite({ type: "keyword", value: e.target.value })}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        style={{ width: "100%", padding: "1px 4px", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 3, color: C.codeVal, fontFamily: C.fontMono, fontSize: 13, outline: "none", boxSizing: "border-box" }}
      />
    );
  }

  return <span style={{ color: C.codeVal, fontFamily: C.fontMono, fontSize: 13 }}>{styleValueToString(value)}</span>;
}

// ─── Property categorization ─────────────────────────────────────────────────

export const SECTION_ORDER = ["Layout", "Size", "Spacing", "Typography", "Background", "Border", "Effects", "Advanced"] as const;
export type SectionName = (typeof SECTION_ORDER)[number];

export const SECTION_PROPS: Record<SectionName, Set<string>> = {
  Layout: new Set(["display","flexDirection","flexWrap","alignItems","justifyContent","justifyItems","alignContent","alignSelf","justifySelf","flex","flexGrow","flexShrink","flexBasis","gap","columnGap","rowGap","gridTemplateColumns","gridTemplateRows","gridColumn","gridRow","position","top","right","bottom","left"]),
  Size: new Set(["width","height","minWidth","maxWidth","minHeight","maxHeight","aspectRatio","boxSizing"]),
  Spacing: new Set(["padding","paddingTop","paddingRight","paddingBottom","paddingLeft","paddingInline","paddingBlock","margin","marginTop","marginRight","marginBottom","marginLeft","marginInline","marginBlock"]),
  Typography: new Set(["fontFamily","fontSize","fontWeight","fontStyle","lineHeight","letterSpacing","textAlign","textDecoration","textTransform","textOverflow","color","whiteSpace","wordBreak","overflowWrap"]),
  Background: new Set(["background","backgroundColor","backgroundImage","backgroundSize","backgroundPosition","backgroundRepeat","backgroundClip","backgroundAttachment"]),
  Border: new Set(["border","borderTop","borderRight","borderBottom","borderLeft","borderColor","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","borderWidth","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth","borderStyle","borderRadius","borderTopLeftRadius","borderTopRightRadius","borderBottomLeftRadius","borderBottomRightRadius","outline","outlineColor","outlineWidth","outlineStyle"]),
  Effects: new Set(["opacity","boxShadow","textShadow","transform","transformOrigin","transition","animation","cursor","overflow","overflowX","overflowY","zIndex","visibility","pointerEvents","filter","backdropFilter","mixBlendMode","isolation"]),
  Advanced: new Set(),
};

export function getSection(property: string): SectionName {
  for (const name of SECTION_ORDER) {
    if (name === "Advanced") continue;
    if (SECTION_PROPS[name].has(property)) return name;
  }
  return "Advanced";
}

// ─── Editable prop row ────────────────────────────────────────────────────────

export function EditablePropRow({
  property,
  decl,
  instanceId,
}: {
  property: string;
  decl: AnyStyleDecl;
  instanceId: string;
}) {
  const styleSources = useStore($styleSources) as Map<string, StyleSrc>;
  const src = styleSources.get(decl.styleSourceId);
  const isToken = src?.type === "token";

  const handleWrite = useCallback(
    (newValue: StyleValue) => writeStyle(instanceId, decl, newValue),
    [instanceId, decl]
  );

  return (
    <tr style={{ verticalAlign: "middle" }}>
      <td style={{ padding: "3px 8px 3px 12px", color: isToken ? "#a78bfa" : C.codeKey, fontFamily: C.fontMono, fontSize: 13, whiteSpace: "nowrap", width: "42%" }}>
        {property}
        {isToken && (
          <span title={`From token: ${src?.name}`} style={{ marginLeft: 4, fontSize: 8, background: "rgba(124,58,237,0.2)", color: "#c4b5fd", borderRadius: 3, padding: "1px 4px", verticalAlign: "middle", fontFamily: C.font, letterSpacing: "0.05em", textTransform: "uppercase" }}>T</span>
        )}
      </td>
      <td style={{ padding: "3px 8px 3px 4px", width: "58%" }}>
        <StyleValueEditor decl={decl} onWrite={handleWrite} />
      </td>
    </tr>
  );
}

// ─── Style section ────────────────────────────────────────────────────────────

export function StyleSection({
  name,
  entries,
  instanceId,
}: {
  name: SectionName;
  entries: [string, AnyStyleDecl][];
  instanceId: string;
}) {
  if (entries.length === 0) return null;
  return (
    <CollapsibleSection
      title={name}
      badge={entries.length}
      defaultOpen={name === "Layout" || name === "Size" || name === "Spacing"}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {entries.map(([prop, decl]) => (
            <EditablePropRow key={prop} property={prop} decl={decl} instanceId={instanceId} />
          ))}
        </tbody>
      </table>
    </CollapsibleSection>
  );
}

// ─── Instance header ──────────────────────────────────────────────────────────

export function InstanceHeader() {
  const instanceId = useStore($selectedInstanceId);
  const instances = useStore($instances);
  if (!instanceId) return null;
  const instance = instances.get(instanceId);
  if (!instance) return null;
  return (
    <div style={{ padding: "8px 12px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div style={{ fontSize: 12, color: C.text, fontFamily: C.font, fontWeight: 600 }}>
        {(instance as { label?: string }).label || instance.component}
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, fontFamily: C.fontMono, marginTop: 2 }}>
        {instance.component} · {instanceId.slice(0, 8)}
      </div>
    </div>
  );
}

// ─── Multi-select header ──────────────────────────────────────────────────────

export function MultiSelectHeader({ count }: { count: number }) {
  return (
    <div style={{ padding: "8px 12px 6px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div style={{ fontSize: 12, color: C.text, fontFamily: C.font, fontWeight: 600 }}>
        {count} instances selected
      </div>
      <div style={{ fontSize: 12, color: C.textMuted, fontFamily: C.font, marginTop: 2 }}>
        Showing shared properties only
      </div>
    </div>
  );
}
