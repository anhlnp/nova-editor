/**
 * Cascade resolution for the style inspector.
 *
 * The WS model (reference/webstudio/apps/builder/app/shared/style-object-model.ts)
 * resolves four layers: browser defaults → preset → remote (token) → local.
 * We implement the same specificity ordering for the inspector read-path.
 *
 * Source layer order (lowest → highest specificity):
 *   preset < remote-token (values[1..]) < local (values[last-local] or new)
 *
 * This is deliberately a subset of WS — no css-tree var substitution, no
 * HTML browser-default lookup. Those are compiler concerns, not inspector concerns.
 */

import type { AnyStyleDecl } from "./styleValueConversion";

export type StyleValueSourceName = "default" | "preset" | "remote" | "local" | "overwritten";

export type StyleValueSource = {
  name: StyleValueSourceName;
  styleSourceId?: string;
  breakpointId?: string;
  state?: string;
};

export type CascadedValue = {
  value: AnyStyleDecl["value"];
  source: StyleValueSource;
};

/**
 * Returns the local style-source ID for an instance, creating one if absent.
 * Local sources have type "local" and MUST NOT be a token source (type "token").
 * When a token is at values[0], we insert a new local source at the head.
 */
export function ensureLocalSource(
  instanceId: string,
  styleSources: Map<string, { id: string; type: string }>,
  styleSourceSelections: Map<string, { instanceId: string; values: string[] }>
): string {
  const sel = styleSourceSelections.get(instanceId);
  if (sel?.values?.length) {
    // Walk from tail (highest specificity) to find an existing local source.
    // styleSourceSelections.values is ordered: last = most specific.
    for (let i = sel.values.length - 1; i >= 0; i--) {
      const id = sel.values[i];
      const src = styleSources.get(id);
      if (src?.type === "local") return id;
    }
    // No local source found — create one and prepend BEFORE any tokens.
    // Tokens live at lower indices; local source goes at the END (highest specificity).
    const newId = `src_${Math.random().toString(36).slice(2, 10)}`;
    styleSources.set(newId, { id: newId, type: "local" });
    styleSourceSelections.set(instanceId, { ...sel, values: [...sel.values, newId] });
    return newId;
  }
  // No selection at all — create fresh local source.
  const newId = `src_${Math.random().toString(36).slice(2, 10)}`;
  styleSources.set(newId, { id: newId, type: "local" });
  styleSourceSelections.set(instanceId, { instanceId, values: [newId] });
  return newId;
}

/**
 * Resolves all declared values for a property on an instance, ordered by
 * specificity (lowest first), returning the winning cascaded value + its source.
 *
 * Layer ordering mirrors WS style-object-model.ts §LAYER-STATE-BREAKPOINT-STYLESOURCE:
 *   1. base breakpoint first, active breakpoint last
 *   2. stateless first, matching states before selected state, selected state last
 *   3. styleSourceIds ordered: index 0 = lowest, last = highest
 */
export function getCascadedValue({
  instanceId,
  property,
  styles,
  styleSourceSelections,
  breakpointId,
  baseBreakpointId,
  selectedState,
  styleSources,
}: {
  instanceId: string;
  property: string;
  styles: Map<string, AnyStyleDecl>;
  styleSourceSelections: Map<string, { instanceId: string; values: string[] }>;
  breakpointId: string | undefined;
  baseBreakpointId: string | undefined;
  selectedState: string;
  styleSources: Map<string, { id: string; type: string }>;
}): CascadedValue | undefined {
  const sel = styleSourceSelections.get(instanceId);
  const sourceIds = sel?.values ?? [];

  // Breakpoints to consider: base first, then active (if different).
  const bpOrder: string[] = [];
  if (baseBreakpointId) bpOrder.push(baseBreakpointId);
  if (breakpointId && breakpointId !== baseBreakpointId) bpOrder.push(breakpointId);

  // States to consider: stateless first, then active state.
  const stateOrder: string[] = [""];
  if (selectedState) stateOrder.push(selectedState);

  let winning: CascadedValue | undefined;

  for (const bpId of bpOrder) {
    for (const state of stateOrder) {
      for (const sourceId of sourceIds) {
        const key = `${sourceId}:${bpId}:${state}:${property}`;
        const decl = styles.get(key);
        if (decl) {
          const srcType = styleSources.get(sourceId)?.type ?? "local";
          const isLocal = srcType === "local";
          const isActiveBp = bpId === breakpointId;
          const isActiveState = state === selectedState || (state === "" && !selectedState);

          let sourceName: StyleValueSourceName = "remote";
          if (isLocal && isActiveBp && isActiveState) sourceName = "local";
          else if (isLocal) sourceName = "remote";
          else if (!isActiveBp || !isActiveState) sourceName = "remote";

          winning = {
            value: decl.value,
            source: {
              name: sourceName,
              styleSourceId: sourceId,
              breakpointId: bpId,
              state: state || undefined,
            },
          };
        }
      }
    }
  }

  return winning;
}

/**
 * Returns true when the property on this instance has a value coming from
 * a token source (i.e., source is "remote" and styleSourceId is a token).
 */
export function hasTokenValue({
  instanceId,
  property,
  styles,
  styleSourceSelections,
  styleSources,
  breakpointId,
  baseBreakpointId,
  selectedState,
}: {
  instanceId: string;
  property: string;
  styles: Map<string, AnyStyleDecl>;
  styleSourceSelections: Map<string, { instanceId: string; values: string[] }>;
  styleSources: Map<string, { id: string; type: string }>;
  breakpointId: string | undefined;
  baseBreakpointId: string | undefined;
  selectedState: string;
}): string | undefined {
  const cascaded = getCascadedValue({
    instanceId, property, styles, styleSourceSelections,
    breakpointId, baseBreakpointId, selectedState, styleSources,
  });
  if (!cascaded) return undefined;
  const srcId = cascaded.source.styleSourceId;
  if (!srcId) return undefined;
  const src = styleSources.get(srcId);
  if (src?.type === "token") return srcId;
  return undefined;
}
