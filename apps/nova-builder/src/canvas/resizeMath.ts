// Pure geometry for canvas resize handles (FA-007). No DOM, no React — so the
// math is trivially testable and the overlay component stays a thin view.

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const HANDLES: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

// Apply a pointer delta (in element-space px) to a start rect for a given handle.
// East/south edges grow width/height; west/north edges also move the origin.
// Size is clamped to `min`.
export function resizeRect(
  start: Rect,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  min = 8
): Rect {
  let { left, top, width, height } = start;
  const east = handle === "e" || handle === "ne" || handle === "se";
  const west = handle === "w" || handle === "nw" || handle === "sw";
  const south = handle === "s" || handle === "se" || handle === "sw";
  const north = handle === "n" || handle === "ne" || handle === "nw";

  if (east) width = Math.max(min, start.width + dx);
  if (west) {
    width = Math.max(min, start.width - dx);
    left = start.left + (start.width - width);
  }
  if (south) height = Math.max(min, start.height + dy);
  if (north) {
    height = Math.max(min, start.height - dy);
    top = start.top + (start.height - height);
  }
  return { left, top, width, height };
}

export function handleCursor(handle: ResizeHandle): string {
  switch (handle) {
    case "n":
    case "s":
      return "ns-resize";
    case "e":
    case "w":
      return "ew-resize";
    case "ne":
    case "sw":
      return "nesw-resize";
    case "nw":
    case "se":
      return "nwse-resize";
  }
}

// Normalized position (0 | 0.5 | 1) of a handle within the bounding box, used to
// place the handle dot along each axis.
export function handleFraction(handle: ResizeHandle): { fx: number; fy: number } {
  const fx = handle.includes("w") ? 0 : handle.includes("e") ? 1 : 0.5;
  const fy = handle.includes("n") ? 0 : handle.includes("s") ? 1 : 0.5;
  return { fx, fy };
}

// Which CSS dimensions a handle changes — the overlay persists only these.
export function affectedDimensions(handle: ResizeHandle): {
  width: boolean;
  height: boolean;
} {
  const horizontal = handle !== "n" && handle !== "s";
  const vertical = handle !== "e" && handle !== "w";
  return { width: horizontal, height: vertical };
}
