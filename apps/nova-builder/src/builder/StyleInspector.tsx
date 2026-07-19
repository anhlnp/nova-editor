"use client";
import { useStore } from "@nanostores/react";
import {
  BoxShadowPanel,
  TextShadowPanel,
  TransformPanel,
  TransitionPanel,
  AnimationPanel,
  FilterPanel,
  BackdropFilterPanel,
  GradientPanel,
  GridContainerPanel,
  GridChildPanel,
} from "./style-panels/panelRegistry";
import { StateSelector } from "./StyleStateSelector";
import { AddPropertyRow } from "./StyleAddProperty";
import {
  StyleSection,
  InstanceHeader,
  MultiSelectHeader,
  SECTION_ORDER,
  getSection,
} from "./StyleSectionRows";
import type { AnyStyleDecl } from "@/lib/styleValueConversion";
import { styleValueToString } from "@/lib/styleValueConversion";
import { getDeclsForInstance } from "@/lib/styleInspectorWrite";
import {
  $styles,
  $styleSourceSelections,
  $styleSources,
  $breakpoints,
} from "@/lib/data-stores";
import {
  $selectedInstanceId,
  $selectedBreakpoint,
  $selectedState,
  $multiSelectedInstanceIds,
} from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { UI_VARS as C, UI_VARS as DARK } from "@/lib/uiTheme";
import { useI18n } from "@/lib/i18n";
import { GridPositionControl } from "./GridPositionControl";
import { writeGridColumnStyle } from "@/lib/styleWriteHelper";


type Src = { id: string; type: string; name?: string };
type Sel = { instanceId: string; values: string[] };

/** Shows applied token chips + a cascade-source indicator for the current instance. */
function TokenChipsRow({ instanceId }: { instanceId: string }) {
  const { t } = useI18n();
  const styleSources = useStore($styleSources) as Map<string, Src>;
  const styleSourceSelections = useStore($styleSourceSelections) as Map<string, Sel>;

  const sel = styleSourceSelections.get(instanceId);
  const values = sel?.values ?? [];

  const appliedTokens = values
    .map((id) => styleSources.get(id))
    .filter((s): s is Src => !!s && s.type === "token");

  // Determine active cascade indicator
  const hasLocal = values.some((id) => styleSources.get(id)?.type === "local");
  const cascadeLabel = hasLocal
    ? t.builder.cascadeLocal
    : appliedTokens.length > 0
    ? `${t.builder.cascadeToken}: ${appliedTokens[appliedTokens.length - 1].name}`
    : t.builder.cascadeDefault;

  function removeToken(tokenId: string) {
    updateData(({ styleSourceSelections: sels }) => {
      const s = (sels as Map<string, Sel>).get(instanceId);
      if (!s) return;
      (sels as Map<string, Sel>).set(instanceId, {
        ...s,
        values: s.values.filter((v) => v !== tokenId),
      });
    });
  }

  return (
    <div style={{
      padding: "6px 12px",
      borderBottom: `1px solid ${DARK.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 6,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: DARK.textMuted, fontFamily: DARK.font }}>
          Cascade: <strong style={{ color: DARK.text }}>{cascadeLabel}</strong>
        </span>
      </div>

      {appliedTokens.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {appliedTokens.map((tok) => (
            <span
              key={tok.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                background: DARK.accentBg,
                border: `1px solid ${DARK.accentBorder}`,
                borderRadius: 3,
                padding: "1px 6px",
                fontSize: 11,
                color: DARK.accentText,
                fontFamily: DARK.font,
              }}
            >
              ◆ {tok.name ?? tok.id}
              <button
                onClick={() => removeToken(tok.id)}
                title="Remove token from instance"
                style={{
                  background: "none",
                  border: "none",
                  color: DARK.textMuted,
                  cursor: "pointer",
                  fontSize: 12,
                  lineHeight: 1,
                  padding: 0,
                  marginLeft: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const DEDICATED = new Set([
  "boxShadow","textShadow","transform","transition","animation",
  "filter","backdropFilter","backgroundImage",
  "gridTemplateColumns","gridTemplateRows","gridColumn","gridRow",
]);

export function StyleInspector() {
  const instanceId = useStore($selectedInstanceId);
  const multiSelectedIds = useStore($multiSelectedInstanceIds);
  const styles = useStore($styles);
  const styleSourceSelections = useStore($styleSourceSelections);
  const breakpoint = useStore($selectedBreakpoint);
  const allBreakpoints = useStore($breakpoints);
  const selectedState = useStore($selectedState);

  const isMultiSelect = multiSelectedIds.length > 1;

  if (!instanceId) {
    return (
      <div style={{ height: "100%", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: 16, fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "system-ui, sans-serif" }}>
          Select an instance to inspect its styles.
        </div>
      </div>
    );
  }

  const bpId = breakpoint?.id;
  const baseBpId = [...allBreakpoints.values()].find((bp) => !bp.minWidth && !bp.maxWidth)?.id;

  const typedStyles = styles as Map<string, AnyStyleDecl>;
  const typedSelections = styleSourceSelections as Map<string, { instanceId: string; values: string[] }>;

  let byProperty: Map<string, AnyStyleDecl>;

  if (isMultiSelect) {
    const allDecls = multiSelectedIds.map((id) =>
      getDeclsForInstance(id, typedStyles, typedSelections, bpId, baseBpId, selectedState)
    );
    const primaryDecls = allDecls[0];
    byProperty = new Map<string, AnyStyleDecl>();
    for (const [prop, decl] of primaryDecls) {
      if (allDecls.every((m) => m.has(prop))) byProperty.set(prop, decl);
    }
  } else {
    byProperty = getDeclsForInstance(instanceId, typedStyles, typedSelections, bpId, baseBpId, selectedState);
  }

  const css = (prop: string) => { const d = byProperty.get(prop); return d ? styleValueToString(d.value) : ""; };

  const boxShadowCss = css("boxShadow");
  const textShadowCss = css("textShadow");
  const transformCss = css("transform");
  const transitionCss = css("transition");
  const animationCss = css("animation");
  const filterCss = css("filter");
  const backdropFilterCss = css("backdropFilter");
  const backgroundImageCss = css("backgroundImage");
  const gridTemplateColumnsCss = css("gridTemplateColumns");
  const gridTemplateRowsCss = css("gridTemplateRows");
  const gridColumnCss = css("gridColumn");
  const gridRowCss = css("gridRow");

  // Parse gridColumn into colStart + span for GridPositionControl
  function parseGridColumnCss(raw: string): { colStart: number; span: number } | null {
    if (!raw) return null;
    // Formats: "3 / span 4", "3 / 7", "3"
    const spanMatch = raw.match(/(\d+)\s*\/\s*span\s+(\d+)/);
    if (spanMatch) return { colStart: parseInt(spanMatch[1]), span: parseInt(spanMatch[2]) };
    const lineMatch = raw.match(/(\d+)\s*\/\s*(\d+)/);
    if (lineMatch) {
      const start = parseInt(lineMatch[1]);
      const end = parseInt(lineMatch[2]);
      return { colStart: start, span: Math.max(1, end - start) };
    }
    const singleMatch = raw.match(/^(\d+)$/);
    if (singleMatch) return { colStart: parseInt(singleMatch[1]), span: 1 };
    return null;
  }
  const gridChildPos = parseGridColumnCss(gridColumnCss);

  const grouped = new Map<string, [string, AnyStyleDecl][]>(SECTION_ORDER.map((n) => [n, []]));
  for (const [prop, decl] of byProperty) {
    if (DEDICATED.has(prop)) continue;
    grouped.get(getSection(prop))!.push([prop, decl]);
  }
  for (const entries of grouped.values()) entries.sort(([a], [b]) => a.localeCompare(b));

  const emptyMessage = isMultiSelect
    ? "No shared styles across all selected instances."
    : selectedState !== "" ? `No ${selectedState} styles at this breakpoint.` : "No styles at this breakpoint.";

  return (
    <div style={{ height: "100%", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {isMultiSelect ? <MultiSelectHeader count={multiSelectedIds.length} /> : <InstanceHeader />}
      <StateSelector />
      {!isMultiSelect && <TokenChipsRow instanceId={instanceId} />}
      {/* Grid position control — shown when element has an explicit grid-column CSS value */}
      {!isMultiSelect && gridChildPos && (
        <GridPositionControl
          key={`${instanceId}-gpc`}
          colStart={gridChildPos.colStart}
          span={gridChildPos.span}
          onChange={(colStart, span) => {
            writeGridColumnStyle(instanceId, colStart, span);
          }}
        />
      )}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          {byProperty.size === 0 ? (
            <div style={{ padding: "12px", fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "system-ui, sans-serif" }}>{emptyMessage}</div>
          ) : (
            SECTION_ORDER.map((name) => (
              <StyleSection key={name} name={name} entries={grouped.get(name) ?? []} instanceId={instanceId} />
            ))
          )}
        </div>
        <TransformPanel key={`${instanceId}-transform-${transformCss}`} instanceId={instanceId} currentCss={transformCss} />
        <BoxShadowPanel key={`${instanceId}-box-${boxShadowCss}`} instanceId={instanceId} currentCss={boxShadowCss} />
        <TextShadowPanel key={`${instanceId}-text-${textShadowCss}`} instanceId={instanceId} currentCss={textShadowCss} />
        <TransitionPanel key={`${instanceId}-transition-${transitionCss}`} instanceId={instanceId} currentCss={transitionCss} />
        <AnimationPanel key={`${instanceId}-animation-${animationCss}`} instanceId={instanceId} currentCss={animationCss} />
        <FilterPanel key={`${instanceId}-filter-${filterCss}`} instanceId={instanceId} currentCss={filterCss} />
        <BackdropFilterPanel key={`${instanceId}-backdrop-${backdropFilterCss}`} instanceId={instanceId} currentCss={backdropFilterCss} />
        <GradientPanel key={`${instanceId}-gradient-${backgroundImageCss}`} instanceId={instanceId} currentCss={backgroundImageCss} />
        <GridContainerPanel key={`${instanceId}-grid-container-${gridTemplateColumnsCss}-${gridTemplateRowsCss}`} instanceId={instanceId} columnsCss={gridTemplateColumnsCss} rowsCss={gridTemplateRowsCss} />
        <GridChildPanel key={`${instanceId}-grid-child-${gridRowCss}`} instanceId={instanceId} rowCss={gridRowCss} />
        {!isMultiSelect && <AddPropertyRow instanceId={instanceId} breakpointId={bpId} />}
      </div>
    </div>
  );
}
