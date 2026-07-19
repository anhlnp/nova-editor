// Pure instance-tree move/reparent logic (FA-007). Shared by the navigator DnD
// (left-sidebar/navigator/useDnd.ts) and the canvas drag-reparent
// (canvas/dragReparent.ts) so the reindexing rules live in ONE place (SOLID D).
// No React, no atoms — just Instances → Instances transforms.
import type { Instances } from "@webstudio-is/sdk";
import { checkNesting } from "./nestingGuard";

let getArea: any;
let getChildrenRects: any;
let getLocalChildrenOrientation: any;
let getIndexAdjustment: any;

if (typeof window !== "undefined") {
  try {
    const ds = require("@webstudio-is/design-system");
    getArea = ds.getArea;
    getChildrenRects = ds.getChildrenRects;
    getLocalChildrenOrientation = ds.getLocalChildrenOrientation;
    getIndexAdjustment = ds.getIndexAdjustment;
  } catch (err) {
    console.error("Failed to load design-system primitives dynamically:", err);
  }
}

export type DropPosition = "above" | "below" | "into";

const TEXT_ONLY_COMPONENTS = new Set([
  "Heading",
  "Paragraph",
  "RichText",
  "Bold",
  "Italic",
  "Span",
  "Label",
  "Code",
  "TextBlock",
]);

export function canAcceptChildren(component: string): boolean {
  return !TEXT_ONLY_COMPONENTS.has(component);
}

export function isGridRow(component: string | null | undefined): boolean {
  return component === "HeroUIRow";
}

export function resolveDropPosition(
  el: HTMLElement,
  pointer: { x: number; y: number },
  component: string
): DropPosition {
  const comp = el.getAttribute("data-ws-component");
  if (comp === "Body") return "into";

  if (component && canAcceptChildren(component)) {
    const rect = el.getBoundingClientRect();
    const threshold = Math.min(rect.width, rect.height) * 0.25;
    const area = getArea(pointer, threshold, rect);
    if (area === "center") {
      return "into";
    }
  }

  const parent = el.parentElement;
  if (!parent) return "above";

  const children = Array.from(parent.children);
  const childIndex = children.indexOf(el);
  if (childIndex === -1) return "above";

  const parentComponent = parent.getAttribute("data-ws-component");
  if (isGridRow(parentComponent)) {
    const rect = el.getBoundingClientRect();
    const isFirst = childIndex === 0;
    const isLast = childIndex === children.length - 1;
    const centerX = rect.left + rect.width / 2;

    if (isFirst && pointer.x < rect.left + 20) return "above";
    if (isLast && pointer.x > rect.right - 20) return "below";

    return pointer.x < centerX ? "above" : "below";
  }

  const parentRect = parent.getBoundingClientRect();
  const relPointer = {
    x: pointer.x - parentRect.left,
    y: pointer.y - parentRect.top,
  };

  const childrenRects = getChildrenRects(parent, children);
  const closestChildRect = childrenRects[childIndex];

  const orientation = getLocalChildrenOrientation(
    parent,
    (p) => Array.from(p.children),
    childrenRects,
    childIndex
  );

  const adj = getIndexAdjustment(relPointer, closestChildRect, orientation);
  return adj === 0 ? "above" : "below";
}


export function buildParentMap(instances: Instances): Map<string, string> {
  const parent = new Map<string, string>();
  for (const [, inst] of instances) {
    for (const child of inst.children) {
      if (child.type === "id") parent.set(child.value, inst.id);
    }
  }
  return parent;
}

export function isAncestorOf(
  parentMap: Map<string, string>,
  potentialAncestorId: string,
  nodeId: string
): boolean {
  let current = parentMap.get(nodeId);
  while (current) {
    if (current === potentialAncestorId) return true;
    current = parentMap.get(current);
  }
  return false;
}

export function reorderInParent(
  instances: Instances,
  parentId: string,
  draggedId: string,
  targetId: string,
  dropAbove: boolean
): Instances {
  const parent = instances.get(parentId);
  if (!parent) return instances;
  const without = parent.children.filter(
    (c) => !(c.type === "id" && c.value === draggedId)
  );
  const targetIdx = without.findIndex((c) => c.type === "id" && c.value === targetId);
  if (targetIdx === -1) return instances;
  const insertIdx = dropAbove ? targetIdx : targetIdx + 1;
  const newChildren = [...without];
  newChildren.splice(insertIdx, 0, { type: "id" as const, value: draggedId });
  const updated = new Map(instances);
  updated.set(parentId, { ...parent, children: newChildren });
  return updated;
}

export function moveToNewParent(
  instances: Instances,
  draggedId: string,
  oldParentId: string,
  newParentId: string,
  insertIdx: number
): Instances {
  const updated = new Map(instances);
  const oldParent = updated.get(oldParentId);
  if (!oldParent) return instances;
  updated.set(oldParentId, {
    ...oldParent,
    children: oldParent.children.filter(
      (c) => !(c.type === "id" && c.value === draggedId)
    ),
  });
  const newParent = updated.get(newParentId);
  if (!newParent) return instances;
  const newChildren = [...newParent.children];
  newChildren.splice(insertIdx, 0, { type: "id" as const, value: draggedId });
  updated.set(newParentId, { ...newParent, children: newChildren });
  return updated;
}

// Full drop resolution: returns the mutated Instances, or null when the move is
// illegal / a no-op (unknown ids, dropping into own descendant, dropping onto a
// text-only container, target has no parent for above/below).
export function applyReparent(
  instances: Instances,
  draggedId: string,
  targetId: string,
  position: DropPosition
): Instances | null {
  if (!draggedId || draggedId === targetId) return null;

  const parentMap = buildParentMap(instances);
  const oldParentId = parentMap.get(draggedId);
  if (!oldParentId) return null; // root cannot be moved

  // Cannot drop a node inside its own subtree.
  if (draggedId === targetId || isAncestorOf(parentMap, draggedId, targetId)) return null;

  const dragged = instances.get(draggedId);

  if (position === "into") {
    const targetInst = instances.get(targetId);
    if (!targetInst || !canAcceptChildren(targetInst.component)) return null;
    // Content-model guard: block invalid nesting (interactive-in-interactive, form-in-form).
    if (dragged && checkNesting(targetId, dragged.component, instances)) return null;
    const withoutDragged = targetInst.children.filter(
      (c) => !(c.type === "id" && c.value === draggedId)
    );
    return moveToNewParent(instances, draggedId, oldParentId, targetId, withoutDragged.length);
  }

  // above | below — insert relative to target within target's parent.
  const newParentId = parentMap.get(targetId);
  if (!newParentId) return null;
  const newParent = instances.get(newParentId);
  if (!newParent) return null;
  // Content-model guard for the new parent (skip when reordering within same parent).
  if (dragged && newParentId !== oldParentId && checkNesting(newParentId, dragged.component, instances)) {
    return null;
  }

  const childrenForIdx = newParent.children.filter(
    (c) => !(c.type === "id" && c.value === draggedId)
  );
  const targetIdx = childrenForIdx.findIndex((c) => c.type === "id" && c.value === targetId);
  if (targetIdx === -1) return null;
  const insertIdx = position === "above" ? targetIdx : targetIdx + 1;

  if (oldParentId === newParentId) {
    return reorderInParent(instances, oldParentId, draggedId, targetId, position === "above");
  }
  return moveToNewParent(instances, draggedId, oldParentId, newParentId, insertIdx);
}
