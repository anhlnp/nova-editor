import React, { useState, useMemo, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { nanoid } from "nanoid";
import { $registeredComponentMetas, $selectedInstanceSelector } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { $pages, $instances } from "@/lib/data-stores";
import { useDraggable, type DropTarget } from "./useDraggable";
import { registry, getRegistry } from "./ComponentRegistry";
import { Input, ScrollShadow } from "@heroui/react";

// ── Lazy Render Component Preview ───────────────────────────────────────────
function LazyComponentPreview({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "80px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full flex items-center justify-center min-h-[60px]">
      {isVisible ? children : (
        <div className="flex flex-col items-center justify-center gap-2 w-full py-4">
          <div className="w-8 h-8 rounded-full border-2 border-default-200 border-t-default-400 animate-spin" />
        </div>
      )}
    </div>
  );
}

// ── Custom Collapsible Chevron Icon ─────────────────────────────────────────
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={`w-3 h-3 text-default-500 transition-transform duration-200 ${expanded ? "transform rotate-90" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function ComponentsPanel() {
  const registeredComponentMetas = useStore($registeredComponentMetas);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Track collapsible categories. Default to expanded (false means not collapsed)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Insertion helper logic
  function insertComponent(componentName: string, dropTarget: DropTarget = null) {
    const instances = $instances.get();
    const selector = $selectedInstanceSelector.get();
    const pages = $pages.get();

    if (!pages) {
      console.error("[builder] insertComponent error: No pages found!");
      return;
    }

    console.log("[builder] insertComponent target resolve:", {
      componentName,
      dropTarget,
      selector,
    });

    const activePage = pages.pages ? pages.pages.get(pages.homePageId) : null;
    if (!activePage) {
      console.error("[builder] insertComponent error: No home page found!");
      return;
    }

    let parentId: string | null = null;
    let insertIdx: number | null = null;

    if (dropTarget) {
      if (dropTarget.position === "into") {
        parentId = dropTarget.instanceId;
      } else {
        const targetInst = instances.get(dropTarget.instanceId);
        if (targetInst) {
          for (const [id, inst] of instances.entries()) {
            const childIdx = inst.children.findIndex(
              (c) => c.type === "id" && c.value === dropTarget.instanceId
            );
            if (childIdx !== -1) {
              parentId = id;
              insertIdx = dropTarget.position === "above" ? childIdx : childIdx + 1;
              break;
            }
          }
        }
      }
    } else if (selector && selector.length > 0) {
      const selectedId = selector[0];
      const targetInstance = instances.get(selectedId);
      if (targetInstance) {
        if (targetInstance.component === "heroui:HeroUICol" || targetInstance.component === "heroui:HeroUIRow") {
          parentId = selectedId;
          insertIdx = targetInstance.children.length;
        } else {
          // Look up parent of the selected instance
          for (const [id, inst] of instances.entries()) {
            const childIdx = inst.children.findIndex((c) => c.type === "id" && c.value === selectedId);
            if (childIdx !== -1) {
              parentId = id;
              insertIdx = childIdx + 1;
              break;
            }
          }
        }
      }
    }

    if (!parentId) {
      parentId = activePage.rootInstanceId;
    }

    if (parentId && insertIdx === null) {
      const root = instances.get(parentId);
      if (root) {
        insertIdx = root.children.length;
      }
    }

    const newId = nanoid();
    const regEntry = getRegistry().find((r) => r.id === componentName);

    // Build instance based on registry entry or fall back to default builder
    const newInstance = regEntry ? regEntry.createInstance(newId) : {
      type: "instance" as const,
      id: newId,
      component: componentName,
      label: componentName.replace("heroui:", ""),
      children: [],
    };

    // Composite components handling (Rows/Cols layout logic)
    if (componentName === "heroui:HeroUI2Cols" || componentName === "heroui:HeroUI3Cols" || componentName === "heroui:HeroUI4Cols") {
      const colCount = componentName === "heroui:HeroUI2Cols" ? 2 : componentName === "heroui:HeroUI3Cols" ? 3 : 4;
      const spans = colCount === 2 ? [6, 6] : colCount === 3 ? [4, 4, 4] : [3, 3, 3, 3];
      const rowId = newId;

      updateData(({ instances: draft, props }) => {
        // 1. Create Row
        draft.set(rowId, {
          type: "instance" as const,
          id: rowId,
          component: "heroui:HeroUIRow",
          label: `${colCount} Columns Row`,
          children: [],
        });

        // 2. Create Columns
        const rowChildren: Array<{ type: "id"; value: string }> = [];
        spans.forEach((span, index) => {
          const id = nanoid();
          rowChildren.push({ type: "id", value: id });
          draft.set(id, {
            type: "instance" as const,
            id,
            component: "heroui:HeroUICol",
            label: `Column ${index + 1}`,
            children: [],
          });

          const propId = `${id}:span`;
          props.set(propId, {
            id: propId,
            instanceId: id,
            name: "span",
            type: "number" as const,
            value: span,
          } as Parameters<typeof props.set>[1]);
        });

        // Update Row children in draft
        const rowInstance = draft.get(rowId);
        if (rowInstance) {
          draft.set(rowId, { ...rowInstance, children: rowChildren });
        }

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
          }
        }
      });

      $selectedInstanceSelector.set([rowId]);
      return;
    }

    // Default simple component insertion
    updateData(({ instances: draft }) => {
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
        }
      }
    });

    $selectedInstanceSelector.set([newId]);
  }

  // Draggable hook integration
  const { isDragging, ghostPos, draggedComponent, startDrag } = useDraggable(insertComponent);

  const handleMouseDown = (e: React.MouseEvent, componentName: string) => {
    e.preventDefault();
    if (e.button !== 0) return;
    startDrag(componentName, e.clientX, e.clientY);
  };

  // Filter components registry
  const filteredRegistry = useMemo(() => {
    const registryList = getRegistry();
    if (!searchQuery) return registryList;
    const q = searchQuery.toLowerCase();
    return registryList.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Group by category
  const categoriesMap = useMemo(() => {
    const map: Record<string, typeof registry> = {
      General: [],
      Forms: [],
      "Data Display": [],
      Navigation: [],
      Feedback: [],
      Overlay: [],
      Layout: [],
      Utilities: [],
      Dynamic: [],
    };

    filteredRegistry.forEach((item) => {
      if (map[item.category]) {
        map[item.category].push(item);
      } else {
        map[item.category] = [item];
      }
    });

    return map;
  }, [filteredRegistry]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  return (
    <div className="flex flex-col h-full bg-background border-r border-divider select-none relative overflow-hidden">
      {/* Header & Search */}
      <div className="p-3.5 flex flex-col gap-2 border-b border-divider bg-background/50 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-default-500">Insert Components</span>
        </div>
        <Input
          size="sm"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          isClearable
          onClear={() => setSearchQuery("")}
          classNames={{
            inputWrapper: "bg-default-100/50 hover:bg-default-100 border border-divider/60 hover:border-divider focus-within:border-primary transition-colors",
            input: "text-xs",
          }}
          startContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-default-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
            </svg>
          }
        />
      </div>

      {/* Component Explorer List */}
      <ScrollShadow className="flex-1 p-3 flex flex-col gap-4 overflow-y-auto">
        {Object.entries(categoriesMap).map(([category, items]) => {
          if (items.length === 0) return null;
          const isCollapsed = !!collapsedCategories[category];

          return (
            <div key={category} className="flex flex-col gap-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full py-1 text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronIcon expanded={!isCollapsed} />
                  <span className="text-xs font-semibold text-default-600 tracking-wide">{category}</span>
                </div>
                <span className="text-[10px] text-default-400 bg-default-100 px-1.5 py-0.5 rounded-full font-medium">
                  {items.length}
                </span>
              </button>

              {/* Grid of Preview Cards */}
              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-3.5 mt-1">
                  {items.map((item) => {
                    const isSelected = selectedId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`group relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col bg-background/40 backdrop-blur-md select-none ${isSelected
                          ? "border-primary bg-primary-50/10 shadow-[0_0_12px_rgba(0,111,238,0.2)]"
                          : "border-divider hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50 hover:scale-[1.02] transform"
                          }`}
                        onClick={() => {
                          setSelectedId(item.id);
                        }}
                        onDoubleClick={() => {
                          insertComponent(item.id);
                        }}
                        onMouseDown={(e) => handleMouseDown(e, item.id)}
                      >
                        {/* Real Rendered Visual Preview Wrapper */}
                        <div className="w-full min-h-[110px] flex items-center justify-center p-4 relative overflow-hidden bg-default-50/30 border-b border-divider/40">
                          <div className="transform scale-[0.85] origin-center max-w-full max-h-full flex items-center justify-center pointer-events-none select-none">
                            <LazyComponentPreview>
                              {item.preview}
                            </LazyComponentPreview>
                          </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="p-3 flex flex-col gap-0.5 bg-background/25">
                          <div className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                            {isSelected ? (
                              <>
                                <span className="text-primary text-[11px] font-bold">✓</span>
                                <span className="text-primary">{item.name}</span>
                              </>
                            ) : (
                              item.name
                            )}
                          </div>
                          <p className="text-[10px] text-default-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </ScrollShadow>

      {/* Floating Draggable Ghost Preview */}
      {isDragging && draggedComponent && (
        <div
          className="fixed pointer-events-none z-50 bg-primary/20 border border-primary text-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm"
          style={{
            left: ghostPos.x + 10,
            top: ghostPos.y + 10,
          }}
        >
          <span>➕</span>
          <span>{draggedComponent.replace("heroui:HeroUI", "").replace("heroui:", "")}</span>
        </div>
      )}
    </div>
  );
}
