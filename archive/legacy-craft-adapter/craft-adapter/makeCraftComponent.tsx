// packages/editor/src/craft-adapter/makeCraftComponent.tsx
// W1.2 (ADR-012): wrap a pure registry component so Craft can drag/select it,
// WITHOUT putting useNode inside the registry component itself (keeps components
// export-safe for packages/renderer).
//
// The wrapper is `display: contents` (adds NO box, so the child's own layout is
// preserved exactly) and connects Craft to the child's REAL root element via
// `firstElementChild`. This matters because the selection/hover overlay (ADR-017)
// and Craft's drop indicator measure `node.dom.getBoundingClientRect()` — a
// `display: contents` element has no box, so we must connect the child, not the
// wrapper. (Confirmed against the Craft.js reference RenderNode pattern.)
"use client";
import React, { useState, useCallback } from "react";
import { useNode, useEditor, type UserComponent } from "@craftjs/core";

export interface CraftComponentConfig {
  displayName: string;
  /** Drop rules (canMoveIn) are enforced by the operations layer (ADR-016), not here. */
  isCanvas: boolean;
  /** When set, double-clicking the block activates inline text editing for this prop key. */
  inlineEditProp?: string | undefined;
}

export function makeCraftComponent(
  Comp: React.ComponentType<Record<string, unknown>>,
  config: CraftComponentConfig
): UserComponent<Record<string, unknown>> {
  const { inlineEditProp } = config;

  const Wrapped: UserComponent<Record<string, unknown>> = (props) => {
    const {
      connectors: { connect, drag },
      id,
    } = useNode((node) => ({ id: node.id }));
    const { actions } = useEditor();

    const [isEditing, setIsEditing] = useState(false);

    // v2.0 (ADR-027): the block consumes `classOverrides` directly and merges it
    // via `cn` internally — so the live block IS the published block. The wrapper
    // just forwards props (no `_novaClass` pre-merge here anymore).
    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        if (!inlineEditProp) return;
        e.stopPropagation();
        setIsEditing(true);
      },
      []
    );

    // ADR-042 E2 (inline-text exception): contentEditable stays local while typing;
    // on commit (blur/Enter) we write through Craft, whose onNodesChange is captured
    // by the E1/E2 gesture adapter (commitCanvasGesture) and reconciled into the
    // Document. The committed value is authoritative — a documented, bounded use of
    // the Craft→Document adapter, not a generic two-way sync.
    const handleCommit = useCallback(
      (text: string) => {
        if (!inlineEditProp) return;
        actions.setProp(id, (p: Record<string, unknown>) => {
          p[inlineEditProp] = text;
        });
        setIsEditing(false);
      },
      [id, actions]
    );

    // Extra props injected when this block supports inline text editing.
    const editingProps = inlineEditProp
      ? { _novaEditing: isEditing, _novaOnCommit: handleCommit }
      : {};

    return (
      <div
        style={{ display: "contents" }}
        onDoubleClick={handleDoubleClick}
        ref={(wrapper) => {
          // Connect the component's real (boxed) root element, not the
          // contents wrapper. Child refs fire before the parent's, so the
          // child is already in the DOM here.
          const el = wrapper?.firstElementChild as HTMLElement | null;
          if (el) connect(drag(el));
        }}
      >
        <Comp {...props} {...editingProps} />
      </div>
    );
  };

  Wrapped.displayName = `Craft(${config.displayName})`;
  Wrapped.craft = { displayName: config.displayName };

  return Wrapped;
}

/** A minimal block shape needed to build the editor resolver from a registry. */
export interface ResolvableBlock {
  component: React.ComponentType<Record<string, unknown>>;
  craftConfig: {
    displayName: string;
    isCanvas: boolean;
    rules?: { canMoveIn?: string[] };
    inlineEditProp?: string;
  };
  inlineEditProp?: string;
}

/**
 * Build a Craft `resolver` from a registry-like map, wrapping each component so
 * it is draggable/selectable. Keys are kept as the registry names so a node's
 * `name`/`resolvedName` still equals the schema `type` (round-trip safe).
 */
export function buildEditorResolver(
  blocks: Record<string, ResolvableBlock>
): Record<string, UserComponent<Record<string, unknown>>> {
  return Object.fromEntries(
    Object.entries(blocks).map(([name, block]) => [
      name,
      makeCraftComponent(block.component, {
        ...block.craftConfig,
        inlineEditProp: block.inlineEditProp ?? block.craftConfig.inlineEditProp,
      }),
    ])
  );
}
