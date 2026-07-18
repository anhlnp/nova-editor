"use client";
// P35 — Components / Symbols.
//
// A "symbol" is a reusable, self-contained subtree captured from the current
// selection. It snapshots the instance tree + its props + its base-breakpoint
// styles (styleSources + selections + decls). Instantiating a symbol remaps
// every id to a fresh uid and inserts the copy as a child of the current
// selection (or the page root), so the same symbol can be dropped many times
// without id collisions.
//
// This is the nova-builder synthesis of Nova's Phase-D ComponentMaster design
// onto WebstudioData: masters are stored as ordinary normalized records, and
// override resolution happens at instantiate-time (fresh ids). Symbols persist
// inside schema_json under the "symbols" key (seeded/saved like customCss).

import { atom } from "nanostores";
import type { Instance, Prop, StyleDecl, StyleSource, StyleSourceSelection } from "@webstudio-is/sdk";
import { $instances, $props, $styles, $styleSources, $styleSourceSelections } from "./data-stores";
import { $selectedInstanceId, $selectedInstanceSelector } from "./nano-states";
import { updateData } from "./transactions";
import { uid } from "./uid";

export type Symbol = {
  id: string;
  name: string;
  rootId: string;
  instances: Instance[];
  props: Prop[];
  styleSources: StyleSource[];
  styleSourceSelections: StyleSourceSelection[];
  styles: StyleDecl[];
  createdAt: string;
};

export const $symbols = atom<Symbol[]>([]);

// Collect an instance subtree (ids) rooted at rootId.
function collectSubtree(rootId: string, instances: Map<string, Instance>): Set<string> {
  const ids = new Set<string>();
  const walk = (id: string) => {
    const inst = instances.get(id);
    if (!inst || ids.has(id)) return;
    ids.add(id);
    for (const child of inst.children) {
      if (child.type === "id") walk(child.value);
    }
  };
  walk(rootId);
  return ids;
}

// Capture the currently-selected instance subtree as a named symbol.
export function createSymbolFromSelection(name: string): Symbol | null {
  const rootId = $selectedInstanceId.get();
  if (!rootId) return null;

  const instances = $instances.get();
  const subtreeIds = collectSubtree(rootId, instances);
  if (subtreeIds.size === 0) return null;

  const symInstances: Instance[] = [];
  for (const id of subtreeIds) {
    const inst = instances.get(id);
    if (inst) symInstances.push(structuredClone(inst));
  }

  const symProps: Prop[] = [];
  for (const [, p] of $props.get()) {
    if (subtreeIds.has(p.instanceId)) symProps.push(structuredClone(p));
  }

  // Which styleSources belong to instances in the subtree?
  const selections = $styleSourceSelections.get();
  const symSelections: StyleSourceSelection[] = [];
  const sourceIds = new Set<string>();
  for (const id of subtreeIds) {
    const sel = selections.get(id);
    if (sel) {
      symSelections.push(structuredClone(sel));
      for (const sid of sel.values) sourceIds.add(sid);
    }
  }

  const allSources = $styleSources.get();
  const symSources: StyleSource[] = [];
  for (const sid of sourceIds) {
    const src = allSources.get(sid);
    if (src) symSources.push(structuredClone(src));
  }

  const symStyles: StyleDecl[] = [];
  for (const [, d] of $styles.get()) {
    const decl = d as unknown as StyleDecl;
    if (sourceIds.has(decl.styleSourceId)) symStyles.push(structuredClone(decl));
  }

  const symbol: Symbol = {
    id: uid("sym_"),
    name: name.trim() || "Untitled symbol",
    rootId,
    instances: symInstances,
    props: symProps,
    styleSources: symSources,
    styleSourceSelections: symSelections,
    styles: symStyles,
    createdAt: new Date().toISOString(),
  };

  $symbols.set([...$symbols.get(), symbol]);
  return symbol;
}

export function deleteSymbol(symbolId: string): void {
  $symbols.set($symbols.get().filter((s) => s.id !== symbolId));
}

// Instantiate a symbol: remap all ids and insert the fresh copy as a child of
// the current selection (or the page root when nothing is selected).
// One updateData transaction — single undo step, synced to the canvas (M1).
export function instantiateSymbol(symbol: Symbol): void {
  const instMap = new Map<string, string>();
  const srcMap = new Map<string, string>();
  const freshInst = (old: string) => {
    if (!instMap.has(old)) instMap.set(old, uid("inst_"));
    return instMap.get(old)!;
  };
  const freshSrc = (old: string) => {
    if (!srcMap.has(old)) srcMap.set(old, uid("src_"));
    return srcMap.get(old)!;
  };

  updateData(({ instances, props, styles, styleSources, styleSourceSelections }) => {
    // Instances (remap self id + children id refs)
    for (const inst of symbol.instances) {
      const newInst: Instance = {
        ...structuredClone(inst),
        id: freshInst(inst.id),
        children: inst.children.map((c) =>
          c.type === "id" ? { type: "id" as const, value: freshInst(c.value) } : c
        ),
      };
      instances.set(newInst.id, newInst);
    }

    // Props (remap id + instanceId)
    for (const p of symbol.props) {
      const newProp = { ...structuredClone(p), id: uid("prop_"), instanceId: freshInst(p.instanceId) };
      props.set(newProp.id, newProp as Parameters<typeof props.set>[1]);
    }

    // Style sources (remap id)
    for (const src of symbol.styleSources) {
      const newSrc = { ...structuredClone(src), id: freshSrc(src.id) };
      styleSources.set(newSrc.id, newSrc as Parameters<typeof styleSources.set>[1]);
    }

    // Selections (remap instanceId + source ids)
    for (const sel of symbol.styleSourceSelections) {
      const newSel: StyleSourceSelection = {
        instanceId: freshInst(sel.instanceId),
        values: sel.values.map((v) => freshSrc(v)),
      };
      styleSourceSelections.set(newSel.instanceId, newSel);
    }

    // Styles (remap styleSourceId; key = source:bp:state:property)
    for (const decl of symbol.styles) {
      const newDecl = { ...structuredClone(decl), styleSourceId: freshSrc(decl.styleSourceId) };
      const key = `${newDecl.styleSourceId}:${newDecl.breakpointId}:${newDecl.state ?? ""}:${newDecl.property}`;
      styles.set(key, newDecl as Parameters<typeof styles.set>[1]);
    }

    // Insert the new subtree root under the current selection (or page root).
    const newRootId = freshInst(symbol.rootId);
    const selectedId = $selectedInstanceId.get();
    const parentId =
      selectedId && instances.get(selectedId) ? selectedId : findPageRoot(instances);
    if (parentId) {
      const parent = instances.get(parentId);
      if (parent) {
        instances.set(parentId, {
          ...parent,
          children: [...parent.children, { type: "id" as const, value: newRootId }],
        });
      }
    }
  });

  $selectedInstanceSelector.set([freshInst(symbol.rootId)]);
}

function findPageRoot(instances: Map<string, Instance>): string | undefined {
  // The Body/root instance is the one no other instance references as a child.
  const referenced = new Set<string>();
  for (const [, inst] of instances) {
    for (const c of inst.children) if (c.type === "id") referenced.add(c.value);
  }
  for (const [id] of instances) if (!referenced.has(id)) return id;
  return undefined;
}
