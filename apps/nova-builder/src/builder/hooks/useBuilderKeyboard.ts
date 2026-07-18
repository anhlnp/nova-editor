"use client";
// Global keyboard shortcuts for the builder page. Editor commands (undo/redo,
// copy/paste/duplicate/delete, ⌘K, open-AI) come from the command registry
// (builder/commands.ts, M1) — ONE definition shared with the palette. Only
// page-bound actions (save, zoom, fit, shortcuts dialog) stay local because
// they close over page state.

import { useEffect } from "react";
import { $canvasZoom } from "@/lib/nano-states";
import { matchCommand } from "@/builder/commands";
import { isEditableTarget } from "@/lib/edit-operations";

export function useBuilderKeyboard(options: {
  enabled: boolean;
  onSave: () => void;
  onFitToWidth: () => void;
  onToggleShortcuts: () => void;
}) {
  const { enabled, onSave, onFitToWidth, onToggleShortcuts } = options;

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      // Page-bound shortcuts first
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "0") {
        e.preventDefault();
        $canvasZoom.set(1);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "1") {
        e.preventDefault();
        onFitToWidth();
        return;
      }
      if (e.key === "?" && !isEditableTarget(e)) {
        e.preventDefault();
        onToggleShortcuts();
        return;
      }

      // Registry commands
      const command = matchCommand(e);
      if (!command) return;
      if (command.disableOnInputLike && isEditableTarget(e)) return;
      e.preventDefault();
      command.run();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onSave, onFitToWidth, onToggleShortcuts]);
}
