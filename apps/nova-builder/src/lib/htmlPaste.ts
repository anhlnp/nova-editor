// M7 — HTML → Nova instance fragment parser.
// Turns pasted HTML (from a browser, Figma-to-HTML, Webflow export, etc.) into a
// ClipboardData fragment. Tag → component mapping is data-driven; text nodes
// become text children; class attributes are preserved as a `class` prop and,
// when Tailwind utilities are recognised, surfaced via parseTailwindClasses for
// the caller to convert into styles. Browser-only (uses DOMParser).

import { nanoid } from "nanoid";
import type { Instance, Prop } from "@webstudio-is/sdk";
import type { ClipboardData } from "./edit-operations";
import { parseTailwindClasses } from "./tailwindParser";

const cssDeclsToStyleString = (decls: { property: string; value: string }[]) =>
  decls.map((d) => `${d.property}: ${d.value}`).join("; ");

const TAG_TO_COMPONENT: Record<string, string> = {
  div: "Box",
  section: "Box",
  article: "Box",
  main: "Box",
  header: "Box",
  footer: "Box",
  nav: "Box",
  aside: "Box",
  span: "Text",
  p: "Paragraph",
  h1: "Heading",
  h2: "Heading",
  h3: "Heading",
  h4: "Heading",
  h5: "Heading",
  h6: "Heading",
  a: "Link",
  button: "Button",
  img: "Image",
  ul: "Box",
  ol: "Box",
  li: "Box",
  strong: "Bold",
  b: "Bold",
  em: "Italic",
  i: "Italic",
  label: "Label",
};

const makeId = () => `inst_${nanoid(8)}`;

// Returns null when the HTML has no element content.
export function parseHtmlToFragment(html: string): ClipboardData | null {
  if (typeof DOMParser === "undefined") return null;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;
  if (!body) return null;

  const instances = new Map<string, Instance>();
  const props = new Map<string, Prop>();

  const buildElement = (el: Element): string | null => {
    const tag = el.tagName.toLowerCase();
    const component = TAG_TO_COMPONENT[tag];
    if (!component) return null;
    const id = makeId();
    const children: Instance["children"] = [];

    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) children.push({ type: "text", value: text });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const childId = buildElement(node as Element);
        if (childId) children.push({ type: "id", value: childId });
      }
    }

    const inst: Instance = { type: "instance", id, component, children };
    instances.set(id, inst);

    // Convert recognised Tailwind utilities into an inline `style` prop so the
    // pasted markup keeps its layout/appearance (M7 Tailwind parser).
    const className = el.getAttribute("class");
    if (className) {
      const decls = parseTailwindClasses(className);
      if (decls.length > 0) {
        const propId = `prop_${nanoid(8)}`;
        props.set(propId, {
          id: propId,
          instanceId: id,
          name: "style",
          type: "string",
          value: cssDeclsToStyleString(decls),
        });
      }
    }
    // preserve any inline style already on the element too
    const inlineStyle = el.getAttribute("style");
    if (inlineStyle) {
      const propId = `prop_${nanoid(8)}`;
      props.set(propId, {
        id: propId,
        instanceId: id,
        name: "style",
        type: "string",
        value: inlineStyle,
      });
    }
    return id;
  };

  // Wrap multiple top-level elements in a Box so the fragment has one root.
  const topIds: string[] = [];
  for (const node of Array.from(body.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const id = buildElement(node as Element);
      if (id) topIds.push(id);
    }
  }
  if (topIds.length === 0) return null;

  if (topIds.length === 1) {
    return { instances, rootId: topIds[0], props };
  }
  const rootId = makeId();
  instances.set(rootId, {
    type: "instance",
    id: rootId,
    component: "Box",
    children: topIds.map((value) => ({ type: "id" as const, value })),
  });
  return { instances, rootId, props };
}
