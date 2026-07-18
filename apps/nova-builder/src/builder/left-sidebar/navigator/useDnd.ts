"use client";
import { useState, useCallback } from "react";
import type { Instances } from "@webstudio-is/sdk";
import { applyReparent, canAcceptChildren } from "@/lib/treeMove";

export type DndState = {
  draggedId: string | null;
  dropIndicatorId: string | null;
  dropPosition: "above" | "below" | "into" | null;
};

export function useDnd() {
  const [state, setState] = useState<DndState>({
    draggedId: null,
    dropIndicatorId: null,
    dropPosition: null,
  });

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: string) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
      requestAnimationFrame(() => {
        setState((s) => ({ ...s, draggedId: id }));
      });
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, id: string, component: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / rect.height;
      let dropPosition: "above" | "below" | "into";
      if (canAcceptChildren(component) && ratio > 0.25 && ratio < 0.75) {
        dropPosition = "into";
      } else if (ratio <= 0.5) {
        dropPosition = "above";
      } else {
        dropPosition = "below";
      }
      setState((s) => ({ ...s, dropIndicatorId: id, dropPosition }));
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setState((s) => ({ ...s, dropIndicatorId: null, dropPosition: null }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setState({ draggedId: null, dropIndicatorId: null, dropPosition: null });
  }, []);

  const handleDrop = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      targetId: string,
      instances: Instances,
      setInstances: (v: Instances) => void
    ) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      const reset = () =>
        setState({ draggedId: null, dropIndicatorId: null, dropPosition: null });

      const pos = state.dropPosition;
      if (!draggedId || !pos) {
        reset();
        return;
      }

      const next = applyReparent(instances, draggedId, targetId, pos);
      if (next && next !== instances) {
        // setInstances routes through updateData (transaction) in the caller
        setInstances(next);
      }
      reset();
    },
    [state.dropPosition]
  );

  return {
    ...state,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
  };
}
