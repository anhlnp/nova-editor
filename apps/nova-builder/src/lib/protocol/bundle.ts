"use client";
// M11 — Protocol bundle: the transferrable, insertable unit of Nova content.
//
// A NovaBundle is a normalized WebstudioFragment (children + instances + props +
// styles + sources + selections + dataSources + resources + breakpoints + assets)
// plus lightweight meta. It is the single format for: export-to-file, import-from-
// file, "publish this page to the marketplace", and "install a marketplace item".
// Same shape as Webstudio's webstudioFragment (ADR-NB-024) so the format stays
// diffable against upstream.
//
// Pure builders + a transactional inserter. buildBundle reads atoms; insertBundle
// re-mints every id (so multiple inserts never collide) and runs the M5 nesting
// guard against the target parent.

import type { Instance, Prop } from "@webstudio-is/sdk";
import {
  $instances,
  $props,
  $styles,
  $styleSources,
  $styleSourceSelections,
  $dataSources,
  $resources,
  $breakpoints,
  $assets,
} from "@/lib/data-stores";
import { $selectedPage, $selectedInstanceId } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { uid } from "@/lib/uid";
import { checkFragmentNesting, type NestingViolation } from "@/lib/nestingGuard";

export const BUNDLE_VERSION = 1;

export type NovaBundle = {
  __nova_bundle__: typeof BUNDLE_VERSION;
  meta: { name: string; description?: string; icon?: string };
  // WebstudioFragment shape — normalized arrays.
  children: Instance["children"];
  instances: Instance[];
  props: Prop[];
  styles: Array<Record<string, unknown>>;
  styleSources: Array<Record<string, unknown>>;
  styleSourceSelections: Array<{ instanceId: string; values: string[] }>;
  dataSources: Array<Record<string, unknown>>;
  resources: Array<Record<string, unknown>>;
  breakpoints: Array<Record<string, unknown>>;
  assets: Array<Record<string, unknown>>;
};

// Collect the subtree of instance ids rooted at the given ids.
function collectSubtree(rootIds: string[], instances: Map<string, Instance>): Set<string> {
  const ids = new Set<string>();
  const walk = (id: string) => {
    if (ids.has(id)) return;
    const inst = instances.get(id);
    if (!inst) return;
    ids.add(id);
    for (const child of inst.children) {
      if (child.type === "id") walk(child.value);
    }
  };
  for (const id of rootIds) walk(id);
  return ids;
}

// Build a bundle from a set of root instance ids (defaults to the current page root's
// children, or the selected instance). Only the styles/props/sources reachable from
// the collected instances travel with the bundle.
export function buildBundle(
  meta: { name: string; description?: string; icon?: string },
  rootIds?: string[]
): NovaBundle | null {
  const instances = $instances.get();
  const page = $selectedPage.get();

  // Resolve the roots: explicit → selected instance → page root's children.
  let roots = rootIds;
  if (!roots) {
    const selected = $selectedInstanceId.get();
    if (selected) roots = [selected];
    else if (page) {
      const root = instances.get(page.rootInstanceId);
      roots = root ? root.children.filter((c) => c.type === "id").map((c) => (c as { value: string }).value) : [];
    }
  }
  if (!roots || roots.length === 0) return null;

  const subtreeIds = collectSubtree(roots, instances);
  if (subtreeIds.size === 0) return null;

  const bundleInstances = [...subtreeIds].map((id) => instances.get(id)!).filter(Boolean);

  // Props for the collected instances.
  const bundleProps = [...$props.get().values()].filter((p) => subtreeIds.has(p.instanceId));

  // Style-source selections for the collected instances → the set of used sources.
  const usedSourceIds = new Set<string>();
  const bundleSelections = [...$styleSourceSelections.get().values()]
    .filter((sel) => subtreeIds.has((sel as { instanceId: string }).instanceId))
    .map((sel) => {
      const s = sel as { instanceId: string; values: string[] };
      for (const v of s.values) usedSourceIds.add(v);
      return { instanceId: s.instanceId, values: [...s.values] };
    });

  const bundleSources = [...$styleSources.get().values()].filter((s) =>
    usedSourceIds.has((s as { id: string }).id)
  ) as unknown as Array<Record<string, unknown>>;

  const bundleStyles = [...$styles.get().values()].filter((d) =>
    usedSourceIds.has((d as { styleSourceId: string }).styleSourceId)
  ) as unknown as Array<Record<string, unknown>>;

  // Data sources / resources referenced by bound props travel too (best-effort:
  // include all, since expressions may reference any variable).
  const bundleDataSources = [...$dataSources.get().values()] as unknown as Array<Record<string, unknown>>;
  const bundleResources = [...$resources.get().values()] as unknown as Array<Record<string, unknown>>;
  const bundleBreakpoints = [...$breakpoints.get().values()] as unknown as Array<Record<string, unknown>>;
  const bundleAssets = [...$assets.get().values()] as unknown as Array<Record<string, unknown>>;

  return {
    __nova_bundle__: BUNDLE_VERSION,
    meta,
    children: roots.map((value) => ({ type: "id" as const, value })),
    instances: bundleInstances,
    props: bundleProps,
    styles: bundleStyles,
    styleSources: bundleSources,
    styleSourceSelections: bundleSelections,
    dataSources: bundleDataSources,
    resources: bundleResources,
    breakpoints: bundleBreakpoints,
    assets: bundleAssets,
  };
}

export function isNovaBundle(value: unknown): value is NovaBundle {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as NovaBundle).__nova_bundle__ === BUNDLE_VERSION &&
    Array.isArray((value as NovaBundle).instances)
  );
}

export type InsertBundleResult =
  | { ok: true; rootIds: string[] }
  | { ok: false; violation: NestingViolation };

// Insert a bundle under the current page root (or the selected instance).
// Re-mints instance/prop/source ids so repeated inserts are independent, and runs
// the M5 content-model guard against the target parent. One transaction (M1).
export function insertBundle(bundle: NovaBundle): InsertBundleResult | null {
  const page = $selectedPage.get();
  if (!page) return null;

  const instMap = new Map<string, string>();
  const srcMap = new Map<string, string>();
  const propMap = new Map<string, string>();
  const freshInst = (old: string) => { if (!instMap.has(old)) instMap.set(old, uid("inst_")); return instMap.get(old)!; };
  const freshSrc = (old: string) => { if (!srcMap.has(old)) srcMap.set(old, uid("src_")); return srcMap.get(old)!; };
  const freshProp = (old: string) => { if (!propMap.has(old)) propMap.set(old, uid("prop_")); return propMap.get(old)!; };

  const remInstances = bundle.instances.map((i) => ({
    ...i,
    id: freshInst(i.id),
    children: i.children.map((c) =>
      c.type === "id" ? { type: "id" as const, value: freshInst(c.value) } : c
    ),
  })) as Instance[];
  const remProps = bundle.props.map((p) => ({
    ...p,
    id: freshProp(p.id),
    instanceId: freshInst(p.instanceId),
  })) as Prop[];
  const remSources = bundle.styleSources.map((s) => ({ ...s, id: freshSrc((s as { id: string }).id) }));
  const remSelections = bundle.styleSourceSelections.map((sel) => ({
    instanceId: freshInst(sel.instanceId),
    values: sel.values.map((v) => freshSrc(v)),
  }));
  const remStyles = bundle.styles.map((d) => ({
    ...d,
    styleSourceId: freshSrc((d as { styleSourceId: string }).styleSourceId),
  }));
  const remChildren = bundle.children
    .filter((c) => c.type === "id")
    .map((c) => ({ type: "id" as const, value: freshInst((c as { value: string }).value) }));
  const newRootIds = remChildren.map((c) => c.value);

  // Target parent = selected instance if it can hold children, else the page root.
  const selectedId = $selectedInstanceId.get();
  const targetParentId = selectedId ?? page.rootInstanceId;

  // Content-model guard (M5): validate each new root against the target parent.
  const remInstanceMap = new Map(remInstances.map((i) => [i.id, i]));
  for (const rootId of newRootIds) {
    const violation = checkFragmentNesting(
      targetParentId,
      rootId,
      remInstanceMap,
      $instances.get()
    );
    if (violation) return { ok: false, violation };
  }

  updateData(({ instances, props, styles, styleSources, styleSourceSelections }) => {
    for (const i of remInstances) instances.set(i.id, i as Parameters<typeof instances.set>[1]);
    for (const p of remProps) props.set(p.id, p as Parameters<typeof props.set>[1]);
    for (const s of remSources) styleSources.set((s as { id: string }).id, s as Parameters<typeof styleSources.set>[1]);
    for (const sel of remSelections) styleSourceSelections.set(sel.instanceId, sel as Parameters<typeof styleSourceSelections.set>[1]);
    for (const decl of remStyles) {
      const d = decl as { styleSourceId: string; breakpointId: string; property: string };
      const key = `${d.styleSourceId}:${d.breakpointId}::${d.property}`;
      styles.set(key, decl as Parameters<typeof styles.set>[1]);
    }
    // Append the bundle roots to the target parent's children.
    const parent = instances.get(targetParentId);
    if (parent) {
      instances.set(targetParentId, {
        ...parent,
        children: [...parent.children, ...remChildren],
      } as Parameters<typeof instances.set>[1]);
    }
  });

  return { ok: true, rootIds: newRootIds };
}
