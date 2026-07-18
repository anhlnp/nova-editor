"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@nanostores/react";
import { $registeredComponentMetas, $selectedInstanceSelector } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { $instances, $pages } from "@/lib/data-stores";
import { ComponentItem } from "./ComponentItem";
import { useDraggable } from "./useDraggable";
import { useI18n } from "@/lib/i18n";
import { UI_VARS as C } from "@/lib/uiTheme";


function newInstanceId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `inst_${s}`;
}

// Components that carry inline text as their primary content.
const TEXT_COMPONENTS = new Set([
  "Heading", "Paragraph", "Text", "Button", "Link", "Label",
  "RichText", "Bold", "Italic", "Span",
]);

function defaultChildren(componentName: string): { type: "id" | "text"; value: string }[] {
  const bare = componentName.split(":").pop() ?? componentName;
  if (!TEXT_COMPONENTS.has(bare)) return [];
  const labels: Record<string, string> = {
    Heading: "Heading",
    Paragraph: "Text paragraph",
    Text: "Text",
    Button: "Button",
    Link: "Link",
    Label: "Label",
  };
  return [{ type: "text", value: labels[bare] ?? bare }];
}

function insertComponent(componentName: string) {
  const instances = $instances.get();
  const pages = $pages.get();
  const selector = $selectedInstanceSelector.get();

  const newId = newInstanceId();
  const newInstance = {
    type: "instance" as const,
    id: newId,
    component: componentName,
    label: componentName.split(":").pop() ?? componentName,
    children: defaultChildren(componentName),
  };

  const selectedId = selector?.[0];
  let parentId: string | null = selectedId ?? null;

  if (!parentId && pages) {
    const page = pages.pages.get(pages.homePageId);
    parentId = page?.rootInstanceId ?? null;
  }

  updateData(({ instances: draft }) => {
    draft.set(newId, newInstance as Parameters<typeof draft.set>[1]);
    if (parentId) {
      const parent = draft.get(parentId);
      if (parent) {
        draft.set(parentId, {
          ...parent,
          children: [...parent.children, { type: "id" as const, value: newId }],
        });
      }
    }
  });
  $selectedInstanceSelector.set([newId]);
}

export function ComponentsPanel() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const metas = useStore($registeredComponentMetas);

  const { isDragging, ghostPos, startDrag } = useDraggable(insertComponent);

  const filtered = [...metas.entries()]
    .filter(([name]) => !search || name.toLowerCase().includes(search.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b));

  const grouped = new Map<string, [string, (typeof filtered)[0][1]][]>();
  for (const item of filtered) {
    const cat = (item[1] as { category?: string }).category ?? "GENERAL";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(item);
  }
  const categories = [...grouped.keys()].sort();

  function handleMouseDown(e: React.MouseEvent, componentName: string) {
    e.preventDefault();
    startDrag(componentName, e.clientX, e.clientY);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Search */}
      <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <input
          type="text"
          placeholder={t.builder.searchComponents}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: C.input,
            border: `1px solid ${C.inputBorder}`,
            borderRadius: 5,
            color: C.text,
            fontSize: 13,
            fontFamily: C.font,
            padding: "5px 8px",
            boxSizing: "border-box",
            outline: "none",
          }}
        />
      </div>

      {/* Component list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {categories.length === 0 ? (
          <div style={{ padding: "12px", fontSize: 13, color: C.textMuted, fontFamily: C.font }}>
            {metas.size === 0 ? t.builder.noComponentsRegistered : t.builder.noComponentMatches}
          </div>
        ) : (
          categories.map((cat) => (
            <details key={cat} open style={{ borderBottom: `1px solid ${C.border}` }}>
              <summary
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  fontFamily: C.font,
                  color: C.textMuted,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  userSelect: "none",
                  listStyle: "none",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {cat}
              </summary>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 10px" }}>
                {grouped.get(cat)!.map(([name]) => {
                  const label = name.split(":").pop() ?? name;
                  return (
                    <ComponentItem
                      key={name}
                      name={name}
                      label={label}
                      onMouseDown={handleMouseDown}
                      onClick={insertComponent}
                    />
                  );
                })}
              </div>
            </details>
          ))
        )}
      </div>

      {/* Drag ghost — follows cursor while dragging */}
      {isDragging &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: ghostPos.y - 12,
              left: ghostPos.x + 12,
              background: "rgba(139,92,246,0.9)",
              color: "#fff",
              fontSize: 13,
              fontFamily: C.font,
              padding: "3px 8px",
              borderRadius: 5,
              pointerEvents: "none",
              zIndex: 9999,
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              whiteSpace: "nowrap",
            }}
          >
            + Component
          </div>,
          document.body
        )}
    </div>
  );
}
