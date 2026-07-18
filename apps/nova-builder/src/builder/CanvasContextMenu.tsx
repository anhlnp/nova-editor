"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { updateData, replaceMap } from "@/lib/transactions";
import { deleteInstance, duplicateInstance, makeInstanceId, pasteInstance } from "@/lib/edit-operations";
import { $instances, } from "@/lib/data-stores";
import { $selectedInstanceSelector, $clipboard, $nestingWarning } from "@/lib/nano-states";
import { useI18n } from "@/lib/i18n";
import { UI_VARS as C } from "@/lib/uiTheme";


const itemBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "6px 14px",
  background: "none",
  border: "none",
  color: C.text,
  fontSize: 12,
  fontFamily: C.font,
  textAlign: "left",
  cursor: "pointer",
  gap: 24,
};

function Item({ label, shortcut, danger, onClick }: {
  label: string;
  shortcut?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      style={{ ...itemBase, color: danger ? C.danger : C.text }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      <span>{label}</span>
      {shortcut && <span style={{ fontSize: 12, fontFamily: C.fontMono, color: C.textMuted, flexShrink: 0 }}>{shortcut}</span>}
    </button>
  );
}

function Separator() {
  return <div style={{ height: 1, background: C.border, margin: "3px 0" }} />;
}

type Props = {
  instanceId: string;
  x: number;
  y: number;
  onClose: () => void;
};

export function CanvasContextMenu({ instanceId, x, y, onClose }: Props) {
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // ── Actions (all read atoms at call-time) ────────────────────────────────────

  function handleCopy() {
    $clipboard.set({ instances: new Map($instances.get()), rootId: instanceId });
    onClose();
  }

  function handleCut() {
    $clipboard.set({ instances: new Map($instances.get()), rootId: instanceId });
    const { updated, deleted } = deleteInstance(instanceId, $instances.get());
    if (deleted) {
      updateData(({ instances }) => replaceMap(instances, updated));
      $selectedInstanceSelector.set(undefined);
    }
    onClose();
  }

  function handlePaste() {
    const clipboard = $clipboard.get();
    if (!clipboard) return;
    const result = pasteInstance(clipboard, instanceId, $instances.get());
    if (result?.violation) {
      $nestingWarning.set(result.violation.message);
    } else if (result?.updated) {
      updateData(({ instances, props }) => {
        replaceMap(instances, result.updated);
        if (result.clonedProps) for (const [id, p] of result.clonedProps) props.set(id, p);
      });
      $selectedInstanceSelector.set([result.newRootId]);
    }
    onClose();
  }

  function handleDuplicate() {
    const result = duplicateInstance(instanceId, $instances.get());
    if (result) {
      updateData(({ instances }) => replaceMap(instances, result.updated));
      $selectedInstanceSelector.set([result.newRootId]);
    }
    onClose();
  }

  function handleWrapInBox() {
    const instances = $instances.get();
    const pm = new Map<string, string>();
    for (const [, inst] of instances) {
      for (const child of inst.children) {
        if (child.type === "id") pm.set(child.value, inst.id);
      }
    }
    const parentId = pm.get(instanceId);
    if (!parentId) { onClose(); return; }
    const parent = instances.get(parentId);
    if (!parent) { onClose(); return; }
    const boxId = makeInstanceId();
    updateData(({ instances: draft }) => {
      draft.set(boxId, {
        type: "instance" as const,
        id: boxId,
        component: "Box",
        children: [{ type: "id" as const, value: instanceId }],
      } as Parameters<typeof draft.set>[1]);
      const parentDraft = draft.get(parentId);
      if (parentDraft) {
        draft.set(parentId, {
          ...parentDraft,
          children: parentDraft.children.map((c) =>
            c.type === "id" && c.value === instanceId ? { type: "id" as const, value: boxId } : c
          ),
        });
      }
    });
    $selectedInstanceSelector.set([boxId]);
    onClose();
  }

  function handleSelectParent() {
    const instances = $instances.get();
    for (const [, inst] of instances) {
      for (const child of inst.children) {
        if (child.type === "id" && child.value === instanceId) {
          $selectedInstanceSelector.set([inst.id]);
          onClose();
          return;
        }
      }
    }
    onClose();
  }

  function handleDelete() {
    const { updated, deleted } = deleteInstance(instanceId, $instances.get());
    if (deleted) {
      updateData(({ instances }) => replaceMap(instances, updated));
      $selectedInstanceSelector.set(undefined);
    }
    onClose();
  }

  // Clamp position to viewport so menu never clips off-screen
  const hasClipboard = !!$clipboard.get();
  const menuWidth = 200;
  const menuHeight = 220;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: clampedY,
        left: clampedX,
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 7,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        zIndex: 9500,
        minWidth: menuWidth,
        padding: "4px 0",
        fontFamily: C.font,
      }}
    >
      <Item label={t.commands.copy} shortcut="⌘C" onClick={handleCopy} />
      <Item label={t.commands.cut} shortcut="⌘X" onClick={handleCut} />
      {hasClipboard && <Item label={t.commands.paste} shortcut="⌘V" onClick={handlePaste} />}
      <Separator />
      <Item label={t.commands.duplicate} shortcut="⌘D" onClick={handleDuplicate} />
      <Item label={t.commands.wrapInBox} onClick={handleWrapInBox} />
      <Item label={t.commands.selectParent} onClick={handleSelectParent} />
      <Separator />
      <Item label={t.commands.delete} shortcut="Del" danger onClick={handleDelete} />
    </div>,
    document.body
  );
}
