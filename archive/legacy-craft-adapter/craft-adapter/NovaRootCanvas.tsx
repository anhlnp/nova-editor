// packages/editor/src/craft-adapter/NovaRootCanvas.tsx
// The canvas root that Craft.js mounts the page tree into.
// Registered in the resolver as "NovaRootCanvas" so schemaToNodes can reference it.
// Must be a real boxed element (not display:contents) so Craft can connect it.
"use client";
import React from "react";
import { useNode, type UserComponent } from "@craftjs/core";

// TD-010 (v5.1.1): typed as `Record<string, unknown>` props so it slots directly
// into `editorResolver` (a string-indexed map of UserComponents) with no cast.
const NovaRootCanvas: UserComponent<Record<string, unknown>> = (props) => {
  const { children } = props as { children?: React.ReactNode };
  const {
    connectors: { connect },
  } = useNode();
  return (
    <div
      ref={connect as unknown as React.Ref<HTMLDivElement>}
      // Flex column that GROWS to fill the canvas page (which is itself flex-col
      // with a fixed min-height per viewport). flexGrow:1 makes the root occupy
      // the full page height even when content is short, so a Footer's `mt-auto`
      // is pushed to the bottom instead of floating to the middle. Top-level
      // blocks are full-width, so stacking them as flex items matches block flow.
      style={{ flexGrow: 1, width: "100%", display: "flex", flexDirection: "column" }}
    >
      {children}
    </div>
  );
};

NovaRootCanvas.craft = {
  displayName: "Page",
  isCanvas: true,
};

export { NovaRootCanvas };
