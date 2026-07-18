"use client";
// Rich-text HTML → instance children.
// Used when committing inline canvas text edits: converts the contenteditable
// HTML into WebstudioData children (Bold/Italic wrapper instances + text nodes).

import { nanoid } from "nanoid";

export type RtChild = { type: "text"; value: string } | { type: "id"; value: string };

export function parseRichHtml(html: string, instances: Map<string, unknown>): RtChild[] {
  if (typeof window === "undefined") return [{ type: "text", value: html }];
  const div = document.createElement("div");
  div.innerHTML = html;

  function processNode(node: Node): RtChild | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      return text ? { type: "text", value: text } : null;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    let component: string | null = null;
    let explicitTag: string | undefined = undefined;
    let props: Array<{ type: string; id: string; name: string; value: string }> | undefined = undefined;

    if (tag === "b" || tag === "strong") component = "Bold";
    else if (tag === "i" || tag === "em") component = "Italic";
    else if (tag === "u") { component = "Span"; explicitTag = "u"; }
    else if (tag === "a") {
      component = "Link";
      explicitTag = "a";
      const href = el.getAttribute("href") || "#";
      props = [{ type: "string", id: nanoid(), name: "href", value: href }];
    }
    else if (tag === "sub") component = "Subscript";
    else if (tag === "sup") component = "Superscript";
    else if (tag === "span") { component = "Span"; explicitTag = "span"; }
    else if (tag === "br") return { type: "text", value: "\n" };

    if (!component) {
      // Transparent wrapper — recurse children directly
      const children: RtChild[] = [];
      for (const child of el.childNodes) {
        const c = processNode(child);
        if (c) children.push(c);
      }
      return children.length === 1 ? children[0] : null;
    }

    const childResults: RtChild[] = [];
    for (const child of el.childNodes) {
      const c = processNode(child);
      if (c) childResults.push(c);
    }
    if (childResults.length === 0) return null;

    const id = `inst_${nanoid(8)}`;
    instances.set(id, {
      id,
      component,
      ...(explicitTag ? { tag: explicitTag } : {}),
      ...(props ? { props } : {}),
      children: childResults,
    });
    return { type: "id", value: id };
  }

  const result: RtChild[] = [];
  for (const node of div.childNodes) {
    const c = processNode(node);
    if (c) result.push(c);
  }
  return result.length > 0 ? result : [{ type: "text", value: div.textContent ?? "" }];
}
