// Convert the composerAgentWS simplified tree output into proper WebstudioData
// maps (Instance[], Prop[], StyleDecl[], StyleSource[], StyleSourceSelection[]).
//
// The AI outputs a simplified "tree" with inline styles as flat CSS property/
// value strings. This converter:
//   1. Reassigns fresh inst_<8> IDs (never trusts AI IDs)
//   2. Builds normalized Instance records with {type:"id",value:id} child refs
//   3. Creates a StyleSource("local") per instance that has styles
//   4. Converts flat CSS string values to WS StyleValue objects (best-effort)
//   5. Creates StyleDecl records per style property
//   6. Creates StyleSourceSelection per instance
//   7. Creates Prop records for component props and text content

// ─── WS type shapes (inline to avoid a runtime dep on ws-sdk in this package) ─

type ChildRef = { type: "id"; value: string } | { type: "text"; value: string };

interface WSInstance {
  type: "instance";
  id: string;
  component: string;
  label?: string;
  children: ChildRef[];
}

interface WSProp {
  id: string;
  instanceId: string;
  name: string;
  type: "string" | "number" | "boolean" | "json";
  value: unknown;
}

type StyleValue =
  | { type: "keyword"; value: string }
  | { type: "unit"; value: number; unit: string }
  | { type: "color"; value: { r: number; g: number; b: number; alpha: number } };

interface WSStyleDecl {
  styleSourceId: string;
  breakpointId: string;
  property: string;
  value: StyleValue;
}

interface WSStyleSource {
  id: string;
  type: "local";
}

interface WSStyleSourceSelection {
  instanceId: string;
  values: string[];
}

export interface WSCompositionResult {
  instances: WSInstance[];
  props: WSProp[];
  styleSources: WSStyleSource[];
  styleSourceSelections: WSStyleSourceSelection[];
  styles: WSStyleDecl[];
  usedComponents: string[];
  droppedComponents: string[];
  rootIds: string[];
}

// ─── ID generator ──────────────────────────────────────────────────────────────

function genId(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${s}`;
}

// ─── StyleValue converter ──────────────────────────────────────────────────────

const UNIT_RE = /^(-?[\d.]+)(px|em|rem|%|vw|vh|vmin|vmax|pt|cm|mm|in|ch|ex|fr)$/;

function parseColor(hex: string): { r: number; g: number; b: number; alpha: number } | null {
  const h = hex.replace(/^#/, "");
  if (h.length === 3) {
    return {
      r: parseInt(h[0]! + h[0]!, 16),
      g: parseInt(h[1]! + h[1]!, 16),
      b: parseInt(h[2]! + h[2]!, 16),
      alpha: 1,
    };
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      alpha: 1,
    };
  }
  return null;
}

function cssStringToStyleValue(css: string): StyleValue {
  const trimmed = css.trim();

  // Hex colors
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    const color = parseColor(trimmed);
    if (color) return { type: "color", value: color };
  }

  // Unit values (16px, 1.5rem, 100%, etc.)
  const unitMatch = UNIT_RE.exec(trimmed);
  if (unitMatch) {
    return { type: "unit", value: parseFloat(unitMatch[1]!), unit: unitMatch[2]! };
  }

  // Bare numbers → unitless
  if (/^-?[\d.]+$/.test(trimmed)) {
    return { type: "unit", value: parseFloat(trimmed), unit: "" };
  }

  // Everything else: keyword (includes shorthands, rgba(), named colors, etc.)
  return { type: "keyword", value: trimmed };
}

// ─── Known components ─────────────────────────────────────────────────────────

const KNOWN_COMPONENTS = new Set([
  "Box",
  "Heading",
  "Paragraph",
  "Bold",
  "Italic",
  "Link",
  "Button",
  "Image",
  "Input",
  "Label",
  "Form",
  "List",
  "ListItem",
]);

// ─── Main converter ───────────────────────────────────────────────────────────

type AINode = {
  id?: unknown;
  component?: unknown;
  label?: unknown;
  props?: unknown;
  styles?: unknown;
  text?: unknown;
  children?: unknown;
};

export function validateCompositionWS(raw: unknown): WSCompositionResult {
  const instances: WSInstance[] = [];
  const props: WSProp[] = [];
  const styleSources: WSStyleSource[] = [];
  const styleSourceSelections: WSStyleSourceSelection[] = [];
  const styles: WSStyleDecl[] = [];
  const usedComponents = new Set<string>();
  const droppedComponents = new Set<string>();
  const rootIds: string[] = [];

  // Map: aiId → new inst_<8> ID (built in first pass)
  const idMap = new Map<string, string>();

  // First pass: allocate real IDs for every node in the tree
  function allocateIds(nodes: unknown[]): void {
    for (const node of nodes) {
      if (!node || typeof node !== "object" || Array.isArray(node)) continue;
      const n = node as AINode;
      const aiId = typeof n.id === "string" ? n.id : genId("tmp");
      idMap.set(aiId, genId("inst_"));
      if (Array.isArray(n.children)) allocateIds(n.children);
    }
  }

  // Second pass: build the output records
  function walk(nodes: unknown[]): string[] {
    const childIds: string[] = [];
    for (const node of nodes) {
      if (!node || typeof node !== "object" || Array.isArray(node)) continue;
      const n = node as AINode;
      const component = typeof n.component === "string" ? n.component : "";
      if (!KNOWN_COMPONENTS.has(component)) {
        if (component) droppedComponents.add(component);
        continue;
      }

      const aiId = typeof n.id === "string" ? n.id : "";
      const instanceId = idMap.get(aiId) ?? genId("inst_");
      usedComponents.add(component);

      // Recurse children first to get child IDs
      const subIds = Array.isArray(n.children) ? walk(n.children as unknown[]) : [];

      // Build child refs — add inline text as a text child ref
      const childRefs: ChildRef[] = subIds.map((id) => ({ type: "id" as const, value: id }));
      const text = typeof n.text === "string" ? n.text.trim() : "";
      if (text) {
        childRefs.push({ type: "text", value: text });
      }

      // Instance
      const instance: WSInstance = {
        type: "instance",
        id: instanceId,
        component,
        label: typeof n.label === "string" ? n.label : component,
        children: childRefs,
      };
      instances.push(instance);

      // Props
      if (n.props && typeof n.props === "object" && !Array.isArray(n.props)) {
        for (const [key, val] of Object.entries(n.props as Record<string, unknown>)) {
          if (val === null || val === undefined) continue;
          props.push({
            id: genId("prop_"),
            instanceId,
            name: key,
            type: typeof val === "number" ? "number" : typeof val === "boolean" ? "boolean" : "string",
            value: val,
          });
        }
      }

      // Styles → StyleSource + StyleDecl + StyleSourceSelection
      const styleProps =
        n.styles && typeof n.styles === "object" && !Array.isArray(n.styles)
          ? (n.styles as Record<string, unknown>)
          : {};

      const styleEntries = Object.entries(styleProps).filter(([, v]) => v !== null && v !== undefined && v !== "");

      if (styleEntries.length > 0) {
        const sourceId = genId("src_");
        styleSources.push({ id: sourceId, type: "local" });
        styleSourceSelections.push({ instanceId, values: [sourceId] });

        for (const [property, val] of styleEntries) {
          styles.push({
            styleSourceId: sourceId,
            breakpointId: "base",
            property,
            value: cssStringToStyleValue(String(val)),
          });
        }
      }

      childIds.push(instanceId);
    }
    return childIds;
  }

  const tree =
    raw &&
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    Array.isArray((raw as Record<string, unknown>).tree)
      ? ((raw as Record<string, unknown>).tree as unknown[])
      : [];

  allocateIds(tree);
  const topIds = walk(tree);
  rootIds.push(...topIds);

  return {
    instances,
    props,
    styleSources,
    styleSourceSelections,
    styles,
    usedComponents: [...usedComponents],
    droppedComponents: [...droppedComponents],
    rootIds,
  };
}
