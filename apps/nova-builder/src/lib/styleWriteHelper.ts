/**
 * Shared write-path for all CSS property editors (ShadowEditor, TransformEditor, etc.).
 *
 * Centralised here so each editor imports `writeStyleProperty` instead of
 * defining its own uid / ensureSrc / write functions — satisfying DIP:
 * editors depend on this abstraction, not on concrete atom-mutation details.
 */

// ── Grid position type (shared with canvas and sidebar) ────────────────────
export type GridPosition = {
  colStart: number; // 1-based column start (1–12)
  span: number;     // column span (1–12)
  rowStart?: number;  // optional 1-based row start
  rowSpan?: number;   // optional row span
};

import { updateData } from "@/lib/transactions";
import {
  $selectedBreakpoint,
  $selectedState,
  $multiSelectedInstanceIds,
} from "@/lib/nano-states";
import { uid } from "@/lib/uid";

// ── Internal types (not exported — implementation detail) ──────────────────

type Src = { id: string; type: string };
type Sel = { instanceId: string; values: string[] };

// ── Helpers ────────────────────────────────────────────────────────────────

function ensureSrc(
  targetId: string,
  srcs: Map<string, Src>,
  sels: Map<string, Sel>
): string {
  const sel = sels.get(targetId);
  if (sel?.values?.length) {
    const id = sel.values[0];
    if (srcs.has(id)) return id;
  }
  const newId = uid("src_");
  srcs.set(newId, { id: newId, type: "local" });
  sels.set(
    targetId,
    sel
      ? { ...sel, values: [newId, ...sel.values] }
      : { instanceId: targetId, values: [newId] }
  );
  return newId;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Write a single CSS property value for the selected instance (or all
 * multi-selected instances), at the active breakpoint and pseudo-state.
 * Runs inside an updateData transaction (undoable + canvas-synced).
 *
 * @param instanceId  — the primary selected instance id
 * @param property    — camelCase CSS property name (e.g. "boxShadow", "filter")
 * @param cssValue    — the raw CSS value string (e.g. "0px 4px 8px rgba(0,0,0,0.2)")
 */
export function writeStyleProperty(
  instanceId: string,
  property: string,
  cssValue: string
): void {
  const multiIds = $multiSelectedInstanceIds.get();
  const targetIds = multiIds.length > 1 ? multiIds : [instanceId];
  const activeBpId = $selectedBreakpoint.get()?.id ?? "base";
  const activeState = $selectedState.get();

  updateData(({ styles, styleSources, styleSourceSelections }) => {
    const srcs = styleSources as Map<string, Src>;
    const sels = styleSourceSelections as Map<string, Sel>;
    for (const targetId of targetIds) {
      const sourceId = ensureSrc(targetId, srcs, sels);
      const key = `${sourceId}:${activeBpId}:${activeState}:${property}`;
      (styles as Map<string, unknown>).set(key, {
        styleSourceId: sourceId,
        breakpointId: activeBpId,
        state: activeState || undefined,
        property,
        value: { type: "keyword", value: cssValue },
      });
    }
  });
}

/**
 * Write `grid-column: colStart / span span` for an instance.
 * Shorthand that delegates to `writeStyleProperty` so it flows through
 * the same undoable transaction and breakpoint logic.
 *
 * @param instanceId — the instance to update
 * @param colStart   — 1-based grid column start (1–12)
 * @param span       — number of columns to span (1–12)
 */
export function writeGridColumnStyle(
  instanceId: string,
  colStart: number,
  span: number
): void {
  const clampedStart = Math.max(1, Math.min(12, colStart));
  const clampedSpan = Math.max(1, Math.min(13 - clampedStart, span));
  writeStyleProperty(instanceId, "gridColumn", `${clampedStart} / span ${clampedSpan}`);
}

/**
 * Write `grid-row: rowStart / span rowSpan` for an instance.
 *
 * @param instanceId — the instance to update
 * @param rowStart   — 1-based grid row start
 * @param rowSpan    — number of rows to span
 */
export function writeGridRowStyle(
  instanceId: string,
  rowStart: number,
  rowSpan: number
): void {
  const clampedStart = Math.max(1, rowStart);
  const clampedSpan = Math.max(1, rowSpan);
  writeStyleProperty(instanceId, "gridRow", `${clampedStart} / span ${clampedSpan}`);
}
