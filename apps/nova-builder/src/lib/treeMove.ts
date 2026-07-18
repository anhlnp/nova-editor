// Pure instance-tree move/reparent logic (FA-007). Shared by the navigator DnD
// (left-sidebar/navigator/useDnd.ts) and the canvas drag-reparent
// (canvas/dragReparent.ts) so the reindexing rules live in ONE place (SOLID D).
// No React, no atoms — just Instances → Instances transforms.
import type { Instances } from "@webstudio-is/sdk";
import { checkNesting } from "./nestingGuard";

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
