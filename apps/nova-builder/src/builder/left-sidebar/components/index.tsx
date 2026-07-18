"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@nanostores/react";
import { $registeredComponentMetas, $selectedInstanceSelector } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { $instances, $pages } from "@/lib/data-stores";
import { ComponentItem } from "./ComponentItem";
import { useDraggable, type DropTarget } from "./useDraggable";
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
  "RichText", "Bold", "Italic", "Span", "HeroUIText", "HeroUIHeading", "HeroUILink"
]);

// HeroUI components that should show text children by default.
const HEROUI_TEXT_DEFAULTS: Record<string, string> = {
  "heroui:HeroUIButton": "Button",
  "heroui:HeroUIChip": "Chip",
  "heroui:HeroUICode": "code",
  "heroui:HeroUICard": "Card content",
  "heroui:HeroUIText": "Text block",
  "heroui:HeroUIHeading": "Heading",
  "heroui:HeroUILink": "Link text",
};

function defaultChildren(componentName: string): { type: "id" | "text"; value: string }[] {
  if (HEROUI_TEXT_DEFAULTS[componentName]) {
    return [{ type: "text", value: HEROUI_TEXT_DEFAULTS[componentName] }];
  }
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

function insertComponent(componentName: string, dropTarget: DropTarget = null) {
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

  // Determine parent and insertion index based on drop target
  let parentId: string | null = null;
  let insertIdx: number | null = null;

  if (dropTarget) {
    if (dropTarget.position === "into") {
      parentId = dropTarget.instanceId;
      // Append at end of the target's children
    } else {
      // above/below — find the parent of the target, insert relative to it
      const targetInst = instances.get(dropTarget.instanceId);
      if (targetInst) {
        // Find parent of drop target
        for (const [, inst] of instances) {
          const childIdx = inst.children.findIndex(
            (c) => c.type === "id" && c.value === dropTarget.instanceId
          );
          if (childIdx !== -1) {
            parentId = inst.id;
            insertIdx = dropTarget.position === "above" ? childIdx : childIdx + 1;
            break;
          }
        }
      }
    }
  }

  // Fallback: use selected instance or root
  if (!parentId) {
    const selectedId = selector?.[0];
    parentId = selectedId ?? null;
    if (!parentId && pages) {
      const page = pages.pages.get(pages.homePageId);
      parentId = page?.rootInstanceId ?? null;
    }
  }

  console.log("[builder] insertComponent target resolve:", {
    componentName,
    newId,
    parentId,
    insertIdx,
    dropTarget
  });

  // Check for multi-column layout presets
  if (
    componentName === "heroui:HeroUI2Cols" ||
    componentName === "heroui:HeroUI3Cols" ||
    componentName === "heroui:HeroUI4Cols"
  ) {
    const colCount = componentName === "heroui:HeroUI2Cols" ? 2 : componentName === "heroui:HeroUI3Cols" ? 3 : 4;
    const span = colCount === 2 ? 6 : colCount === 3 ? 4 : 3;

    const rowId = newInstanceId();
    const colIds: string[] = Array.from({ length: colCount }, () => newInstanceId());

    const rowInstance = {
      type: "instance" as const,
      id: rowId,
      component: "heroui:HeroUIRow",
      label: `${colCount} Columns`,
      children: colIds.map((id) => ({ type: "id" as const, value: id })),
    };

    updateData(({ instances: draft, props }) => {
      // 1. Add Row
      draft.set(rowId, rowInstance);

      // 2. Add Columns and their default span props
      colIds.forEach((id, index) => {
        draft.set(id, {
          type: "instance" as const,
          id,
          component: "heroui:HeroUICol",
          label: `Column ${index + 1}`,
          children: [],
        });
        
        // Register default span prop
        const propId = `${id}:span`;
        props.set(propId, {
          id: propId,
          instanceId: id,
          name: "span",
          type: "number" as const,
          value: span,
        } as Parameters<typeof props.set>[1]);
      });

      // 3. Insert Row into parent children
      if (parentId) {
        const parent = draft.get(parentId);
        if (parent) {
          const newChildren = [...parent.children];
          const child = { type: "id" as const, value: rowId };
          if (insertIdx !== null && insertIdx >= 0) {
            newChildren.splice(insertIdx, 0, child);
          } else {
            newChildren.push(child);
          }
          draft.set(parentId, { ...parent, children: newChildren });
          console.log("[builder] updateData composite parent children updated:", parentId, newChildren);
        }
      }
    });

    $selectedInstanceSelector.set([rowId]);
    return;
  }

  updateData(({ instances: draft }) => {
    console.log("[builder] updateData draft start. size:", draft.size);
    draft.set(newId, newInstance as Parameters<typeof draft.set>[1]);
    if (parentId) {
      const parent = draft.get(parentId);
      if (parent) {
        const newChildren = [...parent.children];
        const child = { type: "id" as const, value: newId };
        if (insertIdx !== null && insertIdx >= 0) {
          newChildren.splice(insertIdx, 0, child);
        } else {
          newChildren.push(child);
        }
        draft.set(parentId, { ...parent, children: newChildren });
        console.log("[builder] updateData parent children updated:", parentId, newChildren);
      } else {
        console.warn("[builder] updateData parent not found in draft Map:", parentId);
      }
    } else {
      console.warn("[builder] updateData no parentId resolved!");
    }
  });
  $selectedInstanceSelector.set([newId]);
}

// ── Visual preview icons for HeroUI components ─────────────────────────────

const HEROUI_PREVIEWS: Record<string, { icon: string; color: string; label: string }> = {
  "heroui:HeroUIButton":   { icon: "🔘", color: "#006FEE", label: "Button" },
  "heroui:HeroUIInput":    { icon: "📝", color: "#3f3f46", label: "Input" },
  "heroui:HeroUICard":     { icon: "🃏", color: "#18181b", label: "Card" },
  "heroui:HeroUISwitch":   { icon: "🔀", color: "#006FEE", label: "Switch" },
  "heroui:HeroUIChip":     { icon: "🏷️", color: "#9353d3", label: "Chip" },
  "heroui:HeroUIDivider":  { icon: "➖", color: "#27272a", label: "Divider" },
  "heroui:HeroUISpinner":  { icon: "🔄", color: "#006FEE", label: "Spinner" },
  "heroui:HeroUICode":     { icon: "💻", color: "#3f3f46", label: "Code" },
  "heroui:HeroUIProgress": { icon: "📊", color: "#006FEE", label: "Progress" },
  "heroui:HeroUIUser":     { icon: "👤", color: "#006FEE", label: "User" },
  "heroui:HeroUIRow":      { icon: "⊞", color: "#7c3aed", label: "Row (Grid)" },
  "heroui:HeroUICol":      { icon: "▯", color: "#7c3aed", label: "Column" },
  "heroui:HeroUI2Cols":    { icon: "2️⃣", color: "#7c3aed", label: "2 Columns" },
  "heroui:HeroUI3Cols":    { icon: "3️⃣", color: "#7c3aed", label: "3 Columns" },
  "heroui:HeroUI4Cols":    { icon: "4️⃣", color: "#7c3aed", label: "4 Columns" },
  "heroui:HeroUIContainer":{ icon: "📦", color: "#7c3aed", label: "Container" },
  "heroui:HeroUISection":  { icon: "📐", color: "#7c3aed", label: "Section" },
  "heroui:HeroUIFlexRow":  { icon: "↔️", color: "#7c3aed", label: "Flex Row" },
  "heroui:HeroUISpacer":   { icon: "↕️", color: "#7c3aed", label: "Spacer" },
  "heroui:HeroUIImage":    { icon: "🖼️", color: "#10b981", label: "Image" },
  "heroui:HeroUIText":     { icon: "📄", color: "#f59e0b", label: "Text" },
  "heroui:HeroUIHeading":  { icon: "🔤", color: "#f59e0b", label: "Heading" },
  "heroui:HeroUILink":     { icon: "🔗", color: "#f59e0b", label: "Link" },
};

function HeroUIPreviewItem({
  name,
  onMouseDown,
  onClick,
}: {
  name: string;
  onMouseDown: (e: React.MouseEvent, name: string) => void;
  onClick: (name: string) => void;
}) {
  const preview = HEROUI_PREVIEWS[name];
  if (!preview) return null;

  return (
    <button
      title={name}
      onMouseDown={(e) => onMouseDown(e, name)}
      onClick={() => onClick(name)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        width: 72,
        height: 64,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 8,
        cursor: "grab",
        userSelect: "none",
        transition: "all 0.15s",
        padding: "6px 4px",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(124,58,237,0.12)";
        e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{preview.icon}</span>
      <span
        style={{
          fontSize: 10,
          fontFamily: C.font,
          color: C.textMuted,
          fontWeight: 500,
          lineHeight: 1.2,
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          whiteSpace: "nowrap",
        }}
      >
        {preview.label}
      </span>
    </button>
  );
}

export function ComponentsPanel() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const metas = useStore($registeredComponentMetas);

  const { isDragging, ghostPos, draggedComponent, startDrag } = useDraggable(insertComponent);

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

  const isHeroUI = (name: string) => name.startsWith("heroui:");

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
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  padding: "8px 10px",
                }}
              >
                {grouped.get(cat)!.map(([name]) => {
                  // Render HeroUI components with visual preview cards
                  if (isHeroUI(name) && HEROUI_PREVIEWS[name]) {
                    return (
                      <HeroUIPreviewItem
                        key={name}
                        name={name}
                        onMouseDown={handleMouseDown}
                        onClick={(n) => insertComponent(n)}
                      />
                    );
                  }
                  const label = name.split(":").pop() ?? name;
                  return (
                    <ComponentItem
                      key={name}
                      name={name}
                      label={label}
                      onMouseDown={handleMouseDown}
                      onClick={(n) => insertComponent(n)}
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
            + {(draggedComponent || "Component").split(":").pop()}
          </div>,
          document.body
        )}
    </div>
  );
}
