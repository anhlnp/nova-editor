/**
 * Lexical-based inline text editor for the Nova canvas.
 * Replaces the contentEditable + execCommand approach (richText.ts).
 *
 * Renders in-place over the selected element; commits real Instance children
 * (b/i/sup/sub/a/span) on Escape/Enter/blur.
 *
 * Minimal port of reference/webstudio/apps/builder/app/canvas/features/text-editor/text-editor.tsx
 * scoped to Nova's message-based canvas ↔ builder protocol.
 */

"use client";

import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  FORMAT_TEXT_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_ENTER_COMMAND,
  BLUR_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import type { Instance } from "@webstudio-is/sdk";
import { type Refs, $convertToUpdates, plainTextFromChildren } from "./interop";

type CommitPayload = {
  instanceId: string;
  instances: Instance[];
};

type TextEditorProps = {
  instanceId: string;
  initialChildren: Instance["children"];
  onCommit: (payload: CommitPayload) => void;
  onCancel: () => void;
  style?: React.CSSProperties;
};

function EditorCommands({
  onCommit,
  onCancel,
  instanceId,
  initialChildren,
}: {
  onCommit: (payload: CommitPayload) => void;
  onCancel: () => void;
  instanceId: string;
  initialChildren: Instance["children"];
}) {
  const [editor] = useLexicalComposerContext();
  const refs = useRef<Refs>(new Map());

  const commit = useCallback(() => {
    editor.read(() => {
      const rootInstance: Instance = {
        type: "instance",
        id: instanceId,
        // component will be preserved by the builder when merging
        component: "Box",
        children: [],
      };
      const instances = $convertToUpdates(rootInstance, refs.current);
      onCommit({ instanceId, instances });
    });
  }, [editor, instanceId, onCommit]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => { onCancel(); return true; },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, onCancel]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (e) => {
        if (e && !e.shiftKey) {
          e.preventDefault();
          commit();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, commit]);

  useEffect(() => {
    return editor.registerCommand(
      BLUR_COMMAND,
      () => {
        commit();
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, commit]);

  useEffect(() => {
    const handleOuterClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const editorElement = editor.getRootElement();
      if (!editorElement) return;

      // If the click is inside the editor, do nothing.
      if (editorElement.contains(target)) {
        return;
      }

      // If the click is on the parent page's formatting toolbar, do nothing.
      if (target?.closest?.('[data-text-format-toolbar="true"]') || target?.closest?.('.text-format-toolbar')) {
        return;
      }

      commit();
    };

    document.addEventListener("mousedown", handleOuterClick, true);

    let parentDoc: Document | null = null;
    try {
      if (window.parent && window.parent !== window) {
        parentDoc = window.parent.document;
        parentDoc.addEventListener("mousedown", handleOuterClick, true);
      }
    } catch (err) {
      console.warn("Could not attach parent document mousedown listener", err);
    }

    return () => {
      document.removeEventListener("mousedown", handleOuterClick, true);
      if (parentDoc) {
        parentDoc.removeEventListener("mousedown", handleOuterClick, true);
      }
    };
  }, [editor, commit]);

  useEffect(() => {
    const handleScroll = () => {
      commit();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    let parentWindow: Window | null = null;
    try {
      if (window.parent && window.parent !== window) {
        parentWindow = window.parent;
        parentWindow.addEventListener("scroll", handleScroll, { passive: true });
      }
    } catch (err) {
      console.warn("Could not attach parent window scroll listener", err);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (parentWindow) {
        parentWindow.removeEventListener("scroll", handleScroll);
      }
    };
  }, [commit]);

  // Builder → canvas: format commands forwarded via postMessage
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.type !== "nova:formatText") return;
      const cmd = e.data.command as string;
      editor.update(() => {
        if (cmd === "bold") editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        else if (cmd === "italic") editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        else if (cmd === "underline") editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        else if (cmd === "link") {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, e.data.url ?? "https://");
        }
      });
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [editor]);

  return null;
}

const editorConfig: InitialConfigType = {
  namespace: "nova-text-editor",
  nodes: [LinkNode],
  onError(error) {
    console.error("[nova-text-editor]", error);
  },
  theme: {
    text: {
      bold: "nova-text-bold",
      italic: "nova-text-italic",
      underline: "nova-text-underline",
    },
  },
};

export function TextEditor({ instanceId, initialChildren, onCommit, onCancel, style }: TextEditorProps) {
  const initialText = plainTextFromChildren(initialChildren);

  const config: InitialConfigType = {
    ...editorConfig,
    editorState(editor) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const para = $createParagraphNode();
        para.append($createTextNode(initialText));
        root.append(para);
      });
    },
  };

  return (
    <LexicalComposer initialConfig={config}>
      <div
        style={{
          position: "relative",
          outline: "2px solid #3b82f6",
          ...style,
        }}
      >
        <RichTextPlugin
          contentEditable={
            <div
              contentEditable
              suppressContentEditableWarning
              style={{ outline: "none", minHeight: "1em" }}
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <LinkPlugin />
        <AutoFocusPlugin />
        <EditorCommands
          onCommit={onCommit}
          onCancel={onCancel}
          instanceId={instanceId}
          initialChildren={initialChildren}
        />
      </div>
    </LexicalComposer>
  );
}
