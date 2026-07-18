// FA-007 — direct-manipulation selection overlay, rendered INSIDE the /canvas
// iframe over the selected element. Draws a bounding box + component label +
// 8 resize handles. Resizing shows a live preview box (the element itself is not
// mutated during the drag) and commits width/height to the builder on release
// via postMessage — the builder owns the write-path (ADR-NB-004), so the new
// size flows back through SyncClient and the element re-renders.
"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { selectorIdAttribute } from "@webstudio-is/react-sdk";
import { $selectedInstanceSelector, $isPreviewMode } from "@/lib/nano-states";
import { $instances } from "@/lib/data-stores";
import {
  HANDLES,
  resizeRect,
  handleCursor,
  handleFraction,
  affectedDimensions,
  type Rect,
  type ResizeHandle,
} from "./resizeMath";

const ACCENT = "#7c3aed";

function findElement(selector: string[]): HTMLElement | null {
  const raw = selector.join(",");
  const nodes = document.querySelectorAll(`[${selectorIdAttribute}]`);
  for (const el of nodes) {
    if ((el.getAttribute(selectorIdAttribute) ?? "") === raw) return el as HTMLElement;
  }
  const id = selector[0];
  for (const el of nodes) {
    const r = el.getAttribute(selectorIdAttribute) ?? "";
    if (r === id || r.startsWith(`${id},`)) return el as HTMLElement;
  }
  return null;
}

function rectOf(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

type Drag = {
  handle: ResizeHandle;
  startX: number;
  startY: number;
  startRect: Rect;
};

export function SelectionOverlay() {
  const selector = useStore($selectedInstanceSelector);
  const isPreview = useStore($isPreviewMode);
  const instances = useStore($instances);

  const [rect, setRect] = useState<Rect | null>(null);
  const [preview, setPreview] = useState<Rect | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const elRef = useRef<HTMLElement | null>(null);

  const instanceId = selector?.[0];
  const componentName = instanceId ? instances.get(instanceId)?.component ?? "Element" : "";

  // Track the selected element's rect on every frame (position changes on scroll,
  // layout, sync updates). Cheap: one getBoundingClientRect per frame while selected.
  useEffect(() => {
    if (!selector || isPreview) {
      setRect(null);
      elRef.current = null;
      return;
    }
    let raf = 0;
    const tick = () => {
      // Don't fight the preview while dragging.
      if (!dragRef.current) {
        const el = findElement(selector);
        elRef.current = el;
        const next = el ? rectOf(el) : null;
        // Only re-render when the rect actually changed (avoids 60fps churn
        // while the selection is idle).
        setRect((prev) => {
          if (prev === next) return prev;
          if (prev && next && prev.left === next.left && prev.top === next.top &&
              prev.width === next.width && prev.height === next.height) return prev;
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selector, isPreview]);

  const onHandleDown = (handle: ResizeHandle) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = elRef.current;
    if (!el) return;
    const startRect = rectOf(el);
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startRect };
    setPreview(startRect);

    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      setPreview(resizeRect(d.startRect, d.handle, ev.clientX - d.startX, ev.clientY - d.startY));
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const d = dragRef.current;
      dragRef.current = null;
      setPreview(null);
      if (!d || !instanceId) return;
      const next = resizeRect(d.startRect, d.handle, ev.clientX - d.startX, ev.clientY - d.startY);
      const dims = affectedDimensions(d.handle);
      window.parent.postMessage(
        {
          type: "nova:resizeCommit",
          instanceId,
          width: dims.width ? Math.round(next.width) : null,
          height: dims.height ? Math.round(next.height) : null,
        },
        window.location.origin
      );
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const box = preview ?? rect;
  if (!box || isPreview) return null;

  const label = `${componentName}  ${Math.round(box.width)} × ${Math.round(box.height)}`;

  return (
    <div data-nova-overlay="" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2147483000 }}>
      {/* Bounding box */}
      <div
        style={{
          position: "fixed",
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
          border: `1px solid ${ACCENT}`,
          boxSizing: "border-box",
          pointerEvents: "none",
        }}
      />
      {/* Label — above the box; flips BELOW when there's no room above so it
          never covers the instance's own content (WS-PARITY-AUDIT §8b V-5) */}
      <div
        style={{
          position: "fixed",
          left: box.left,
          top: box.top - 20 >= 0 ? box.top - 20 : box.top + box.height + 2,
          background: ACCENT,
          color: "#fff",
          font: "600 11px system-ui, sans-serif",
          padding: "2px 6px",
          borderRadius: 3,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          maxWidth: "90vw",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>
      {/* Handles */}
      {HANDLES.map((h) => {
        const { fx, fy } = handleFraction(h);
        return (
          <div
            key={h}
            onMouseDown={onHandleDown(h)}
            style={{
              position: "fixed",
              left: box.left + box.width * fx - 5,
              top: box.top + box.height * fy - 5,
              width: 10,
              height: 10,
              background: "#fff",
              border: `1.5px solid ${ACCENT}`,
              borderRadius: 2,
              boxSizing: "border-box",
              cursor: handleCursor(h),
              pointerEvents: "auto",
            }}
          />
        );
      })}
    </div>
  );
}
