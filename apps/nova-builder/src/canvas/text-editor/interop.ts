/**
 * Converts Lexical editor state → WebstudioData Instance children.
 * Ported from reference/webstudio/apps/builder/app/canvas/features/text-editor/interop.ts
 *
 * Supported inline elements: b/i/sup/sub (lexical format flags), a (LinkNode), span (SpanNode).
 * Line breaks → { type: "text", value: "\n" }.
 * Underline is represented as a <span> with text-decoration (future: through span styles).
 */

import { nanoid } from "nanoid";
import {
  $getRoot,
  $isTextNode,
  $isElementNode,
  $isParagraphNode,
  $isLineBreakNode,
  type TextNode,
  type ElementNode,
} from "lexical";
import { $isLinkNode } from "@lexical/link";
import type { Instance } from "@webstudio-is/sdk";
const elementComponent = "ws:element";

/** Map of Lexical node key → WebstudioData instance ID (persists across edits). */
export type Refs = Map<string, string>;

type InstanceChild = Instance["children"][number];

// Lexical format flags → inline tag
const FORMAT_TAGS = [
  ["bold", "b"],
  ["italic", "i"],
  ["superscript", "sup"],
  ["subscript", "sub"],
] as const;

function writeNode(
  node: TextNode | ElementNode,
  into: InstanceChild[],
  instances: Instance[],
  refs: Refs
) {
  if ($isParagraphNode(node) || ($isElementNode(node) && !$isLinkNode(node))) {
    for (const child of node.getChildren()) {
      writeNode(child as TextNode | ElementNode, into, instances, refs);
    }
    return;
  }

  if ($isLineBreakNode(node)) {
    into.push({ type: "text", value: "\n" });
    return;
  }

  if ($isLinkNode(node)) {
    const key = node.getKey();
    const id = refs.get(key) ?? nanoid();
    refs.set(key, id);
    const linkChildren: InstanceChild[] = [];
    for (const child of node.getChildren()) {
      writeNode(child as TextNode | ElementNode, linkChildren, instances, refs);
    }
    instances.push({
      type: "instance",
      id,
      component: elementComponent,
      tag: "a",
      children: linkChildren,
    });
    into.push({ type: "id", value: id });
    return;
  }

  if ($isTextNode(node)) {
    const text = node.getTextContent();
    let target = into;

    // Underline → u element
    if (node.hasFormat("underline")) {
      const key = `${node.getKey()}:underline`;
      const id = refs.get(key) ?? nanoid();
      refs.set(key, id);
      const spanChildren: InstanceChild[] = [];
      instances.push({
        type: "instance",
        id,
        component: elementComponent,
        tag: "u",
        children: spanChildren,
      });
      into.push({ type: "id", value: id });
      target = spanChildren;
    }

    // Bold / italic / super / sub — wrap innermost first
    for (const [format, tag] of FORMAT_TAGS) {
      if (node.hasFormat(format)) {
        const key = `${node.getKey()}:${format}`;
        const id = refs.get(key) ?? nanoid();
        refs.set(key, id);
        const inner: InstanceChild[] = [];
        instances.push({
          type: "instance",
          id,
          component: elementComponent,
          tag,
          children: inner,
        });
        target.push({ type: "id", value: id });
        target = inner;
      }
    }

    target.push({ type: "text", value: text });
  }
}

/**
 * Convert the current Lexical editor state into a list of Webstudio Instances
 * (root instance first, inline wrappers after). Call inside a Lexical read() or update() callback.
 */
export function $convertToUpdates(
  rootInstance: Instance,
  refs: Refs
): Instance[] {
  const rootChildren: InstanceChild[] = [];
  const instances: Instance[] = [{ ...rootInstance, children: rootChildren }];
  const root = $getRoot();
  for (const child of root.getChildren()) {
    writeNode(child as ElementNode, rootChildren, instances, refs);
  }
  return instances;
}

/**
 * Seed the Lexical editor with the existing Webstudio instance tree.
 * Only plain-text path is needed for initial load (inline formatting is re-derived on each commit).
 */
export function plainTextFromChildren(children: Instance["children"]): string {
  return children
    .map((c) => (c.type === "text" ? c.value : ""))
    .join("");
}
