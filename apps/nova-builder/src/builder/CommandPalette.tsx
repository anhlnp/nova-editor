"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@nanostores/react";
import {
  $commandPaletteOpen,
  $selectedPageId,
  $selectedInstanceSelector,
  $registeredComponentMetas,
} from "@/lib/nano-states";
import { $pages } from "@/lib/data-stores";
import { updateData } from "@/lib/transactions";
import { makeInstanceId } from "@/lib/edit-operations";
import { getCommands, hotkeyHint } from "./commands";
import { useI18n } from "@/lib/i18n";
import { UI_VARS as C } from "@/lib/uiTheme";


type Group = "Pages" | "Components" | "Actions";

type CommandItem = {
  id: string;
  label: string;
  group: Group;
  shortcut?: string;
  keywords: string[];
  action: () => void;
};

// ── Shared action helpers (read atoms at call-time, not at render) ────────────

function closePalette() {
  $commandPaletteOpen.set(false);
}

// Palette-specific: insert a component under the selection (or page root).
// Runs inside an updateData transaction (undoable + canvas-synced, M1).
function insertComponentCmd(componentName: string) {
  const pages = $pages.get();
  const selector = $selectedInstanceSelector.get();
  const newId = makeInstanceId();
  const selectedId = selector?.[0];
  let parentId: string | null = selectedId ?? null;
  if (!parentId && pages) {
    const page = pages.pages.get(pages.homePageId);
    parentId = page?.rootInstanceId ?? null;
  }
  updateData(({ instances }) => {
    instances.set(newId, {
      type: "instance" as const,
      id: newId,
      component: componentName,
      label: componentName.split(":").pop() ?? componentName,
      children: [],
    } as Parameters<typeof instances.set>[1]);
    if (parentId) {
      const parent = instances.get(parentId);
      if (parent) {
        instances.set(parentId, {
          ...parent,
          children: [...parent.children, { type: "id" as const, value: newId }],
        });
      }
    }
  });
  $selectedInstanceSelector.set([newId]);
  closePalette();
}

// ── Component: CommandPalette ─────────────────────────────────────────────────

export function CommandPalette() {
  const { t } = useI18n();
  const isOpen = useStore($commandPaletteOpen);
  const pages = useStore($pages);
  const metas = useStore($registeredComponentMetas);

  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIdx(0);
      // Defer focus so the DOM is ready
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Scroll active item into view when activeIdx changes
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const allItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // Pages group
    if (pages) {
      for (const page of pages.pages.values()) {
        items.push({
          id: `page:${page.id}`,
          label: page.name,
          group: "Pages",
          keywords: [page.path ?? "", "page", "go", "navigate", "open"],
          action: () => { $selectedPageId.set(page.id); closePalette(); },
        });
      }
    }

    // Components group (first 40 to keep list manageable)
    let componentCount = 0;
    for (const [name, meta] of metas) {
      if (componentCount >= 40) break;
      const rawLabel = (meta as Record<string, unknown>).label;
      const label = typeof rawLabel === "string" ? rawLabel : (name.split(":").pop() ?? name);
      const rawCategory = (meta as Record<string, unknown>).category;
      const category = typeof rawCategory === "string" ? rawCategory : "";
      items.push({
        id: `component:${name}`,
        label: `${t.commands.insertPrefix} ${label}`,
        group: "Components",
        keywords: [label, name, "insert", "add", "component", category],
        action: () => insertComponentCmd(name),
      });
      componentCount++;
    }

    // Actions group — sourced from the command registry (one definition
    // shared with keyboard shortcuts, M1); labels from the i18n dictionary.
    for (const command of getCommands()) {
      if (command.hiddenInPalette) continue;
      items.push({
        id: `action:${command.name}`,
        label: t.commands[command.labelKey],
        group: "Actions",
        shortcut: hotkeyHint(command),
        keywords: [command.name, command.labelKey],
        action: () => {
          command.run();
          closePalette();
        },
      });
    }

    return items;
  }, [pages, metas, t]);

  // Filter by query
  const filtered = useMemo<CommandItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((item) => {
      const haystack = [item.label, ...item.keywords].join(" ").toLowerCase();
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [allItems, query]);

  // Group the filtered results preserving group order
  const groupOrder: Group[] = ["Pages", "Components", "Actions"];
  const grouped = useMemo(() => {
    const map = new Map<Group, CommandItem[]>(groupOrder.map((g) => [g, []]));
    for (const item of filtered) {
      map.get(item.group)!.push(item);
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // Flat index → item (for keyboard nav)
  const flatItems = useMemo(
    () => groupOrder.flatMap((g) => grouped.get(g) ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grouped]
  );

  // Clamp activeIdx when filtered list changes
  useEffect(() => {
    setActiveIdx((idx) => Math.min(idx, Math.max(0, flatItems.length - 1)));
  }, [flatItems.length]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { closePalette(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      flatItems[activeIdx]?.action();
    }
  }

  if (!isOpen || typeof document === "undefined") return null;

  let flatCounter = 0;

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80, background: C.overlay }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) closePalette(); }}
    >
      <div style={{ width: 560, maxWidth: "90vw", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 24px 64px rgba(0,0,0,0.6)", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Search input */}
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, components, actions…"
            style={{ width: "100%", background: "none", border: "none", outline: "none", color: C.text, fontSize: 15, fontFamily: C.font, caretColor: "#7c3aed" }}
          />
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {flatItems.length === 0 && (
            <div style={{ padding: "20px 14px", color: C.textMuted, fontSize: 13, fontFamily: C.font }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {groupOrder.map((group) => {
            const groupItems = grouped.get(group) ?? [];
            if (groupItems.length === 0) return null;

            return (
              <div key={group}>
                {/* Group heading */}
                <div style={{ padding: "8px 14px 4px", fontSize: 12, fontFamily: C.font, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
                  {group}
                </div>

                {groupItems.map((item) => {
                  const itemIdx = flatCounter++;
                  const isActive = itemIdx === activeIdx;
                  return (
                    <button
                      key={item.id}
                      ref={isActive ? activeRef : undefined}
                      onClick={item.action}
                      onMouseEnter={() => setActiveIdx(itemIdx)}
                      style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        padding: "8px 14px",
                        background: isActive ? C.active : "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: 8,
                      }}
                    >
                      <span style={{ flex: 1, fontSize: 13, fontFamily: C.font, color: isActive ? C.activeText : C.text }}>
                        {item.label}
                      </span>
                      {item.shortcut && (
                        <span style={{ fontSize: 13, fontFamily: C.fontMono, color: C.textMuted, flexShrink: 0 }}>
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div style={{ padding: "6px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 14 }}>
          {[["↑↓", "Navigate"], ["↵", "Select"], ["Esc", "Close"]].map(([key, label]) => (
            <span key={key} style={{ fontSize: 13, fontFamily: C.font, color: C.textMuted }}>
              <span style={{ fontFamily: C.fontMono, color: C.text }}>{key}</span>{" "}{label}
            </span>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
