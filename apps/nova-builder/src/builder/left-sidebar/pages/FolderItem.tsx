"use client";
import { useState } from "react";
import { UI_VARS as C } from "@/lib/uiTheme";


type FolderItemHandlers = {
  onToggle: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
};

type FolderItemProps = {
  name: string;
  isExpanded: boolean;
  handlers: FolderItemHandlers;
  children?: React.ReactNode;
};

export function FolderItem({ name, isExpanded, handlers, children }: FolderItemProps) {
  const { onToggle, onRename, onDelete } = handlers;
  const [hovered, setHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);

  function commitRename() {
    const trimmed = editValue.trim();
    setIsEditing(false);
    if (trimmed && trimmed !== name) onRename(trimmed);
    else setEditValue(name);
  }

  return (
    <div>
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={onToggle}
          style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 9, padding: "0 4px 0 8px", flexShrink: 0 }}
        >
          {isExpanded ? "▼" : "▶"}
        </button>

        <span style={{ fontSize: 12, marginRight: 4, color: C.textMuted }}>⊞</span>

        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setIsEditing(false); setEditValue(name); } }}
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.4)", borderRadius: 3, color: C.text, fontSize: 12, fontFamily: C.font, padding: "2px 5px", outline: "none", minWidth: 0 }}
          />
        ) : (
          <button
            onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            style={{ flex: 1, background: hovered ? C.hoverBg : "none", border: "none", color: C.text, fontSize: 12, fontFamily: C.font, cursor: "default", textAlign: "left", padding: "6px 4px", minWidth: 0 }}
          >
            {name}
          </button>
        )}

        {hovered && !isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete folder (pages moved to parent)"
            style={{ position: "absolute", right: 6, background: "rgba(30,41,59,0.95)", border: "none", color: C.danger, cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "1px 4px", borderRadius: 3 }}
          >
            ×
          </button>
        )}
      </div>

      {isExpanded && children && (
        <div style={{ paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.06)", marginLeft: 14 }}>
          {children}
        </div>
      )}
    </div>
  );
}
