// FA-007 — direct-manipulation selection overlay, rendered INSIDE the /canvas
// iframe over the selected element. Draws a bounding box + component label +
// resize handles. For elements inside a CSS grid parent:
//   • "e"/"w" handles snap to column boundaries (snap-to-grid resize)
//   • A move bar at top-center allows repositioning colStart (horizontal) and
//     reordering within parent (vertical row move)
//   • A badge shows current grid position e.g. "Col 3–8"
// Non-grid elements: 8 free resize handles (px-based width/height commit).
// Committing always postMessages to the builder which owns the write-path.
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
const COLS = 12;

// ── DOM helpers ──────────────────────────────────────────────────────────────

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

// ── Grid geometry helpers ────────────────────────────────────────────────────

/** Returns true if element has a CSS grid parent. */
function isInsideGrid(el: HTMLElement): boolean {
  const parent = el.parentElement;
  if (!parent) return false;
  return getComputedStyle(parent).display === "grid";
}

/** Compute column width and gap from the parent grid element. */
function getGridMetrics(el: HTMLElement): { colWidth: number; gap: number; parentRect: Rect } | null {
  const parent = el.parentElement;
  if (!parent) return null;
  const cs = getComputedStyle(parent);
  if (cs.display !== "grid") return null;
  const parentRect = rectOf(parent as HTMLElement);
  // gap may be "16px" or "16px 16px" — take column-gap
  const rawGap = cs.columnGap || cs.gap || "0";
  const gap = parseFloat(rawGap) || 0;
  const colWidth = (parentRect.width - gap * (COLS - 1)) / COLS;
  return { colWidth, gap, parentRect };
}

/** Parse current `grid-column` CSS of the element into colStart/span. */
function parseGridColumn(el: HTMLElement): { colStart: number; span: number } {
  const cs = getComputedStyle(el);
  const raw = cs.gridColumnStart || "auto";
  const end = cs.gridColumnEnd || "auto";
  let colStart = 1;
  let span = COLS;
  if (raw !== "auto") colStart = parseInt(raw) || 1;
  if (end.startsWith("span ")) {
    span = parseInt(end.replace("span ", "")) || COLS;
  } else if (end !== "auto") {
    const endNum = parseInt(end);
    if (!isNaN(endNum)) span = Math.max(1, endNum - colStart);
  }
  return { colStart: Math.max(1, colStart), span: Math.max(1, span) };
}

/** Convert pixel position within parent to nearest column start (1-based). */
function pixelToCol(x: number, parentLeft: number, colWidth: number, gap: number): number {
  const rel = x - parentLeft;
  const col = Math.round(rel / (colWidth + gap)) + 1;
  return Math.max(1, Math.min(COLS, col));
}

// ── Snap guides (inject/remove column highlight while dragging) ──────────────

function showSnapGuides(parentRect: Rect, colWidth: number, gap: number) {
  let el = document.getElementById("nova-snap-guides") as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = "nova-snap-guides";
    document.head.appendChild(el);
  }
  // Generate gradient stops for each column
  const stops: string[] = [];
  for (let i = 0; i < COLS; i++) {
    const left = parentRect.left + i * (colWidth + gap);
    const right = left + colWidth;
    stops.push(`rgba(124,58,237,0.10) ${left}px, rgba(124,58,237,0.10) ${right}px`);
    stops.push(`transparent ${right}px, transparent ${right + gap}px`);
  }
  el.textContent = `body::after {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147482999;
    background: linear-gradient(90deg, ${stops.join(", ")});
  }`;
}

function hideSnapGuides() {
  const el = document.getElementById("nova-snap-guides");
  if (el) el.textContent = "";
}

// ── Tooltip (floating label near cursor) ─────────────────────────────────────

function updateTooltip(text: string, x: number, y: number) {
  let el = document.getElementById("nova-grid-tooltip") as HTMLDivElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = "nova-grid-tooltip";
    el.style.cssText = [
      "position:fixed", "z-index:2147483002", "pointer-events:none",
      "background:#7c3aed", "color:#fff", "font:600 11px system-ui,sans-serif",
      "padding:2px 8px", "border-radius:4px", "white-space:nowrap",
      "box-shadow:0 2px 6px rgba(0,0,0,0.25)", "transform:translate(10px,-100%)",
    ].join(";");
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.display = "block";
}

function hideTooltip() {
  const el = document.getElementById("nova-grid-tooltip");
  if (el) el.style.display = "none";
}

// ── Drag state types ─────────────────────────────────────────────────────────

type Drag = {
  handle: ResizeHandle | "move";
  startX: number;
  startY: number;
  startRect: Rect;
  // Grid-specific
  startColStart?: number;
  startSpan?: number;
  colWidth?: number;
  gap?: number;
  parentRect?: Rect;
  parentId?: string;
};

// ── Component ────────────────────────────────────────────────────────────────

export function SelectionOverlay() {
  const selector = useStore($selectedInstanceSelector);
  const isPreview = useStore($isPreviewMode);
  const instances = useStore($instances);

  const [rect, setRect] = useState<Rect | null>(null);
  const [preview, setPreview] = useState<Rect | null>(null);
  const [isGridItem, setIsGridItem] = useState(false);
  const [gridPos, setGridPos] = useState<{ colStart: number; span: number } | null>(null);
  const [isDraggingMove, setIsDraggingMove] = useState(false);

  const dragRef = useRef<Drag | null>(null);
  const elRef = useRef<HTMLElement | null>(null);

  const instanceId = selector?.[0];
  const instance = instanceId ? instances.get(instanceId) : undefined;
  const componentName = instance?.component?.split(":").pop() ?? "Element";

  // ── RAF tracker — updates rect + grid state each frame ────────────────────
  useEffect(() => {
    if (!selector || isPreview) {
      setRect(null);
      elRef.current = null;
      setIsGridItem(false);
      setGridPos(null);
      return;
    }
    let raf = 0;
    const tick = () => {
      if (!dragRef.current) {
        const el = findElement(selector);
        elRef.current = el;
        const next = el ? rectOf(el) : null;
        setRect((prev) => {
          if (!prev && !next) return prev;
          if (prev && next &&
            prev.left === next.left && prev.top === next.top &&
            prev.width === next.width && prev.height === next.height) return prev;
          return next;
        });

        if (el) {
          const inGrid = isInsideGrid(el);
          setIsGridItem(inGrid);
          if (inGrid) {
            setGridPos(parseGridColumn(el));
          } else {
            setGridPos(null);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [selector, isPreview]);

  // ── Standard (non-grid) resize handles ────────────────────────────────────
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
      setPreview(resizeRect(d.startRect, d.handle as ResizeHandle, ev.clientX - d.startX, ev.clientY - d.startY));
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const d = dragRef.current;
      dragRef.current = null;
      setPreview(null);
      if (!d || !instanceId) return;
      const next = resizeRect(d.startRect, d.handle as ResizeHandle, ev.clientX - d.startX, ev.clientY - d.startY);
      const dims = affectedDimensions(d.handle as ResizeHandle);
      window.parent.postMessage(
        { type: "nova:resizeCommit", instanceId, width: dims.width ? Math.round(next.width) : null, height: dims.height ? Math.round(next.height) : null },
        window.location.origin
      );
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ── Grid column snap-resize handles (E / W) ───────────────────────────────
  const onGridResizeDown = (handle: "e" | "w") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = elRef.current;
    if (!el) return;
    const metrics = getGridMetrics(el);
    if (!metrics) return;
    const { colWidth, gap, parentRect } = metrics;
    const startRect = rectOf(el);
    const { colStart: startColStart, span: startSpan } = parseGridColumn(el);

    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect,
      startColStart,
      startSpan,
      colWidth,
      gap,
      parentRect,
    };
    setPreview(startRect);
    showSnapGuides(parentRect, colWidth, gap);

    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d || !d.colWidth || !d.gap || !d.parentRect) return;
      const dx = ev.clientX - d.startX;
      const cw = d.colWidth;
      const g = d.gap;
      const cs0 = d.startColStart!;
      const sp0 = d.startSpan!;

      let newColStart = cs0;
      let newSpan = sp0;

      if (handle === "e") {
        // Expand/shrink right edge → change span only
        const rawWidth = d.startRect.width + dx;
        newSpan = Math.max(1, Math.min(COLS - cs0 + 1, Math.round(rawWidth / (cw + g))));
      } else {
        // Expand/shrink left edge → change colStart + adjust span
        const rawWidth = d.startRect.width - dx;
        const deltaSpan = Math.round((rawWidth - d.startRect.width) / (cw + g));
        newColStart = Math.max(1, Math.min(cs0 + sp0 - 1, cs0 - deltaSpan));
        newSpan = Math.max(1, Math.min(COLS - newColStart + 1, cs0 + sp0 - newColStart));
      }

      const snappedWidth = newSpan * cw + (newSpan - 1) * g;
      const snappedLeft = handle === "w"
        ? d.parentRect.left + (newColStart - 1) * (cw + g)
        : d.startRect.left;

      setPreview({ ...d.startRect, left: snappedLeft, width: snappedWidth });
      setGridPos({ colStart: newColStart, span: newSpan });
      updateTooltip(`Col ${newColStart}–${newColStart + newSpan - 1} (span ${newSpan})`, ev.clientX, ev.clientY);
    };

    const onUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      hideSnapGuides();
      hideTooltip();
      const d = dragRef.current;
      dragRef.current = null;
      setPreview(null);
      if (!d || !instanceId || !d.colWidth || !d.gap) return;

      const dx = ev.clientX - d.startX;
      const cw = d.colWidth;
      const g = d.gap;
      const cs0 = d.startColStart!;
      const sp0 = d.startSpan!;

      let finalColStart = cs0;
      let finalSpan = sp0;

      if (handle === "e") {
        const rawWidth = d.startRect.width + dx;
        finalSpan = Math.max(1, Math.min(COLS - cs0 + 1, Math.round(rawWidth / (cw + g))));
      } else {
        const rawWidth = d.startRect.width - dx;
        const deltaSpan = Math.round((rawWidth - d.startRect.width) / (cw + g));
        finalColStart = Math.max(1, Math.min(cs0 + sp0 - 1, cs0 - deltaSpan));
        finalSpan = Math.max(1, Math.min(COLS - finalColStart + 1, cs0 + sp0 - finalColStart));
      }

      if (finalColStart !== cs0 || finalSpan !== sp0) {
        window.parent.postMessage(
          { type: "nova:gridColumnCommit", instanceId, colStart: finalColStart, span: finalSpan },
          window.location.origin
        );
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ── Move handle — reposition colStart (horizontal) + row (vertical) ────────
  const onMoveHandleDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = elRef.current;
    if (!el) return;
    const metrics = getGridMetrics(el);
    if (!metrics) return;
    const { colWidth, gap, parentRect } = metrics;
    const startRect = rectOf(el);
    const { colStart: startColStart, span: startSpan } = parseGridColumn(el);

    // Find parent instance ID for row reorder
    const parentEl = el.parentElement;
    const parentId = parentEl?.getAttribute(selectorIdAttribute)?.split(",")[0];

    dragRef.current = {
      handle: "move",
      startX: e.clientX,
      startY: e.clientY,
      startRect,
      startColStart,
      startSpan,
      colWidth,
      gap,
      parentRect,
      parentId,
    };
    setIsDraggingMove(true);
    showSnapGuides(parentRect, colWidth, gap);

    let lastColStart = startColStart;
    let lastDeltaRow = 0;

    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d || !d.colWidth || !d.gap || !d.parentRect) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      const cw = d.colWidth;
      const g = d.gap;

      // Horizontal → colStart
      const deltaCol = Math.round(dx / (cw + g));
      const newColStart = Math.max(1, Math.min(COLS - d.startSpan! + 1, d.startColStart! + deltaCol));
      lastColStart = newColStart;

      // Vertical → row delta (rough estimate using element height + gap)
      const rowHeight = d.startRect.height + g;
      lastDeltaRow = Math.round(dy / rowHeight);

      // Preview: move element directly in DOM for smooth feel
      const snappedLeft = d.parentRect.left + (newColStart - 1) * (cw + g);
      const snappedWidth = d.startSpan! * cw + (d.startSpan! - 1) * g;
      setPreview({
        left: snappedLeft,
        top: d.startRect.top + dy,
        width: snappedWidth,
        height: d.startRect.height,
      });
      setGridPos({ colStart: newColStart, span: d.startSpan! });
      updateTooltip(`Col ${newColStart}–${newColStart + d.startSpan! - 1}`, ev.clientX, ev.clientY);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      hideSnapGuides();
      hideTooltip();
      const d = dragRef.current;
      dragRef.current = null;
      setPreview(null);
      setIsDraggingMove(false);
      if (!d || !instanceId) return;

      const cs0 = d.startColStart!;
      const sp0 = d.startSpan!;

      // Commit horizontal column position change
      if (lastColStart !== cs0) {
        window.parent.postMessage(
          { type: "nova:gridColumnCommit", instanceId, colStart: lastColStart, span: sp0 },
          window.location.origin
        );
      }

      // Commit vertical row reorder (only if moved more than 0 rows)
      if (lastDeltaRow !== 0 && d.parentId) {
        window.parent.postMessage(
          { type: "nova:reorderChild", parentId: d.parentId, childId: instanceId, deltaIndex: lastDeltaRow },
          window.location.origin
        );
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const box = preview ?? rect;
  if (!box || isPreview) return null;

  const label = `${componentName}  ${Math.round(box.width)} × ${Math.round(box.height)}`;
  const colEnd = gridPos ? gridPos.colStart + gridPos.span - 1 : null;

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
          transition: preview ? "none" : "width 0.08s ease, left 0.08s ease",
        }}
      />

      {/* Label — above the box */}
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

      {/* Grid position badge — bottom of box */}
      {isGridItem && gridPos && (
        <div
          style={{
            position: "fixed",
            left: box.left + box.width / 2,
            top: box.top + box.height + 2,
            transform: "translateX(-50%)",
            background: "rgba(124,58,237,0.85)",
            color: "#fff",
            font: "500 10px system-ui, sans-serif",
            padding: "1px 6px",
            borderRadius: 10,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Col {gridPos.colStart}–{colEnd}
        </div>
      )}

      {/* Move handle (top-center bar) — only for grid items */}
      {isGridItem && (
        <div
          data-nova-move-handle=""
          onMouseDown={onMoveHandleDown}
          title="Drag to move"
          style={{
            position: "fixed",
            left: box.left + box.width / 2 - 20,
            top: box.top - 6,
            width: 40,
            height: 6,
            background: ACCENT,
            borderRadius: 3,
            cursor: isDraggingMove ? "grabbing" : "grab",
            pointerEvents: "auto",
            opacity: 0.9,
            transition: "transform 0.1s ease",
            transform: isDraggingMove ? "scaleX(1.1)" : "scaleX(1)",
          }}
        />
      )}

      {/* Handles */}
      {isGridItem ? (
        <>
          {/* Left (W) grid resize handle */}
          <div
            onMouseDown={onGridResizeDown("w")}
            style={{
              position: "fixed",
              left: box.left - 5,
              top: box.top + box.height * 0.25,
              width: 10,
              height: box.height * 0.5,
              background: ACCENT,
              borderRadius: 3,
              cursor: "col-resize",
              pointerEvents: "auto",
              opacity: 0.85,
              transition: "transform 0.1s ease",
              transform: "scale(1)",
            }}
          />
          {/* Right (E) grid resize handle */}
          <div
            onMouseDown={onGridResizeDown("e")}
            style={{
              position: "fixed",
              left: box.left + box.width - 5,
              top: box.top + box.height * 0.25,
              width: 10,
              height: box.height * 0.5,
              background: ACCENT,
              borderRadius: 3,
              cursor: "col-resize",
              pointerEvents: "auto",
              opacity: 0.85,
              transition: "transform 0.1s ease",
              transform: "scale(1)",
            }}
          />
          {/* Top (N) and Bottom (S) free resize handles for height */}
          {(["n", "s"] as ResizeHandle[]).map((h) => {
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
                  transition: "transform 0.1s ease",
                }}
              />
            );
          })}
        </>
      ) : (
        HANDLES.map((h) => {
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
                transition: "transform 0.1s ease",
                transform: dragRef.current?.handle === h ? "scale(1.3)" : "scale(1)",
              }}
            />
          );
        })
      )}
    </div>
  );
}
