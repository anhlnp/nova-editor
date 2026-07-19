// GridPositionControl — sidebar widget that renders a mini 12-column grid
// picker for grid children. Users can:
//   • Click-drag across cells to define colStart + span
//   • Edit the two number inputs (Col / Span) directly
// On change, commits grid-column CSS via the builder's writeGridColumnStyle helper.
"use client";

import { useState, useRef, useCallback } from "react";
import { UI_VARS as C } from "@/lib/uiTheme";

const COLS = 12;
const ACCENT = "var(--ui-accent)";
const ACCENT_BG = "var(--ui-accent-bg)";
const ACCENT_BORDER = "var(--ui-accent-border)";

type Props = {
  colStart: number; // 1-based
  span: number;     // 1–12
  onChange: (colStart: number, span: number) => void;
};

export function GridPositionControl({ colStart, span, onChange }: Props) {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const isDragging = useRef(false);

  // Derived preview range while dragging
  const previewStart = dragStart !== null && dragEnd !== null
    ? Math.min(dragStart, dragEnd)
    : colStart;
  const previewEnd = dragStart !== null && dragEnd !== null
    ? Math.max(dragStart, dragEnd)
    : colStart + span - 1;

  const handleCellMouseDown = useCallback((col: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setDragStart(col);
    setDragEnd(col);
  }, []);

  const handleCellMouseEnter = useCallback((col: number) => () => {
    if (!isDragging.current) return;
    setDragEnd(col);
  }, []);

  const handleCellMouseUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragStart !== null && dragEnd !== null) {
      const newStart = Math.min(dragStart, dragEnd);
      const newSpan = Math.max(dragStart, dragEnd) - newStart + 1;
      onChange(newStart, Math.min(newSpan, COLS - newStart + 1));
    }
    setDragStart(null);
    setDragEnd(null);
  }, [dragStart, dragEnd, onChange]);

  const handleColStartInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    if (isNaN(v)) return;
    const clamped = Math.max(1, Math.min(COLS, v));
    onChange(clamped, Math.min(span, COLS - clamped + 1));
  }, [span, onChange]);

  const handleSpanInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    if (isNaN(v)) return;
    const clamped = Math.max(1, Math.min(COLS - colStart + 1, v));
    onChange(colStart, clamped);
  }, [colStart, onChange]);

  return (
    <div
      style={{
        padding: "8px 10px 6px",
        borderBottom: `1px solid ${C.border}`,
        userSelect: "none",
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: C.textMuted,
          marginBottom: 6,
        }}
      >
        Grid Column Position
      </div>

      {/* Mini 12-cell grid picker */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 2,
          marginBottom: 8,
          cursor: "crosshair",
        }}
        onMouseLeave={() => {
          if (isDragging.current) {
            // Don't reset on leave — commit on mouseup wherever it lands
          }
        }}
        onMouseUp={handleCellMouseUp}
      >
        {Array.from({ length: COLS }, (_, i) => {
          const col = i + 1;
          const isActive = col >= previewStart && col <= previewEnd;
          const isStart = col === previewStart;
          const isEnd = col === previewEnd;
          return (
            <div
              key={col}
              onMouseDown={handleCellMouseDown(col)}
              onMouseEnter={handleCellMouseEnter(col)}
              title={`Column ${col}`}
              style={{
                height: 18,
                borderRadius: isStart ? "3px 0 0 3px" : isEnd ? "0 3px 3px 0" : 0,
                background: isActive ? ACCENT_BG : C.inputBg,
                border: `1px solid ${isActive ? ACCENT_BORDER : C.border}`,
                borderRight: isActive && !isEnd ? "none" : undefined,
                borderLeft: isActive && !isStart ? "none" : undefined,
                boxSizing: "border-box",
                cursor: "crosshair",
                position: "relative",
                transition: "background 0.05s ease, border-color 0.05s ease",
              }}
            >
              {/* Column number labels for first/last and every 4th */}
              {(col === 1 || col === COLS || col % 4 === 0) && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 8,
                    color: C.textMuted,
                    pointerEvents: "none",
                    lineHeight: 1,
                  }}
                >
                  {col}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Spacer for column number labels */}
      <div style={{ height: 14 }} />

      {/* Inputs row */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: C.textMuted }}>
            Col
          </span>
          <input
            type="number"
            min={1}
            max={COLS}
            value={colStart}
            onChange={handleColStartInput}
            style={{
              background: C.inputBg,
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              color: C.text,
              fontSize: 12,
              padding: "2px 4px",
              outline: "none",
              width: "100%",
              textAlign: "center",
              fontFamily: "monospace",
            }}
          />
        </label>
        <span style={{ fontSize: 14, color: C.textMuted, marginTop: 10 }}>→</span>
        <label style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: C.textMuted }}>
            End
          </span>
          <input
            type="number"
            min={colStart}
            max={COLS}
            value={colStart + span - 1}
            onChange={(e) => {
              const endVal = parseInt(e.target.value);
              if (isNaN(endVal)) return;
              const clamped = Math.max(colStart, Math.min(COLS, endVal));
              onChange(colStart, clamped - colStart + 1);
            }}
            style={{
              background: C.inputBg,
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              color: C.text,
              fontSize: 12,
              padding: "2px 4px",
              outline: "none",
              width: "100%",
              textAlign: "center",
              fontFamily: "monospace",
            }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: C.textMuted }}>
            Span
          </span>
          <input
            type="number"
            min={1}
            max={COLS - colStart + 1}
            value={span}
            onChange={handleSpanInput}
            style={{
              background: C.inputBg,
              border: `1px solid ${C.border}`,
              borderRadius: 3,
              color: C.text,
              fontSize: 12,
              padding: "2px 4px",
              outline: "none",
              width: "100%",
              textAlign: "center",
              fontFamily: "monospace",
            }}
          />
        </label>
      </div>

      {/* Range summary */}
      <div
        style={{
          marginTop: 6,
          fontSize: 10,
          color: ACCENT,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        grid-column: {colStart} / span {span}
        <span style={{ color: C.textMuted, fontWeight: 400, marginLeft: 6 }}>
          (col {colStart}–{colStart + span - 1})
        </span>
      </div>
    </div>
  );
}
