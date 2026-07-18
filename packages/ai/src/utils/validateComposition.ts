// Validate and normalize raw AI composition output (element-array format).
// Strips unknown component types, mints fresh node_<8> IDs (never trusts AI IDs),
// and recurses into children.

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";

function mintId(): string {
  let s = "";
  for (let i = 0; i < 8; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
  return `node_${s}`;
}

export interface ValidatedElement {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children: ValidatedElement[];
}

export interface CompositionResult {
  elements: ValidatedElement[];
  usedTypes: string[];
  droppedTypes: string[];
}

function walkNode(
  raw: unknown,
  knownSet: Set<string>,
  usedSet: Set<string>,
  droppedSet: Set<string>,
): ValidatedElement | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const node = raw as Record<string, unknown>;
  const type = typeof node.type === "string" ? node.type : "";
  if (!type || !knownSet.has(type)) {
    if (type) droppedSet.add(type);
    return null;
  }
  usedSet.add(type);
  const rawChildren = Array.isArray(node.children) ? node.children : [];
  const children: ValidatedElement[] = [];
  for (const child of rawChildren) {
    const validated = walkNode(child, knownSet, usedSet, droppedSet);
    if (validated) children.push(validated);
  }
  const rawProps = node.props && typeof node.props === "object" && !Array.isArray(node.props)
    ? (node.props as Record<string, unknown>)
    : {};
  return { id: mintId(), type, props: rawProps, children };
}

export function validateComposition(
  raw: unknown,
  knownTypes: readonly string[],
): CompositionResult {
  const knownSet = new Set(knownTypes);
  const usedSet = new Set<string>();
  const droppedSet = new Set<string>();
  const elements: ValidatedElement[] = [];

  const list = Array.isArray(raw) ? raw : [];
  for (const item of list) {
    const validated = walkNode(item, knownSet, usedSet, droppedSet);
    if (validated) elements.push(validated);
  }

  return {
    elements,
    usedTypes: [...usedSet],
    droppedTypes: [...droppedSet],
  };
}
