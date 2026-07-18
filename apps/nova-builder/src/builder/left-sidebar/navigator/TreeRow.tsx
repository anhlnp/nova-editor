"use client";
import { useRef } from "react";
import { UI_VARS as C } from "@/lib/uiTheme";

// Component-specific semantic tokens derived from the uiTheme palette
// (ADR-NB-012/020 — base colors come from DARK, no independent palette).

export type InstanceNode = {
  id: string;
  component: string;
  label?: string;
  children: InstanceNode[];
};

export type TreeRowState = {
  selectedId: string | undefined;
  multiSelectedIds: readonly string[];
  expandedIds: Set<string>;
  renamingId: string | null;
};

export type TreeRowDnd = {
  draggedId: string | null;
  dropIndicatorId: string | null;
  dropPosition: "above" | "below" | "into" | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, id: string, component: string) => void;
  onDragLeave: () => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetId: string) => void;
};

export type TreeRowHandlers = {
  onSelect: (id: string, withModifier: boolean) => void;
  onToggle: (id: string) => void;
  onContextMenu: (id: string, x: number, y: number) => void;
  onRenameCommit: (id: string, newLabel: string) => void;
};

type TreeRowProps = {
  node: InstanceNode;
  depth: number;
  state: TreeRowState;
  dnd: TreeRowDnd;
  handlers: TreeRowHandlers;
};

export function TreeRow({ node, depth, state, dnd, handlers }: TreeRowProps) {
  const { selectedId, multiSelectedIds, expandedIds, renamingId } = state;
  const { draggedId, dropIndicatorId, dropPosition, onDragStart, onDragOver, onDragLeave, onDragEnd, onDrop } = dnd;
  const { onSelect, onToggle, onContextMenu, onRenameCommit } = handlers;

  const inputRef = useRef<HTMLInputElement>(null);
  const isSelected = node.id === selectedId;
  const isMultiSelected = !isSelected && multiSelectedIds.includes(node.id);
  const isExpanded = expandedIds.has(node.id);
  const isRenaming = renamingId === node.id;
  const isDragging = draggedId === node.id;
  const isDropTarget = dropIndicatorId === node.id;
  const hasChildren = node.children.length > 0;
  const label = node.label || node.component;

  const showChildren = hasChildren && isExpanded;

  function handleRenameBlur() {
    if (inputRef.current) {
      onRenameCommit(node.id, inputRef.current.value.trim() || label);
    }
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      onRenameCommit(node.id, label);
    }
  }

  const isDropInto = isDropTarget && dropPosition === "into";

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 3,
    paddingLeft: 8 + depth * 14,
    paddingRight: 6,
    height: 26,
    cursor: "pointer",
    background: isSelected
      ? C.bgSelected
      : isMultiSelected
      ? C.bgMultiSelected
      : isDropInto
      ? C.bgDropInto
      : "transparent",
    color: isSelected ? C.textSelected : C.text,
    fontSize: 12,
    fontFamily: C.font,
    borderRadius: isDropInto ? 4 : 3,
    userSelect: "none",
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    boxSizing: "border-box",
    outline: isDropInto ? `2px dashed ${C.dropIndicator}` : "none",
    borderTop:
      isDropTarget && dropPosition === "above"
        ? `2px dashed ${C.dropIndicator}`
        : "2px solid transparent",
    borderBottom:
      isDropTarget && dropPosition === "below"
        ? `2px dashed ${C.dropIndicator}`
        : "2px solid transparent",
  };

  return (
    <>
      <div
        draggable
        style={rowStyle}
        onClick={(e) => onSelect(node.id, e.ctrlKey || e.metaKey || e.shiftKey)}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(node.id, e.clientX, e.clientY);
        }}
        onMouseEnter={(e) => {
          if (!isSelected && !isMultiSelected && !isDropInto)
            (e.currentTarget as HTMLDivElement).style.background = C.bgHover;
        }}
        onMouseLeave={(e) => {
          if (!isSelected && !isMultiSelected && !isDropInto)
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
        onDragStart={(e) => onDragStart(e, node.id)}
        onDragOver={(e) => onDragOver(e, node.id, node.component)}
        onDragLeave={onDragLeave}
        onDragEnd={onDragEnd}
        onDrop={(e) => onDrop(e, node.id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(node.id);
          }}
          style={{
            width: 14,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: hasChildren ? "pointer" : "default",
            color: C.textMuted,
            fontSize: 8,
            flexShrink: 0,
            padding: 0,
          }}
        >
          {hasChildren ? (isExpanded ? "▼" : "▶") : ""}
        </button>

        {isRenaming ? (
          <input
            ref={inputRef}
            autoFocus
            defaultValue={label}
            onBlur={handleRenameBlur}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.1)",
              border: `1px solid ${C.accent}`,
              borderRadius: 3,
              color: C.text,
              fontSize: 13,
              fontFamily: C.font,
              padding: "1px 4px",
              outline: "none",
            }}
          />
        ) : (
          <>
            {/* Primary label; the component type shows as a muted tag only when
                it differs — a "Body" label on a Body no longer reads "Body Body"
                (WS-PARITY-AUDIT §8b V-7). */}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {label}
            </span>
            {node.label && node.label !== node.component && (
              <span style={{ color: isSelected ? "rgba(196,181,253,0.7)" : C.textMuted, fontSize: 11, flexShrink: 0 }}>
                {node.component}
              </span>
            )}
          </>
        )}
      </div>

      {showChildren &&
        node.children.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            state={state}
            dnd={dnd}
            handlers={handlers}
          />
        ))}
    </>
  );
}
