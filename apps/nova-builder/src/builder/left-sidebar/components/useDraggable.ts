"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { selectorIdAttribute } from "@webstudio-is/react-sdk";
import { $instances, $pages } from "@/lib/data-stores";
import { $selectedInstanceSelector } from "@/lib/nano-states";
import { canAcceptChildren } from "@/lib/treeMove";

type GhostPos = { x: number; y: number };

export type DropTarget = {
  instanceId: string;
  position: "above" | "below" | "into";
} | null;

type UseDraggableReturn = {
  isDragging: boolean;
  ghostPos: GhostPos;
  draggedComponent: string;
  startDrag: (componentName: string, startX: number, startY: number) => void;
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getCanvasIframe(): HTMLIFrameElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLIFrameElement>("iframe[title='Canvas']");
}

function getIframeRect(): DOMRect | null {
  return getCanvasIframe()?.getBoundingClientRect() ?? null;
}

function isOverIframe(x: number, y: number): boolean {
  const rect = getIframeRect();
  if (!rect) return false;
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Convert page-level mouse coords to coordinates inside the iframe's viewport.
function toIframeCoords(x: number, y: number): { ix: number; iy: number } | null {
  const rect = getIframeRect();
  if (!rect) return null;
  return { ix: x - rect.left, iy: y - rect.top };
}

// Find the instance element under the pointer inside the iframe document.
function findTargetInIframe(ix: number, iy: number): { el: HTMLElement; instanceId: string } | null {
  const iframe = getCanvasIframe();
  const doc = iframe?.contentDocument;
  if (!doc) {
    console.warn("[useDraggable] findTargetInIframe: iframe contentDocument not accessible");
    return null;
  }
  const hit = doc.elementFromPoint(ix, iy);
  if (!hit) {
    console.warn("[useDraggable] findTargetInIframe: elementFromPoint returned null at:", ix, iy);
    return null;
  }
  let instEl = hit.closest(`[${selectorIdAttribute}]`) as HTMLElement | null;

  // Fallback: if hit is outside any instance (e.g. empty space), find the root Body element
  if (!instEl) {
    instEl = doc.querySelector(`[data-ws-component="Body"]`) as HTMLElement | null;
    if (instEl) {
      console.log("[useDraggable] findTargetInIframe: fell back to root Body container");
    }
  }

  if (!instEl) {
    console.log("[useDraggable] findTargetInIframe: no target and no root Body found");
    return null;
  }

  const raw = instEl.getAttribute(selectorIdAttribute) ?? "";
  const id = raw.split(",")[0];
  if (!id) return null;
  return { el: instEl, instanceId: id };
}

// Determine drop position from vertical ratio within the target element.
function computePosition(el: HTMLElement, iy: number): "above" | "below" | "into" {
  const comp = el.getAttribute("data-ws-component");
  if (comp === "Body") return "into"; // Always drop into the root Body container

  const r = el.getBoundingClientRect();
  const ratio = (iy - r.top) / Math.max(1, r.height);
  const instances = $instances.get();
  const inst = instances.get(el.getAttribute(selectorIdAttribute)?.split(",")[0] ?? "");
  if (inst && canAcceptChildren(inst.component) && ratio > 0.25 && ratio < 0.75) return "into";
  return ratio <= 0.5 ? "above" : "below";
}

// ── Primary hook ────────────────────────────────────────────────────────────

export function useDraggable(
  onInsert: (componentName: string, target: DropTarget) => void
): UseDraggableReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState<GhostPos>({ x: 0, y: 0 });
  const componentRef = useRef<string>("");
  const dropTargetRef = useRef<DropTarget>(null);

  const startDrag = useCallback(
    (componentName: string, startX: number, startY: number) => {
      componentRef.current = componentName;
      dropTargetRef.current = null;
      setIsDragging(true);
      setGhostPos({ x: startX, y: startY });
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    const iframe = getCanvasIframe();
    const rect = getIframeRect();
    let cover: HTMLDivElement | null = null;

    if (iframe && rect) {
      cover = document.createElement("div");
      cover.id = "nova-iframe-drag-cover";
      // Place it exactly over the iframe to prevent mouse moves from entering the iframe
      cover.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        z-index: 99999;
        cursor: grabbing;
        background: rgba(255,255,255,0.001);
      `;
      document.body.appendChild(cover);

      // Auto-enable grid guides when dragging starts!
      iframe.contentWindow?.postMessage({ type: "nova:gridGuides", visible: true }, window.location.origin);
    }

    function onMouseMove(e: MouseEvent) {
      setGhostPos({ x: e.clientX, y: e.clientY });

      if (!isOverIframe(e.clientX, e.clientY)) {
        dropTargetRef.current = null;
        // Tell canvas to clear indicator
        const iframe = getCanvasIframe();
        iframe?.contentWindow?.postMessage({ type: "nova:dragOverEnd" }, window.location.origin);
        return;
      }

      const iCoords = toIframeCoords(e.clientX, e.clientY);
      if (!iCoords) return;

      const hit = findTargetInIframe(iCoords.ix, iCoords.iy);
      if (!hit) {
        dropTargetRef.current = null;
        const iframe = getCanvasIframe();
        iframe?.contentWindow?.postMessage({ type: "nova:dragOverEnd" }, window.location.origin);
        return;
      }

      const position = computePosition(hit.el, iCoords.iy);
      dropTargetRef.current = { instanceId: hit.instanceId, position };

      // Tell canvas to draw drop indicator
      const iframe = getCanvasIframe();
      iframe?.contentWindow?.postMessage(
        { type: "nova:dragOverUpdate", clientX: iCoords.ix, clientY: iCoords.iy, position },
        window.location.origin
      );
    }

    function onMouseUp(e: MouseEvent) {
      setIsDragging(false);

      if (cover) {
        cover.remove();
        cover = null;
      }

      // Clear canvas indicator and turn off grid guides
      const iframe = getCanvasIframe();
      iframe?.contentWindow?.postMessage({ type: "nova:dragOverEnd" }, window.location.origin);
      iframe?.contentWindow?.postMessage({ type: "nova:gridGuides", visible: false }, window.location.origin);

      if (isOverIframe(e.clientX, e.clientY)) {
        onInsert(componentRef.current, dropTargetRef.current);
      }
      dropTargetRef.current = null;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (cover) {
        cover.remove();
      }
      const iframe = getCanvasIframe();
      iframe?.contentWindow?.postMessage({ type: "nova:gridGuides", visible: false }, window.location.origin);
    };
  }, [isDragging, onInsert]);

  return { isDragging, ghostPos, draggedComponent: componentRef.current, startDrag };
}
