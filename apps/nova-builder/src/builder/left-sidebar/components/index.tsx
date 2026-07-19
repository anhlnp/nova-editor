import React, { useState, useMemo, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { nanoid } from "nanoid";
import { $registeredComponentMetas, $selectedInstanceSelector } from "@/lib/nano-states";
import { updateData } from "@/lib/transactions";
import { $pages, $instances } from "@/lib/data-stores";
import { useDraggable, type DropTarget } from "./useDraggable";
import { getRegistry } from "./ComponentRegistry";

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
      { rootMargin: "100px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full flex items-center justify-center min-h-[50px]">
      {isVisible ? children : (
        <div className="flex flex-col items-center justify-center gap-2 w-full py-4">
          <div className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
      )}
    </div>
  );
}

// ── Constraint & Scaling Visual Component Preview ────────────────────────────
function ComponentPreview({ id, children }: { id: string; children: React.ReactNode }) {
  // Identify large components that need to scale down to fit the preview card
  const isLarge = [
    "shadcn:Sidebar",
    "shadcn:Table",
    "shadcn:DataTable",
    "shadcn:Dialog",
    "shadcn:AlertDialog",
    "shadcn:Drawer",
    "shadcn:Sheet",
    "shadcn:Carousel",
    "shadcn:Command",
    "shadcn:Row",
    "shadcn:Row2Cols",
    "shadcn:Row3Cols",
    "shadcn:Row4Cols",
    "shadcn:Calendar"
  ].includes(id);

  const scaleClass = isLarge ? "scale-[0.62]" : "scale-[0.88]";

  return (
    <div className="w-full h-[120px] flex items-center justify-center relative overflow-hidden bg-muted/20 border-b border-border/40 p-4 select-none pointer-events-none">
      {/* Light dot grid background for the playground visual look */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] bg-[radial-gradient(ellipse_at_center,_var(--ui-text)_1px,_transparent_1px)] bg-[size:10px_10px]" />
      
      <div className={`transform ${scaleClass} origin-center max-w-full max-h-full flex items-center justify-center transition-all duration-300`}>
        <LazyComponentPreview>
          {children}
        </LazyComponentPreview>
      </div>
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
      className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${expanded ? "transform rotate-90" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function ComponentsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
        if (targetInstance.component === "shadcn:Col" || targetInstance.component === "shadcn:Row") {
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

    // Build instance structure using single-source-of-truth registry
    const creationResult = regEntry ? regEntry.createInstance(newId) : {
      instance: {
        type: "instance" as const,
        id: newId,
        component: componentName,
        label: componentName.replace("shadcn:", ""),
        children: [],
      }
    };

    const newInstance = creationResult.instance;

    updateData(({ instances: draft, props }) => {
      // 1. Insert main instance
      draft.set(newId, newInstance as Parameters<typeof draft.set>[1]);

      // 2. Insert child instances if composite component
      if (creationResult.childInstances) {
        creationResult.childInstances.forEach((child) => {
          draft.set(child.id, child as Parameters<typeof draft.set>[1]);
        });
      }

      // 3. Set default property metadata values if composite component
      if (creationResult.props) {
        Object.entries(creationResult.props).forEach(([propId, propVal]) => {
          props.set(propId, propVal as Parameters<typeof props.set>[1]);
        });
      }

      // 4. Update parent element's children list
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

  // Filter components registry supporting tags, categories, keywords, aliases
  const filteredRegistry = useMemo(() => {
    const registryList = getRegistry();
    if (!searchQuery) return registryList;
    const q = searchQuery.toLowerCase();
    return registryList.filter(
      (item) =>
        item.displayName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  // Group components by shadcn design system categories
  const categoriesMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof getRegistry>> = {
      Inputs: [],
      Navigation: [],
      Overlay: [],
      Layout: [],
      Display: [],
      Typography: [],
      Feedback: [],
      Advanced: [],
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
    <div className="flex flex-col h-full bg-background border-r border-border select-none relative overflow-hidden font-sans">
      {/* Header & Search (V0.dev / Figma assets style) */}
      <div className="p-4 flex flex-col gap-2.5 border-b border-border bg-background/60 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Components Library</span>
        </div>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-xs text-muted-foreground/70 pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-10 py-1.5 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border/80 focus:border-primary/60 rounded-md text-xs text-foreground placeholder:text-muted-foreground/60 transition-all outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-[10px] text-muted-foreground hover:text-foreground font-bold"
            >
              ✕
            </button>
          ) : (
            <span className="absolute right-3 text-[9px] text-muted-foreground/50 border border-border/60 px-1 rounded select-none">
              ⌘K
            </span>
          )}
        </div>
      </div>

      {/* Component Explorer List */}
      <div className="flex-1 p-4 flex flex-col gap-4.5 overflow-y-auto custom-scrollbar">
        {Object.entries(categoriesMap).map(([category, items]) => {
          if (items.length === 0) return null;
          const isCollapsed = !!collapsedCategories[category];

          return (
            <div key={category} className="flex flex-col gap-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full py-1 text-left hover:opacity-85 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <ChevronIcon expanded={!isCollapsed} />
                  <span className="text-xs font-semibold text-foreground/80 tracking-wide">{category}</span>
                </div>
                <span className="text-[9px] text-muted-foreground bg-muted/60 border border-border/50 px-1.5 py-0.5 rounded-full font-semibold">
                  {items.length}
                </span>
              </button>

              {/* Grid of Preview Cards */}
              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-3.5 mt-1.5">
                  {items.map((item) => {
                    const isSelected = selectedId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`group relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col bg-card select-none ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_0_12px_rgba(124,58,237,0.15)]"
                            : "border-border hover:shadow-md hover:border-primary/50 hover:scale-[1.02] transform active:scale-[0.98]"
                        }`}
                        onClick={() => {
                          setSelectedId(item.id);
                        }}
                        onDoubleClick={() => {
                          insertComponent(item.id);
                        }}
                        onMouseDown={(e) => handleMouseDown(e, item.id)}
                      >
                        {/* Scaled visual preview element */}
                        <ComponentPreview id={item.id}>
                          {item.preview()}
                        </ComponentPreview>

                        {/* Metadata Details */}
                        <div className="p-3.5 flex flex-col gap-0.5 bg-card/60 border-t border-border/10">
                          <div className="text-xs font-semibold flex items-center gap-1.5 text-foreground leading-none">
                            {isSelected ? (
                              <>
                                <span className="text-primary text-[10px] font-bold">✓</span>
                                <span className="text-primary">{item.displayName}</span>
                              </>
                            ) : (
                              item.displayName
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 leading-normal font-medium">
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
      </div>

      {/* Floating Drag Ghost Preview */}
      {isDragging && draggedComponent && (
        <>
          <style>{`
            @keyframes nova-pickup {
              0% { transform: scale(0.9) rotate(-2deg); }
              100% { transform: scale(1) rotate(-1deg); }
            }
          `}</style>
          <div
            className="fixed pointer-events-none z-50 bg-primary/20 border border-primary text-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-sm"
            style={{
              left: ghostPos.x + 10,
              top: ghostPos.y + 10,
              animation: "nova-pickup 0.15s ease-out forwards",
              transform: "rotate(-1deg)"
            }}
          >
            <span>➕</span>
            <span>{draggedComponent.replace("shadcn:", "")}</span>
          </div>
        </>
      )}
    </div>
  );
}
