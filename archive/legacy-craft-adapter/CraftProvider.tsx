// packages/editor/src/CraftProvider.tsx
// The bridge between Craft.js internal state and the Nova schema store.
// Implements render-loop guard (ADR-004) and delegates undo/redo to schema history (ADR-009).
"use client";

import React from "react";
import { Editor } from "@craftjs/core";
import { registry, UnknownBlock, UNKNOWN_BLOCK_TYPE } from "@studio/registry";
import type { Element } from "@studio/schema";
import { nodesToSchema } from "./craft-adapter/nodesToSchema.js";
import { schemaToNodes } from "./craft-adapter/schemaToNodes.js";
import { buildEditorResolver, makeCraftComponent } from "./craft-adapter/makeCraftComponent.js";
import { NovaRootCanvas } from "./craft-adapter/NovaRootCanvas.js";
import type { UserComponent } from "@craftjs/core";

// Module-level flag prevents re-entrancy when we're the ones patching the canvas
let isApplyingExternalPatch = false;

// Phase F (ADR-042): a TRANSIENT canvas edit — a continuous drag preview (gap/resize)
// that updates Craft visually for live feedback but is NOT persisted to the Document.
// While set, the reconciliation bridge is suppressed; the interaction commits ONE
// Document command on pointer-up (which also fixes the old "one history marker per
// pointermove" limitation). Always reset on pointer-up (the caller owns the pair).
let isTransientCanvasEdit = false;

/** Begin a transient (preview-only, non-persisted) canvas edit — see ADR-042. */
export function beginTransientCanvasEdit(): void {
  isTransientCanvasEdit = true;
}

/** End a transient canvas edit. The caller commits the final value as a Document command. */
export function endTransientCanvasEdit(): void {
  isTransientCanvasEdit = false;
}

// Resolver of Craft-wrapped (draggable/selectable) registry components (W1.2).
// NovaRootCanvas is the page root — schemaToNodes writes ROOT.type.resolvedName = "NovaRootCanvas".
// Exported so BlocksPanel can pass the wrapped components to connectors.create (Craft resolves
// components by function reference, so you must pass the SAME wrapped function that's in the resolver).
// Explicit Record type so `editorResolver[name: string]` is valid (no implicit-any TS error).
export const editorResolver: Record<string, UserComponent<Record<string, unknown>>> = {
  ...buildEditorResolver(registry),
  NovaRootCanvas,
  // Fallback for unknown/unmigrated types so a renamed/removed block (and its
  // children) loads instead of crashing/being dropped (C5.1). isCanvas so the
  // preserved children mount inside it.
  [UNKNOWN_BLOCK_TYPE]: makeCraftComponent(
    UnknownBlock as React.ComponentType<Record<string, unknown>>,
    { displayName: "Unknown Block", isCanvas: true }
  ),
};

type RenderNodeComponent = React.ComponentType<{ render: React.ReactElement }>;

interface CraftProviderProps {
  children: React.ReactNode;
  onElementsChange: (elements: Element[]) => void;
  /** Selection/hover chrome drawn per node via Craft's `onRender` (ADR-017, W1.3). */
  renderNode?: RenderNodeComponent;
  /**
   * Extra resolver entries merged into the default editorResolver. Lets the app layer
   * (apps/studio) register components that depend on app-level stores (e.g. InstanceBlock
   * which reads useProjectStore) without creating a package-layer circular dependency.
   * Pass a module-level constant so Craft sees the same reference on every render.
   */
  extraResolver?: Record<string, UserComponent<Record<string, unknown>>> | undefined;
}

export function CraftProvider({ children, onElementsChange, renderNode, extraResolver }: CraftProviderProps) {
  // Merge once via useMemo. Caller MUST pass a stable (module-level) extraResolver object —
  // the empty-deps array is intentional: the resolver must not change after Craft mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resolver = React.useMemo(
    () => (extraResolver ? { ...editorResolver, ...extraResolver } : editorResolver),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  // Fired by Craft whenever the node tree changes (prop edit, delete, move, drop).
  // NOTE: this is `onNodesChange`, NOT `onRender` — `onRender` is the per-node
  // render component, and wiring a change handler there crashes the canvas.
  // ADR-042 E1/E2 GESTURE ADAPTER. After Phase F, Craft holds NO authority for
  // discrete edits (props/style/move/delete/rename/insert/resize/gap are all
  // Document-first). The ONLY changes that legitimately reach here are the
  // documented gesture exceptions: native drag-drop (E1) and inline-text commit
  // (E2). They are captured-and-reapplied into the Document by `onElementsChange`
  // (the store's `commitCanvasGesture`), which re-projects. This is the single,
  // narrow Craft→Document path — not a generic two-way sync.
  function handleCraftChange(query: {
    getSerializedNodes: () => ReturnType<typeof schemaToNodes>;
  }) {
    // Echo guard: ignore the onNodesChange fired by our own deserialize.
    if (isApplyingExternalPatch) return;
    // A transient drag preview (gap/resize) updates Craft for live feedback but must
    // not persist; that gesture commits once on pointer-up as a Document command.
    if (isTransientCanvasEdit) return;
    const nodes = query.getSerializedNodes();
    const elements = nodesToSchema(nodes as Parameters<typeof nodesToSchema>[0]);
    onElementsChange(elements);
  }

  return (
    <Editor
      resolver={resolver}
      // W1.4: style Craft's built-in drop indicator (drawn by <Events>).
      indicator={{ success: "#7c3aed", error: "#ef4444", thickness: 2 }}
      onNodesChange={
        handleCraftChange as unknown as NonNullable<
          React.ComponentProps<typeof Editor>["onNodesChange"]
        >
      }
      {...(renderNode
        ? {
            onRender: renderNode as unknown as NonNullable<
              React.ComponentProps<typeof Editor>["onRender"]
            >,
          }
        : {})}
    >
      {children}
    </Editor>
  );
}

// Called by AI patch handler or schema migration to push external changes onto the canvas.
// Uses the module-level guard so Craft's onChange callback is silenced during the patch.
export function applySchemaToCanvas(
  editorActions: { history: { ignore: () => { deserialize: (nodes: unknown) => void } } },
  elements: Element[]
): void {
  isApplyingExternalPatch = true;
  try {
    const nodes = schemaToNodes(elements);
    editorActions.history.ignore().deserialize(nodes);
  } finally {
    isApplyingExternalPatch = false;
  }
}

// ADR-043: a targeted Document→Craft projection — run `updater` on ONE node's props
// in place. The Document stays authoritative (the caller wrote it first); this only
// projects the change to the live tree.
export type NodePatchOp = {
  nodeId: string;
  updater: (props: Record<string, unknown>) => void;
};

// ADR-043 fast path: project discrete prop/class edits to the canvas WITHOUT a full
// deserialize. The full re-deserialize (applySchemaToCanvas) unmounts+remounts every
// node and forces every RenderNode to re-measure the DOM — O(n) per edit, the Gate-0
// lag root cause (ADR-042 Risk #3). Here we update only the changed node(s) via Craft's
// setProp. Mirrors the echo guard so our own change doesn't loop back through
// onNodesChange → commitCanvasGesture. history.ignore() keeps Craft's canvas history in
// lockstep with the schema timeline (same as applySchemaToCanvas).
export function applyNodePatchToCanvas(
  editorActions: {
    history: {
      ignore: () => {
        setProp: (id: string, cb: (props: Record<string, unknown>) => void) => void;
      };
    };
  },
  ops: NodePatchOp[]
): void {
  isApplyingExternalPatch = true;
  try {
    for (const op of ops) {
      editorActions.history.ignore().setProp(op.nodeId, op.updater);
    }
  } finally {
    isApplyingExternalPatch = false;
  }
}
