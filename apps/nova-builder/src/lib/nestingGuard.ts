// M5 — Content-model / nesting guard (Nova-native).
//
// Webstudio's content-model.ts/matcher.ts validate HTML nesting against the full
// html-data category tables. Nova's component metas are simplified (no per-tag
// category tables), so this is a pragmatic capability-parity validator: it blocks
// the nesting mistakes that actually corrupt a document — text-only containers
// receiving children, interactive-in-interactive (a > button), and form-in-form —
// using the component name + a small tag map. Pure functions, no React/atoms (D).
//
// Wired into every insertion path: DnD reparent (treeMove), paste (edit-operations
// callers), and AI-apply (applyWSComposition). ADR-NB-022.

import type { Instance, Instances } from "@webstudio-is/sdk";

// Components that render as text and must not receive element children.
const TEXT_ONLY_COMPONENTS = new Set([
  "Heading",
  "Paragraph",
  "RichText",
  "Bold",
  "Italic",
  "Span",
  "Label",
  "Code",
  "TextBlock",
]);

// Components that render interactive elements — nesting one inside another is
// invalid HTML (a > button, button > a, button > input).
const INTERACTIVE_COMPONENTS = new Set([
  "Link",
  "RichTextLink",
  "Button",
  "Input",
  "Textarea",
  "Select",
  "Checkbox",
  "RadioButton",
]);

// Components that render a <form> — a form must not contain another form.
const FORM_COMPONENTS = new Set(["Form"]);

export type NestingViolation = {
  code: "text-only" | "interactive" | "form";
  message: string;
};

// Can `childComponent` be placed directly inside `parentComponent`?
// Returns a violation describing why not, or null when the nesting is allowed.
export function checkDirectNesting(
  parentComponent: string,
  childComponent: string
): NestingViolation | null {
  if (TEXT_ONLY_COMPONENTS.has(parentComponent)) {
    return {
      code: "text-only",
      message: `"${parentComponent}" holds text and cannot contain "${childComponent}".`,
    };
  }
  if (
    INTERACTIVE_COMPONENTS.has(parentComponent) &&
    INTERACTIVE_COMPONENTS.has(childComponent)
  ) {
    return {
      code: "interactive",
      message: `Cannot place interactive "${childComponent}" inside interactive "${parentComponent}".`,
    };
  }
  return null;
}

// Walk from `parentId` up to the root; if any ancestor (or the parent itself)
// shares a "no self-nesting" trait with `childComponent`, that's a violation.
// Currently enforced for forms (form > … > form) and interactive elements.
export function checkAncestorNesting(
  parentId: string,
  childComponent: string,
  instances: Instances,
  parentMap: Map<string, string>
): NestingViolation | null {
  const childIsForm = FORM_COMPONENTS.has(childComponent);
  const childIsInteractive = INTERACTIVE_COMPONENTS.has(childComponent);
  if (!childIsForm && !childIsInteractive) return null;

  let current: string | undefined = parentId;
  while (current) {
    const inst = instances.get(current);
    if (inst) {
      if (childIsForm && FORM_COMPONENTS.has(inst.component)) {
        return { code: "form", message: `A form cannot be nested inside another form.` };
      }
      if (childIsInteractive && INTERACTIVE_COMPONENTS.has(inst.component)) {
        return {
          code: "interactive",
          message: `Cannot nest interactive "${childComponent}" inside interactive "${inst.component}".`,
        };
      }
    }
    current = parentMap.get(current);
  }
  return null;
}

function buildParentMap(instances: Instances): Map<string, string> {
  const pm = new Map<string, string>();
  for (const [, inst] of instances) {
    for (const child of inst.children) {
      if (child.type === "id") pm.set(child.value, inst.id);
    }
  }
  return pm;
}

// Full check for inserting `childComponent` as a child of `parentId`.
export function checkNesting(
  parentId: string,
  childComponent: string,
  instances: Instances
): NestingViolation | null {
  const parent = instances.get(parentId);
  if (!parent) return null;
  const direct = checkDirectNesting(parent.component, childComponent);
  if (direct) return direct;
  const parentMap = buildParentMap(instances);
  return checkAncestorNesting(parentId, childComponent, instances, parentMap);
}

// Validate that an entire fragment (map of new instances rooted at rootId) can be
// inserted under `parentId`. Checks the root against the parent, then every
// parent→child edge inside the fragment. Returns the first violation or null.
export function checkFragmentNesting(
  parentId: string,
  fragmentRootId: string,
  fragmentInstances: Map<string, Instance>,
  existingInstances: Instances
): NestingViolation | null {
  const root = fragmentInstances.get(fragmentRootId);
  if (!root) return null;

  const rootViolation = checkNesting(parentId, root.component, existingInstances);
  if (rootViolation) return rootViolation;

  // Internal edges of the fragment.
  for (const inst of fragmentInstances.values()) {
    for (const child of inst.children) {
      if (child.type !== "id") continue;
      const childInst = fragmentInstances.get(child.value);
      if (!childInst) continue;
      const direct = checkDirectNesting(inst.component, childInst.component);
      if (direct) return direct;
    }
  }
  return null;
}
