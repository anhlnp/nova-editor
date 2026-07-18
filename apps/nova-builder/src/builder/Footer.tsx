"use client";
import React from "react";
import { useStore } from "@nanostores/react";
import { $instances } from "@/lib/data-stores";
import { $selectedInstanceId, $selectedInstanceSelector, $multiSelectedInstanceIds } from "@/lib/nano-states";
import { $canUndo, $canRedo, undo, redo } from "@/lib/history";

function buildAncestors(
  instanceId: string,
  instances: ReturnType<typeof $instances.get>
): Array<{ id: string; label: string }> {
  // Build a parent map from the instances tree.
  const parent = new Map<string, string>();
  for (const [id, inst] of instances) {
    for (const child of inst.children) {
      if (child.type === "id") parent.set(child.value, id);
    }
  }

  const chain: Array<{ id: string; label: string }> = [];
  let current: string | undefined = instanceId;
  while (current !== undefined) {
    const inst = instances.get(current);
    if (!inst) break;
    chain.unshift({ id: current, label: inst.label ?? inst.component });
    current = parent.get(current);
  }
  return chain;
}

const btnBase: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "2px 6px",
  borderRadius: 3,
  fontSize: 13,
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
};

export function Footer() {
  const selectedId = useStore($selectedInstanceId);
  const multiSelectedIds = useStore($multiSelectedInstanceIds);
  const instances = useStore($instances);
  const canUndo = useStore($canUndo);
  const canRedo = useStore($canRedo);

  const isMultiSelect = multiSelectedIds.length > 1;
  const ancestors =
    !isMultiSelect && selectedId !== undefined ? buildAncestors(selectedId, instances) : [];

  return (
    <div
      style={{
        gridArea: "footer",
        height: 36,
        background: "#0a0a14",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: 0,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Undo / Redo buttons */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        style={{
          ...btnBase,
          color: canUndo ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
          cursor: canUndo ? "pointer" : "default",
          marginRight: 2,
        }}
      >
        ↩
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        style={{
          ...btnBase,
          color: canRedo ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
          cursor: canRedo ? "pointer" : "default",
          marginRight: 8,
        }}
      >
        ↪
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", marginRight: 8, flexShrink: 0 }} />

      {/* Multi-select badge OR breadcrumb */}
      {isMultiSelect ? (
        <span
          style={{
            fontSize: 13,
            color: "#c4b5fd",
            background: "rgba(124,58,237,0.18)",
            border: "1px solid rgba(124,58,237,0.35)",
            borderRadius: 10,
            padding: "1px 8px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {multiSelectedIds.length} selected — Ctrl+D duplicate · Del delete
        </span>
      ) : ancestors.length === 0 ? (
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          No selection
        </span>
      ) : (
        ancestors.map((item, i) => (
          <span key={item.id} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 4px", fontSize: 12 }}>
                ›
              </span>
            )}
            <button
              onClick={() => { $selectedInstanceSelector.set([item.id]); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: i === ancestors.length - 1
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(255,255,255,0.45)",
                padding: "2px 4px",
                borderRadius: 3,
              }}
            >
              {item.label}
            </button>
          </span>
        ))
      )}
    </div>
  );
}

