"use client";
import { useState, useEffect, useRef, useCallback } from "react";

type GhostPos = { x: number; y: number };

type UseDraggableReturn = {
  isDragging: boolean;
  ghostPos: GhostPos;
  startDrag: (componentName: string, startX: number, startY: number) => void;
};

// The canvas iframe element — resolved once and cached
function getCanvasIframe(): HTMLIFrameElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLIFrameElement>("iframe[title='Canvas']");
}

function isOverIframe(x: number, y: number): boolean {
  const iframe = getCanvasIframe();
  if (!iframe) return false;
  const rect = iframe.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function useDraggable(onInsert: (componentName: string) => void): UseDraggableReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState<GhostPos>({ x: 0, y: 0 });
  const componentRef = useRef<string>("");

  const startDrag = useCallback(
    (componentName: string, startX: number, startY: number) => {
      componentRef.current = componentName;
      setIsDragging(true);
      setGhostPos({ x: startX, y: startY });
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    function onMouseMove(e: MouseEvent) {
      setGhostPos({ x: e.clientX, y: e.clientY });
    }

    function onMouseUp(e: MouseEvent) {
      setIsDragging(false);
      if (isOverIframe(e.clientX, e.clientY)) {
        onInsert(componentRef.current);
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, onInsert]);

  return { isDragging, ghostPos, startDrag };
}
