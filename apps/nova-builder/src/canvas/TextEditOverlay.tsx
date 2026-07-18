"use client";

import { useStore } from "@nanostores/react";
import { $textEditingInstance } from "@/lib/nano-states";
import { TextEditor } from "./text-editor/text-editor";
import type { Instance } from "@webstudio-is/sdk";

export function TextEditOverlay() {
  const editing = useStore($textEditingInstance);
  if (!editing) return null;

  const { instanceId, initialChildren, rect } = editing;

  function handleCommit({ instances }: { instanceId: string; instances: Instance[] }) {
    $textEditingInstance.set(null);
    window.parent.postMessage(
      { type: "nova:textCommitLexical", instanceId, instances },
      window.location.origin
    );
  }

  function handleCancel() {
    $textEditingInstance.set(null);
    window.parent.postMessage({ type: "nova:editingEnd" }, window.location.origin);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9000,
        pointerEvents: "none",
      }}
    >
      <TextEditor
        instanceId={instanceId}
        initialChildren={initialChildren}
        onCommit={handleCommit}
        onCancel={handleCancel}
        style={{
          position: "absolute",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          minHeight: rect.height,
          pointerEvents: "all",
          background: "transparent",
          zIndex: 9001,
        }}
      />
    </div>
  );
}
