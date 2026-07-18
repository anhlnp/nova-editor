"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Instances } from "@webstudio-is/sdk";
import { deleteInstance, duplicateInstance, makeInstanceId } from "@/lib/edit-operations";
import { useI18n } from "@/lib/i18n";
import { UI_VARS as C } from "@/lib/uiTheme";


type ContextMenuActions = {
  onClose: () => void;
  onStartRename: (id: string) => void;
  onInstancesChange: (next: Instances) => void;
};

type ContextMenuProps = {
  x: number;
  y: number;
  instanceId: string;
  instances: Instances;
  actions: ContextMenuActions;
};

export function ContextMenu({ x, y, instanceId, instances, actions }: ContextMenuProps) {
  const { t } = useI18n();
  const { onClose, onStartRename, onInstancesChange } = actions;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("mousedown", onMouseDown); document.removeEventListener("keydown", onKeyDown); };
  }, [onClose]);

  function handleRename() { onClose(); onStartRename(instanceId); }

  function handleDelete() {
    onClose();
    const { updated, deleted } = deleteInstance(instanceId, instances);
    if (deleted) onInstancesChange(updated);
  }

  function handleDuplicate() {
    onClose();
    const result = duplicateInstance(instanceId, instances);
    if (result) onInstancesChange(result.updated);
  }

  function handleWrapInBox() {
    onClose();
    const pm = new Map<string, string>();
    for (const [, inst] of instances) {
      for (const child of inst.children) {
        if (child.type === "id") pm.set(child.value, inst.id);
      }
    }
    const parentId = pm.get(instanceId);
    if (!parentId) return;
    const parent = instances.get(parentId);
    if (!parent) return;
    const boxId = makeInstanceId();
    const updated = new Map(instances);
    updated.set(boxId, { type: "instance" as const, id: boxId, component: "Box", children: [{ type: "id" as const, value: instanceId }] });
    updated.set(parentId, { ...parent, children: parent.children.map((c) => c.type === "id" && c.value === instanceId ? { type: "id" as const, value: boxId } : c) });
    onInstancesChange(updated);
  }

  const menuStyle: React.CSSProperties = {
    position: "fixed", top: y, left: x, background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 9000, minWidth: 160, padding: "4px 0", fontFamily: C.font,
  };

  const itemStyle = (danger = false): React.CSSProperties => ({
    display: "block", width: "100%", padding: "6px 14px", background: "none", border: "none",
    color: danger ? C.danger : C.text, fontSize: 12, fontFamily: C.font, textAlign: "left", cursor: "pointer",
  });

  if (typeof document === "undefined") return null;

  return createPortal(
    <div ref={menuRef} style={menuStyle}>
      {[
        { label: t.commands.rename, fn: handleRename },
        { label: t.commands.duplicate, fn: handleDuplicate },
        { label: t.commands.wrapInBox, fn: handleWrapInBox },
      ].map(({ label, fn }) => (
        <button key={label} style={itemStyle()} onClick={fn}
          onMouseEnter={(e) => (e.currentTarget.style.background = C.hoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
          {label}
        </button>
      ))}
      <div style={{ height: 1, background: C.border, margin: "4px 0" }} />
      <button style={itemStyle(true)} onClick={handleDelete}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.hoverBg)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
        {t.commands.delete}
      </button>
    </div>,
    document.body
  );
}
