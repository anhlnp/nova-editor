// FA-007 — canvas drag-reparent. Runs inside the /canvas iframe. Press-drag on
// the already-selected element to move it to a new parent/index. Drop target is
// resolved from the element under the pointer (above/below/into by vertical
// ratio, mirroring the navigator DnD). On release we postMessage the intent to
// the builder (write leader, ADR-NB-018); the actual tree mutation is applied
// there via lib/treeMove.applyReparent so the reindexing rules live in one place.
import { selectorIdAttribute } from "@webstudio-is/react-sdk";
import { $selectedInstanceSelector, $isPreviewMode } from "@/lib/nano-states";
import { $instances } from "@/lib/data-stores";
import { buildParentMap, isAncestorOf, canAcceptChildren, type DropPosition } from "@/lib/treeMove";

const THRESHOLD = 4; // px before a press becomes a drag (so clicks still select)
const ACCENT = "#7c3aed";

type DragCtx = {
  draggedId: string;
  startX: number;
  startY: number;
  dragging: boolean;
  targetId: string | null;
  position: DropPosition | null;
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
  let indicator: HTMLDivElement | null = null;

  const overlayEl = () => document.querySelector<HTMLElement>("[data-nova-overlay]");

  const ensureIndicator = (): HTMLDivElement => {
    if (indicator) return indicator;
    const el = document.createElement("div");
    el.id = "nova-reparent-indicator";
    el.style.cssText =
      "position:fixed;pointer-events:none;z-index:2147483001;box-sizing:border-box;transition:top 0.08s ease, left 0.08s ease, width 0.08s ease, height 0.08s ease;";

    const tooltip = document.createElement("div");
    tooltip.id = "nova-reparent-indicator-tooltip";
    tooltip.style.cssText =
      "position:absolute;background:#7c3aed;color:#fff;font-family:sans-serif;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:4px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,0.25);transition:opacity 0.15s;";
    el.appendChild(tooltip);

    document.body.appendChild(el);
    indicator = el;
    return el;
  };

  const clearIndicator = () => {
    indicator?.remove();
    indicator = null;
  };

  const positionFor = (target: HTMLElement, clientY: number, component: string): DropPosition => {
    const comp = target.getAttribute("data-ws-component");
    if (comp === "Body") return "into"; // Always drop into the root Body container

    const r = target.getBoundingClientRect();
    const ratio = (clientY - r.top) / Math.max(1, r.height);
    if (canAcceptChildren(component) && ratio > 0.25 && ratio < 0.75) return "into";
    return ratio <= 0.5 ? "above" : "below";
  };

  const paintIndicator = (target: HTMLElement, position: DropPosition) => {
    const el = ensureIndicator();
    const r = target.getBoundingClientRect();

    const tooltip = el.querySelector("#nova-reparent-indicator-tooltip") as HTMLDivElement | null;
    if (tooltip) {
      const compName = target.getAttribute("data-ws-component") || "element";
      const cleanLabel = compName.split(":").pop() || compName;
      tooltip.textContent =
        position === "into"
          ? `➔ Move inside ${cleanLabel}`
          : position === "above"
          ? `▲ Move above ${cleanLabel}`
          : `▼ Move below ${cleanLabel}`;

      if (position === "below") {
        tooltip.style.top = "4px";
        tooltip.style.transform = "none";
      } else {
        tooltip.style.top = "-4px";
        tooltip.style.transform = "translateY(-100%)";
      }
      tooltip.style.left = "4px";
    }

    if (position === "into") {
      el.style.left = `${r.left}px`;
      el.style.top = `${r.top}px`;
      el.style.width = `${r.width}px`;
      el.style.height = `${r.height}px`;
      el.style.border = `2px solid ${ACCENT}`;
      el.style.background = "rgba(124,58,237,0.08)";
      el.style.borderTop = `2px solid ${ACCENT}`;
    } else {
      const y = position === "above" ? r.top : r.bottom;
      el.style.left = `${r.left}px`;
      el.style.top = `${y - 1}px`;
      el.style.width = `${r.width}px`;
      el.style.height = `0px`;
      el.style.border = "none";
      el.style.background = "none";
      el.style.borderTop = `2px solid ${ACCENT}`;
    }
  };

  const onMove = (e: MouseEvent) => {
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

      // Auto-enable grid guides when dragging starts!
      window.postMessage({ type: "nova:gridGuides", visible: true }, window.location.origin);
    }

    ctx.targetId = null;
    ctx.position = null;

    const under = document.elementFromPoint(e.clientX, e.clientY);
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
    const position = positionFor(targetEl, e.clientY, targetInst.component);
    ctx.targetId = targetId;
    ctx.position = position;
    paintIndicator(targetEl, position);
  };

  const finish = () => {
    const ov = overlayEl();
    if (ov) ov.style.pointerEvents = "";
    document.body.style.cursor = "";
    clearIndicator();

    // Auto-disable grid guides when dragging ends!
    window.postMessage({ type: "nova:gridGuides", visible: false }, window.location.origin);
  };

  const onUp = () => {
    window.removeEventListener("mousemove", onMove, true);
    window.removeEventListener("mouseup", onUp, true);
    const active = ctx;
    ctx = null;
    if (!active) return;
    finish();
    if (!active.dragging) return;

    // Suppress the click that would otherwise fire after the drag and re-select.
    const swallow = (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      window.removeEventListener("click", swallow, true);
    };
    window.addEventListener("click", swallow, true);
    setTimeout(() => window.removeEventListener("click", swallow, true), 0);

    if (active.targetId && active.position) {
      window.parent.postMessage(
        {
          type: "nova:reparent",
          draggedId: active.draggedId,
          targetId: active.targetId,
          position: active.position,
        },
        window.location.origin
      );
    }
  };

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    if ($isPreviewMode.get()) return;
    // Skip while inline-text editing.
    if (document.querySelector('[contenteditable="true"]')) return;

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
    window.addEventListener("mousemove", onMove, true);
    window.addEventListener("mouseup", onUp, true);
  };

  document.addEventListener("mousedown", onDown, true);
  return () => {
    document.removeEventListener("mousedown", onDown, true);
    window.removeEventListener("mousemove", onMove, true);
    window.removeEventListener("mouseup", onUp, true);
    finish();
  };
}
