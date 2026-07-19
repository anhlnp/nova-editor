"use client";
// Apply a WSCompositionResult (from the /api/ai endpoint) to nanostores atoms.
// Replaces the active page's content with the AI-generated instances.
//
// Strategy for whole-page compose:
//   1. Create a synthetic root Box instance whose children are the AI's root nodes
//   2. Update the active page's rootInstanceId to point to this root
//   3. Merge all AI instances/props/styles/sources/selections into the atom maps
//
// The page atom update triggers canvas re-render via SyncClient.
import type { WSCompositionResult } from "@studio/ai";
import type { Instance } from "@webstudio-is/sdk";
import { compareMedia } from "@webstudio-is/css-engine";
import { $selectedPage, $nestingWarning } from "./nano-states";
import { $breakpoints } from "./data-stores";
import { updateData } from "./transactions";
import { checkDirectNesting } from "./nestingGuard";
import { uid } from "./uid";

// Non-blocking content-model check over the AI fragment's internal edges. AI
// output is never dropped (would lose generated content) — instead the first
// violation is surfaced as a warning so the user can fix it after apply (M5).
function warnOnAiNesting(instances: Instance[]): void {
  const byId = new Map(instances.map((i) => [i.id, i]));
  for (const inst of instances) {
    for (const child of inst.children) {
      if (child.type !== "id") continue;
      const childInst = byId.get(child.value);
      if (!childInst) continue;
      const violation = checkDirectNesting(inst.component, childInst.component);
      if (violation) {
        $nestingWarning.set(violation.message);
        return;
      }
    }
  }
}

export function applyWSComposition(result: WSCompositionResult): void {
  if (result.instances.length === 0) return;

  const page = $selectedPage.get();
  if (!page) return;

  const breakpoints = $breakpoints.get();
  let baseBpId = "base";
  if (breakpoints.size > 0) {
    const sorted = [...breakpoints.values()].sort(
      compareMedia as (a: (typeof sorted)[0], b: (typeof sorted)[0]) => number
    );
    baseBpId = sorted[0]?.id ?? "base";
  }

  warnOnAiNesting(result.instances as unknown as Instance[]);

  // One transaction: the whole AI application is a single undo step and a
  // single sync payload to the canvas (M1).
  updateData(({ pages, instances, props, styles, styleSources, styleSourceSelections }) => {
    // 1. Synthetic root instance wrapping the AI's top-level nodes
    const rootId = uid("inst_");
    instances.set(rootId, {
      type: "instance" as const,
      id: rootId,
      component: "Body",
      label: "Page Root",
      children: result.rootIds.map((id) => ({ type: "id" as const, value: id })),
    } as Parameters<typeof instances.set>[1]);

    // 2–6. Merge instances / props / sources / selections / styles
    for (const inst of result.instances) {
      instances.set(inst.id, inst as Parameters<typeof instances.set>[1]);
    }
    for (const prop of result.props) {
      props.set(prop.id, prop as Parameters<typeof props.set>[1]);
    }
    for (const src of result.styleSources) {
      styleSources.set(src.id, src as Parameters<typeof styleSources.set>[1]);
    }
    for (const sel of result.styleSourceSelections) {
      styleSourceSelections.set(sel.instanceId, sel as Parameters<typeof styleSourceSelections.set>[1]);
    }
    // StyleDecl key: `${styleSourceId}:${breakpointId}:${state ?? ""}:${property}`
    for (const decl of result.styles) {
      const bpId = decl.breakpointId === "base" ? baseBpId : decl.breakpointId;
      const key = `${decl.styleSourceId}:${bpId}::${decl.property}`;
      styles.set(key, {
        ...decl,
        breakpointId: bpId,
      } as Parameters<typeof styles.set>[1]);
    }

    // 7. Point the active page at the new root
    const current = pages.pages.get(page.id);
    if (current) {
      pages.pages.set(page.id, { ...current, rootInstanceId: rootId });
    }
  });
}
