// FA-007 — canvas drag-reparent. Runs inside the /canvas iframe. Press-drag on
// the already-selected element to move it to a new parent/index. Drop target is
// resolved from the element under the pointer (above/below/into by vertical
// ratio, mirroring the navigator DnD). On release we postMessage the intent to
// the builder (write leader, ADR-NB-018); the actual tree mutation is applied
// there via lib/treeMove.applyReparent so the reindexing rules live in one place.
import { selectorIdAttribute } from "@webstudio-is/react-sdk";
import { $selectedInstanceSelector, $isPreviewMode, $lastChangeWasReparent } from "@/lib/nano-states";
import { $instances } from "@/lib/data-stores";
import { buildParentMap, isAncestorOf, resolveDropPosition, type DropPosition } from "@/lib/treeMove";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  PlacementIndicator,
  computeIndicatorPlacement,
  getChildrenRects,
  getLocalChildrenOrientation,
} from "@webstudio-is/design-system";

const THRESHOLD = 4; // px before a press becomes a drag (so clicks still select)
const ACCENT = "#7c3aed";

type DragCtx = {
  draggedId: string;
  startX: number;
  startY: number;
  dragging: boolean;
  targetId: string | null;
  position: DropPosition | null;
  isDeleteArmed?: boolean;
  isShift?: boolean;
  hoveredCol?: number | null;
  insertIndex?: number | null;
  targetRowId?: string | null;
  originalStyle?: string | null;
};

function instanceIdOf(el: Element | null): string | null {
  const node = el?.closest(`[${selectorIdAttribute}]`);
  const raw = node?.getAttribute(selectorIdAttribute) ?? "";
  return raw ? raw.split(",")[0] : null;
}

function elementForInstance(id: string): HTMLElement | null {
  for (const el of document.querySelectorAll(`[${selectorIdAttribute}]`)) {
    const raw = el.getAttribute(selectorIdAttribute) ?? "";
    if (raw === id || raw.startsWith(`${id},`)) return el as HTMLElement;
  }
  return null;
}

export function initDragReparent(): () => void {
  let ctx: DragCtx | null = null;
  let indicatorContainer: HTMLDivElement | null = null;
  let reactRoot: Root | null = null;
  let capturedPointerId: number | null = null;
  let capturedElement: HTMLElement | null = null;
  let clearIndicatorTimeout: NodeJS.Timeout | null = null;

  const overlayEl = () => document.querySelector<HTMLElement>("[data-nova-overlay]");

  const ensureIndicatorContainer = () => {
    if (clearIndicatorTimeout) {
      clearTimeout(clearIndicatorTimeout);
      clearIndicatorTimeout = null;
    }
    if (!indicatorContainer) {
      indicatorContainer = document.createElement("div");
      indicatorContainer.id = "nova-reparent-indicator-container";
      indicatorContainer.style.cssText =
        "position: fixed; top: 0; left: 0; width: 0; height: 0; pointer-events: none; z-index: 2147483001; opacity: 0; transition: opacity 0.1s ease;";
      
      // Inject global cubic-bezier transition for the indicator lines/boxes
      const styleEl = document.createElement("style");
      styleEl.textContent = `
        #nova-reparent-indicator-container > div {
          transition: all 0.1s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
        }
      `;
      indicatorContainer.appendChild(styleEl);
      
      const reactRootContainer = document.createElement("div");
      indicatorContainer.appendChild(reactRootContainer);
      
      document.body.appendChild(indicatorContainer);
      reactRoot = createRoot(reactRootContainer);

      requestAnimationFrame(() => {
        if (indicatorContainer) indicatorContainer.style.opacity = "1";
      });
    }
  };

  const clearIndicator = () => {
    if (!indicatorContainer) return;
    indicatorContainer.style.opacity = "0";
    if (clearIndicatorTimeout) clearTimeout(clearIndicatorTimeout);
    clearIndicatorTimeout = setTimeout(() => {
      if (reactRoot) {
        try {
          reactRoot.unmount();
        } catch (err) {}
        reactRoot = null;
      }
      if (indicatorContainer) {
        indicatorContainer.remove();
        indicatorContainer = null;
      }
      clearIndicatorTimeout = null;
    }, 100);
  };

  const paintIndicator = (target: HTMLElement, position: DropPosition) => {
    ensureIndicatorContainer();

    let placement: any = null;

    if (position === "into") {
      const parentRect = target.getBoundingClientRect();
      const children = Array.from(target.children);
      const childrenRects = getChildrenRects(target, children);
      const parentComponent = target.getAttribute("data-ws-component");
      const orientation = parentComponent === "HeroUIRow" ? ("horizontal" as any) : getLocalChildrenOrientation(
        target,
        (p) => Array.from(p.children),
        childrenRects,
        0
      );
      placement = computeIndicatorPlacement({
        element: target,
        placement: {
          closestChildIndex: 0,
          indexAdjustment: 0,
          childrenOrientation: orientation,
        },
      });
    } else {
      const parent = target.parentElement;
      if (parent) {
        const children = Array.from(parent.children);
        const childIndex = children.indexOf(target);
        const childrenRects = getChildrenRects(parent, children);
        const parentComponent = parent.getAttribute("data-ws-component");
        const orientation = parentComponent === "HeroUIRow" ? ("horizontal" as any) : getLocalChildrenOrientation(
          parent,
          (p) => Array.from(p.children),
          childrenRects,
          childIndex
        );
        placement = computeIndicatorPlacement({
          element: parent,
          placement: {
            closestChildIndex: childIndex,
            indexAdjustment: position === "above" ? 0 : 1,
            childrenOrientation: orientation,
          },
        });
      }
    }

    if (placement) {
      reactRoot?.render(
        React.createElement(PlacementIndicator, { placement })
      );
    } else {
      clearIndicator();
    }
  };

  const paintCellIndicator = (rowRect: DOMRect, colWidth: number, gap: number, hoveredCol: number) => {
    ensureIndicatorContainer();

    const left = rowRect.left + (hoveredCol - 1) * colWidth + (hoveredCol - 1) * gap;

    reactRoot?.render(
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            left: `${left}px`,
            top: `${rowRect.top}px`,
            width: `${colWidth}px`,
            height: `${rowRect.height}px`,
            border: "2px dashed #7c3aed",
            background: "rgba(124, 58, 237, 0.15)",
            boxSizing: "border-box",
            borderRadius: "4px",
            transition: "all 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)",
          },
        }
      )
    );
  };

  const paintDeleteIndicator = (clientX: number, clientY: number) => {
    ensureIndicatorContainer();

    const clampX = Math.max(10, Math.min(window.innerWidth - 150, clientX));
    const clampY = Math.max(10, Math.min(window.innerHeight - 30, clientY));

    reactRoot?.render(
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            left: `${clampX}px`,
            top: `${clampY}px`,
            width: "120px",
            height: "24px",
            border: "2px dashed #ef4444",
            background: "rgba(239, 68, 68, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            backgroundColor: "#ef4444",
            fontFamily: "sans-serif",
            fontSize: "10px",
            fontWeight: "bold",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
          },
        },
        "🗑 Release to delete"
      )
    );
  };

  const handleMove = (clientX: number, clientY: number, shiftKey?: boolean) => {
    if (!ctx) return;

    // Check if dragged outside the canvas viewport
    const isOutside =
      clientX < 0 ||
      clientY < 0 ||
      clientX > window.innerWidth ||
      clientY > window.innerHeight;

    if (isOutside) {
      ctx.targetId = null;
      ctx.position = null;
      ctx.isDeleteArmed = true;
      paintDeleteIndicator(clientX, clientY);
      return;
    }

    ctx.isDeleteArmed = false;
    ctx.targetId = null;
    ctx.position = null;
    ctx.isShift = false;
    ctx.hoveredCol = null;
    ctx.insertIndex = null;
    ctx.targetRowId = null;

    const under = document.elementFromPoint(clientX, clientY);
    const targetId = instanceIdOf(under);
    const instances = $instances.get();
    if (!targetId || targetId === ctx.draggedId) {
      clearIndicator();
      return;
    }
    // Cannot drop into own subtree.
    const parentMap = buildParentMap(instances);
    if (isAncestorOf(parentMap, ctx.draggedId, targetId)) {
      clearIndicator();
      return;
    }
    const targetEl = elementForInstance(targetId);
    const targetInst = instances.get(targetId);
    if (!targetEl || !targetInst) {
      clearIndicator();
      return;
    }

    const isGridContext = targetInst.component === "HeroUIRow" || targetInst.component === "HeroUICol";
    if (shiftKey && isGridContext) {
      let rowEl = targetEl;
      let rowId = targetId;
      let rowInst = targetInst;
      
      if (rowInst.component === "HeroUICol") {
        rowEl = targetEl.parentElement!;
        rowId = instanceIdOf(rowEl)!;
        rowInst = instances.get(rowId)!;
      }

      if (rowInst.component === "HeroUIRow") {
        const rowRect = rowEl.getBoundingClientRect();
        const computedGap = window.getComputedStyle(rowEl).gap;
        const gap = parseInt(computedGap) || 16;
        const colWidth = (rowRect.width - gap * 11) / 12;
        
        const hoveredCol = Math.max(1, Math.min(12, Math.floor((clientX - rowRect.left) / colWidth) + 1));
        
        let insertIndex = rowEl.children.length;
        for (let i = 0; i < rowEl.children.length; i++) {
          const childRect = rowEl.children[i].getBoundingClientRect();
          if (clientX < childRect.left + childRect.width / 2) {
            insertIndex = i;
            break;
          }
        }

        ctx.targetRowId = rowId;
        ctx.hoveredCol = hoveredCol;
        ctx.insertIndex = insertIndex;
        ctx.isShift = true;

        paintCellIndicator(rowRect, colWidth, gap, hoveredCol);
        return;
      }
    }

    const position = resolveDropPosition(targetEl, { x: clientX, y: clientY }, targetInst.component);
    ctx.targetId = targetId;
    ctx.position = position;
    paintIndicator(targetEl, position);
  };

  const onMove = (e: PointerEvent) => {
    if (!ctx) return;
    if (!ctx.dragging) {
      if (Math.abs(e.clientX - ctx.startX) < THRESHOLD && Math.abs(e.clientY - ctx.startY) < THRESHOLD) {
        return;
      }
      ctx.dragging = true;
      // Let elementFromPoint see through our own selection chrome.
      const ov = overlayEl();
      if (ov) ov.style.pointerEvents = "none";
      document.body.style.cursor = "grabbing";

      const draggedEl = elementForInstance(ctx.draggedId);
      if (draggedEl) {
        ctx.originalStyle = draggedEl.getAttribute("style");
        draggedEl.style.transition = "opacity 0.12s ease, transform 0.12s ease";
        draggedEl.style.opacity = "0.4";
        draggedEl.style.transform = "scale(0.98)";
      }

      // Auto-enable grid guides when dragging starts!
      window.postMessage({ type: "nova:gridGuides", visible: true }, window.location.origin);
    }
    handleMove(e.clientX, e.clientY, e.shiftKey);
  };

  const onParentMove = (e: PointerEvent) => {
    if (!ctx) return;
    const iframe = window.frameElement;
    if (iframe) {
      const rect = iframe.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      handleMove(relativeX, relativeY, e.shiftKey);
    } else {
      handleMove(-1, -1, e.shiftKey);
    }
  };

  const finish = (activeCtx: DragCtx | null = ctx) => {
    const ov = overlayEl();
    if (ov) ov.style.pointerEvents = "";
    document.body.style.cursor = "";
    clearIndicator();

    if (activeCtx && activeCtx.originalStyle !== undefined) {
      const draggedEl = elementForInstance(activeCtx.draggedId);
      if (draggedEl) {
        if (activeCtx.originalStyle === null) {
          draggedEl.removeAttribute("style");
        } else {
          draggedEl.setAttribute("style", activeCtx.originalStyle);
        }
      }
    }

    // Auto-disable grid guides when dragging ends!
    window.postMessage({ type: "nova:gridGuides", visible: false }, window.location.origin);
  };

  const onUp = () => {
    window.removeEventListener("pointermove", onMove, true);
    window.removeEventListener("pointerup", onUp, true);
    try {
      window.parent.removeEventListener("pointermove", onParentMove, true);
      window.parent.removeEventListener("pointerup", onUp, true);
    } catch (e) { }

    if (capturedElement && capturedPointerId !== null) {
      try {
        capturedElement.releasePointerCapture(capturedPointerId);
      } catch (err) {
        console.warn("[dragReparent] releasePointerCapture failed:", err);
      }
    }
    capturedElement = null;
    capturedPointerId = null;

    const active = ctx;
    ctx = null;
    if (!active) return;
    finish(active);
    if (!active.dragging) return;

    // Suppress the click that would otherwise fire after the drag and re-select.
    const swallow = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      window.removeEventListener("click", swallow, true);
    };
    window.addEventListener("click", swallow, true);
    setTimeout(() => window.removeEventListener("click", swallow, true), 0);

    if (active.isDeleteArmed) {
      window.parent.postMessage(
        {
          type: "nova:deleteInstance",
          instanceId: active.draggedId,
        },
        window.location.origin
      );
      return;
    }

    if (active.isShift && active.targetRowId) {
      $lastChangeWasReparent.set(true);
      window.parent.postMessage(
        {
          type: "nova:gridMoveCommit",
          instanceId: active.draggedId,
          targetRowId: active.targetRowId,
          index: active.insertIndex ?? 0,
          colStart: active.hoveredCol,
        },
        window.location.origin
      );
      setTimeout(() => $lastChangeWasReparent.set(false), 200);
      return;
    }

    if (active.targetId && active.position) {
      $lastChangeWasReparent.set(true);
      window.parent.postMessage(
        {
          type: "nova:reparent",
          draggedId: active.draggedId,
          targetId: active.targetId,
          position: active.position,
        },
        window.location.origin
      );
      setTimeout(() => $lastChangeWasReparent.set(false), 200);
    }
  };

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    if ($isPreviewMode.get()) return;
    // Skip while inline-text editing.
    if (document.querySelector('[contenteditable="true"]')) return;
    // Skip if the click target is the SelectionOverlay's move handle or a resize handle
    // so grid repositioning doesn't accidentally trigger a reparent drag.
    const target = e.target as HTMLElement | null;
    if (target?.hasAttribute("data-nova-move-handle")) return;
    if (target?.closest("[data-nova-overlay]") && !target?.hasAttribute(selectorIdAttribute)) return;

    const pressedId = instanceIdOf(e.target as Element);
    if (!pressedId) return;
    // Root instance cannot be reparented.
    if (!buildParentMap($instances.get()).get(pressedId)) return;

    ctx = {
      draggedId: pressedId,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      targetId: null,
      position: null,
    };
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    try {
      window.parent.addEventListener("pointermove", onParentMove, true);
      window.parent.addEventListener("pointerup", onUp, true);
    } catch (e) { }

    const targetElement = e.target as HTMLElement;
    if (targetElement && typeof targetElement.setPointerCapture === "function") {
      try {
        targetElement.setPointerCapture(e.pointerId);
        capturedElement = targetElement;
        capturedPointerId = e.pointerId;
      } catch (err) {
        console.warn("[dragReparent] setPointerCapture failed:", err);
      }
    }
  };

  document.addEventListener("pointerdown", onDown, true);
  return () => {
    document.removeEventListener("pointerdown", onDown, true);
    window.removeEventListener("pointermove", onMove, true);
    window.removeEventListener("pointerup", onUp, true);
    try {
      window.parent.removeEventListener("pointermove", onParentMove, true);
      window.parent.removeEventListener("pointerup", onUp, true);
    } catch (e) { }
    if (capturedElement && capturedPointerId !== null) {
      try {
        capturedElement.releasePointerCapture(capturedPointerId);
      } catch (err) {}
    }
    capturedElement = null;
    capturedPointerId = null;
    finish();
  };
}
