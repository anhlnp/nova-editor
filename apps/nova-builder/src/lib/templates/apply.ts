"use client";
import { compareMedia } from "@webstudio-is/css-engine";
import {
  $instances,
  $props,
  $styles,
  $styleSources,
  $styleSourceSelections,
  $pages,
  $breakpoints,
} from "../data-stores";
import { $selectedPage } from "../nano-states";
import { updateData } from "../transactions";
import { uid } from "../uid";
import { BASE_BP, Template } from "./types";

export function applyTemplate(template: Template): void {
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

  const instMap = new Map<string, string>();
  const srcMap  = new Map<string, string>();
  const propMap = new Map<string, string>();

  const freshInst = (old: string) => { if (!instMap.has(old)) instMap.set(old, uid("inst_")); return instMap.get(old)!; };
  const freshSrc  = (old: string) => { if (!srcMap.has(old))  srcMap.set(old, uid("src_"));   return srcMap.get(old)!;  };
  const freshProp = (old: string) => { if (!propMap.has(old)) propMap.set(old, uid("prop_")); return propMap.get(old)!; };

  const remInstances = template.instances.map(i => ({
    ...i,
    id: freshInst(i.id),
    children: i.children.map(c => c.type === "id" ? { type: "id" as const, value: freshInst(c.value) } : c),
  }));
  const remProps = template.props.map(p => ({ ...p, id: freshProp(p.id), instanceId: freshInst(p.instanceId) }));
  const remSources = template.styleSources.map(s => ({ ...s, id: freshSrc(s.id) }));
  const remSelections = template.styleSourceSelections.map(sel => ({
    instanceId: freshInst(sel.instanceId),
    values: sel.values.map(v => freshSrc(v)),
  }));
  const remStyles = template.styles.map(decl => ({
    ...decl,
    styleSourceId: freshSrc(decl.styleSourceId),
    breakpointId: decl.breakpointId === BASE_BP ? baseBpId : decl.breakpointId,
  }));
  const remRootIds = template.rootIds.map(id => freshInst(id));

  const rootId = uid("inst_");

  // One transaction: template application = single undo step + one sync payload (M1)
  updateData(({ pages, instances, props, styles, styleSources, styleSourceSelections }) => {
    instances.set(rootId, {
      type: "instance" as const,
      id: rootId,
      component: "Body",
      label: "Page Root",
      children: remRootIds.map(id => ({ type: "id" as const, value: id })),
    } as Parameters<typeof instances.set>[1]);
    for (const i of remInstances) instances.set(i.id, i as Parameters<typeof instances.set>[1]);
    for (const p of remProps) props.set(p.id, p as Parameters<typeof props.set>[1]);
    for (const s of remSources) styleSources.set(s.id, s as Parameters<typeof styleSources.set>[1]);
    for (const sel of remSelections) styleSourceSelections.set(sel.instanceId, sel as Parameters<typeof styleSourceSelections.set>[1]);
    for (const decl of remStyles) {
      const key = `${decl.styleSourceId}:${decl.breakpointId}::${decl.property}`;
      styles.set(key, decl as Parameters<typeof styles.set>[1]);
    }
    const current = pages.pages.get(page.id);
    if (current) pages.pages.set(page.id, { ...current, rootInstanceId: rootId });
  });
}
