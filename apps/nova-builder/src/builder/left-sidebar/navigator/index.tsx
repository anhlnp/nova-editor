"use client";
import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { updateData, replaceMap } from "@/lib/transactions";
import { $instances } from "@/lib/data-stores";
import {
  $selectedPage,
  $selectedInstanceSelector,
  $multiSelectedInstanceIds,
} from "@/lib/nano-states";
import type { Instances } from "@webstudio-is/sdk";
import { TreeRow, type InstanceNode } from "./TreeRow";
import { ContextMenu } from "./ContextMenu";
import { useDnd } from "./useDnd";
import { useI18n } from "@/lib/i18n";
import { UI_VARS as C } from "@/lib/uiTheme";


const SESSION_KEY = "nova-nav-expanded";

function buildParentMap(instances: Instances): Map<string, string> {
  const pm = new Map<string, string>();
  for (const [, inst] of instances) {
    for (const child of inst.children) {
      if (child.type === "id") pm.set(child.value, inst.id);
    }
  }
  return pm;
}

function flattenVisible(
  node: InstanceNode,
  expandedIds: Set<string>,
  result: string[] = []
): string[] {
  result.push(node.id);
  if (expandedIds.has(node.id)) {
    for (const child of node.children) {
      flattenVisible(child, expandedIds, result);
    }
  }
  return result;
}

function findNode(root: InstanceNode, id: string): InstanceNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

function buildTree(
  instanceId: string,
  instances: Instances,
  visited = new Set<string>()
): InstanceNode | null {
  if (visited.has(instanceId)) return null;
  visited.add(instanceId);
  const instance = instances.get(instanceId);
  if (!instance) return null;
  const children: InstanceNode[] = [];
  for (const child of instance.children) {
    if (child.type === "id") {
      const node = buildTree(child.value, instances, visited);
      if (node) children.push(node);
    }
  }
  return {
    id: instance.id,
    component: instance.component,
    label: (instance as { label?: string }).label,
    children,
  };
}

function loadExpandedFromSession(): Set<string> {
  if (typeof sessionStorage === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

function saveExpandedToSession(ids: Set<string>): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...ids]));
  } catch {}
}

type ContextMenuState = { instanceId: string; x: number; y: number } | null;

export function Navigator() {
  const { t } = useI18n();
  const instances = useStore($instances);
  const page = useStore($selectedPage);
  const selector = useStore($selectedInstanceSelector);
  const selectedId = selector?.[0];

  const multiSelectedIds = useStore($multiSelectedInstanceIds);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(loadExpandedFromSession);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const dnd = useDnd();

  // Persist expanded IDs to sessionStorage whenever they change
  useEffect(() => {
    saveExpandedToSession(expandedIds);
  }, [expandedIds]);

  // Auto-expand ancestors when selection changes
  useEffect(() => {
    if (!selectedId) return;
    const parentMap = buildParentMap(instances);
    const toExpand = new Set<string>();
    let current = parentMap.get(selectedId);
    while (current) {
      toExpand.add(current);
      current = parentMap.get(current);
    }
    if (toExpand.size > 0) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        for (const id of toExpand) next.add(id);
        return next;
      });
    }
  }, [selectedId, instances]);

  // Keyboard navigation: ArrowUp/Down move selection; ArrowRight expands or enters first child; ArrowLeft collapses or goes to parent
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = document.activeElement as HTMLElement | null;
      if (
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        el?.contentEditable === "true"
      )
        return;
      if (
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown" &&
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight"
      )
        return;

      const currentRoot = page?.rootInstanceId
        ? buildTree(page.rootInstanceId, instances)
        : null;
      if (!currentRoot || !selectedId) return;

      e.preventDefault();

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const flatIds = flattenVisible(currentRoot, expandedIds);
        const idx = flatIds.indexOf(selectedId);
        const next =
          e.key === "ArrowDown" ? flatIds[idx + 1] : flatIds[idx - 1];
        if (next) {
          $multiSelectedInstanceIds.set([]);
          $selectedInstanceSelector.set([next]);
        }
      } else if (e.key === "ArrowRight") {
        const node = findNode(currentRoot, selectedId);
        if (!node || node.children.length === 0) return;
        if (!expandedIds.has(selectedId)) {
          setExpandedIds((prev) => {
            const n = new Set(prev);
            n.add(selectedId);
            return n;
          });
        } else {
          $multiSelectedInstanceIds.set([]);
          $selectedInstanceSelector.set([node.children[0].id]);
        }
      } else if (e.key === "ArrowLeft") {
        const node = findNode(currentRoot, selectedId);
        if (node && node.children.length > 0 && expandedIds.has(selectedId)) {
          setExpandedIds((prev) => {
            const n = new Set(prev);
            n.delete(selectedId);
            return n;
          });
        } else {
          const parentMap = buildParentMap(instances);
          const parentId = parentMap.get(selectedId);
          if (parentId) {
            $multiSelectedInstanceIds.set([]);
            $selectedInstanceSelector.set([parentId]);
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedId, expandedIds, instances, page, setExpandedIds]);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((id: string, withModifier: boolean) => {
    if (withModifier) {
      // Ctrl/Shift+click: toggle this id in the multi-selection
      const current = $multiSelectedInstanceIds.get();
      const set = new Set(current);
      if (set.has(id)) {
        set.delete(id);
      } else {
        set.add(id);
      }
      $multiSelectedInstanceIds.set([...set]);
      $selectedInstanceSelector.set([id]);
    } else {
      // Plain click: clear multi-select, set single primary selection
      $multiSelectedInstanceIds.set([]);
      $selectedInstanceSelector.set([id]);
    }
  }, []);

  const handleContextMenu = useCallback((id: string, x: number, y: number) => {
    setContextMenu({ instanceId: id, x, y });
  }, []);

  const handleRenameCommit = useCallback(
    (id: string, newLabel: string) => {
      setRenamingId(null);
      const inst = instances.get(id);
      if (!inst) return;
      updateData(({ instances: draft }) => {
        const current = draft.get(id);
        if (current) draft.set(id, { ...current, label: newLabel } as Parameters<typeof draft.set>[1]);
      });
    },
    [instances]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
      dnd.handleDrop(e, targetId, instances, (next) => updateData(({ instances: draft }) => replaceMap(draft, next)));
    },
    [dnd, instances]
  );

  const root = page?.rootInstanceId
    ? buildTree(page.rootInstanceId, instances)
    : null;

  return (
    <div
      style={{
        height: "100%",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "7px 10px",
          fontSize: 12,
          fontFamily: C.font,
          color: C.textMuted,
          borderBottom: `1px solid ${C.border}`,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        Navigator
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 2px" }}>
        {root ? (
          <TreeRow
            node={root}
            depth={0}
            state={{ selectedId, multiSelectedIds, expandedIds, renamingId }}
            dnd={{
              draggedId: dnd.draggedId,
              dropIndicatorId: dnd.dropIndicatorId,
              dropPosition: dnd.dropPosition,
              onDragStart: dnd.handleDragStart,
              onDragOver: dnd.handleDragOver,
              onDragLeave: dnd.handleDragLeave,
              onDragEnd: dnd.handleDragEnd,
              onDrop: handleDrop,
            }}
            handlers={{
              onSelect: handleSelect,
              onToggle: handleToggle,
              onContextMenu: handleContextMenu,
              onRenameCommit: handleRenameCommit,
            }}
          />
        ) : (
          <div
            style={{
              padding: "16px 12px",
              fontSize: 13,
              color: C.textMuted,
              fontFamily: C.font,
            }}
          >
            {page ? t.builder.noInstancesOnPage : t.builder.noPageSelected}
          </div>
        )}
      </div>

      {/* Context menu portal */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          instanceId={contextMenu.instanceId}
          instances={instances}
          actions={{
            onClose: () => setContextMenu(null),
            onStartRename: (id) => { setContextMenu(null); setRenamingId(id); },
            onInstancesChange: (next) => { updateData(({ instances: draft }) => replaceMap(draft, next)); setContextMenu(null); },
          }}
        />
      )}
    </div>
  );
}
