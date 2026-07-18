// Migrates a raw schema_json blob (any version) to the canonical NovaProject (v5.0).
//
// Version chain:
//   ≤ "4.0"  (Nova Element[])  →  this file runs Element[]→WebstudioData conversion
//   "5.0"    (WebstudioData)   →  passthrough; future sub-versions handled here
//
// Porting discipline note: types below are kept as bare objects (not imported from
// @webstudio-is/sdk Zod schemas) so this file remains self-contained and avoids
// triggering validation errors on partially-malformed legacy data during migration.

import type {
  Instance,
  Prop,
  StyleSource,
  StyleSourceSelection,
  Breakpoint,
} from "@webstudio-is/sdk";
import type { NovaProject, NovaProjectJson } from "./schema";
import { deserializeWebstudioData } from "./schema";

// ─── Public entry point ──────────────────────────────────────────────────────

/**
 * Accepts any schema_json blob from Supabase and returns a fully-migrated NovaProject.
 * Throws if the input is not recognisable as any version of a Nova project.
 */
export function migrateToLatest(raw: unknown): NovaProject {
  if (raw === null || typeof raw !== "object") {
    throw new Error("Not a Nova project: expected an object");
  }

  const doc = raw as Record<string, unknown>;
  const version = String(doc["schemaVersion"] ?? doc["version"] ?? "1.0");

  // Already at v5.0 — just deserialize the Maps and return.
  if (version === "5.0") {
    const json = doc as unknown as NovaProjectJson;
    return {
      schemaVersion: "5.0",
      meta: json.meta,
      data: deserializeWebstudioData(json.data),
    };
  }

  // Legacy Nova format (≤ 4.0) — convert Element[] → WebstudioData.
  // We accept any version here rather than re-running the full Nova migration
  // chain, since projects stored in Supabase have always been migrated to 4.0
  // before save. If a project is somehow below 4.0 the Element[] shape is the
  // same; we just lose some field renames that prior migrations would have done.
  return convertNovaLegacy(doc);
}

// ─── Legacy conversion: Nova Project → NovaProject (v5.0) ───────────────────

type LegacyPage = {
  id: string;
  name: string;
  route: string;
  elements: LegacyElement[];
  seo?: { title?: string; description?: string };
};

type LegacyElement = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children: LegacyElement[];
};

function convertNovaLegacy(doc: Record<string, unknown>): NovaProject {
  const pages = (doc["pages"] as LegacyPage[] | undefined) ?? [];
  const metaRaw = doc["meta"] as Record<string, string> | undefined;
  const meta = {
    name: String(metaRaw?.["name"] ?? "Untitled"),
    createdAt: String(metaRaw?.["createdAt"] ?? new Date().toISOString()),
    updatedAt: new Date().toISOString(),
  };

  // Accumulate all WebstudioData Maps.
  const instances = new Map<string, Instance>();
  const props = new Map<string, Prop>();
  const styleSources = new Map<string, StyleSource>();
  const styleSourceSelections = new Map<string, StyleSourceSelection>();

  // Default breakpoints — fixed IDs so re-migration is idempotent.
  const breakpoints = new Map<string, Breakpoint>([
    ["bp-base", { id: "bp-base", label: "Base" }],
    ["bp-tablet", { id: "bp-tablet", label: "Tablet", maxWidth: 991 }],
    ["bp-mobile-l", { id: "bp-mobile-l", label: "Mobile landscape", maxWidth: 767 }],
    ["bp-mobile-p", { id: "bp-mobile-p", label: "Mobile portrait", maxWidth: 479 }],
  ]);

  const wsPages = new Map<string, WsPage>();
  const rootFolderId = "folder-root";
  const homePageId = pages[0]?.id ?? "page-home";
  const folderChildren: string[] = [];

  for (const [idx, novaPage] of pages.entries()) {
    const pageId = novaPage.id;
    const isHome = idx === 0;

    // Synthetic root instance wraps the page's top-level elements.
    const bodyId = `body-${pageId}`;
    const bodyStyleSourceId = `local-${bodyId}`;
    styleSources.set(bodyStyleSourceId, { type: "local", id: bodyStyleSourceId });
    styleSourceSelections.set(bodyId, { instanceId: bodyId, values: [bodyStyleSourceId] });

    const topLevelChildRefs = (novaPage.elements ?? []).map((el) =>
      walkElement(el, instances, props, styleSources, styleSourceSelections)
    );

    instances.set(bodyId, {
      type: "instance",
      id: bodyId,
      component: "Body",
      children: topLevelChildRefs,
    });

    // WS Page — sanitize route for home/non-home.
    const wsPath = isHome ? "" : sanitizeRoute(novaPage.route);
    wsPages.set(pageId, {
      id: pageId,
      name: novaPage.name || "Page",
      title: (novaPage.name?.length ?? 0) >= 2 ? novaPage.name : `${novaPage.name} `,
      rootInstanceId: bodyId,
      path: wsPath,
      meta: {
        title: novaPage.seo?.title,
        description: novaPage.seo?.description,
      },
    } as WsPage);

    folderChildren.push(pageId);
  }

  // Root folder must exist and start with homePageId.
  const folders = new Map([
    [
      rootFolderId,
      {
        id: rootFolderId,
        name: "Root",
        slug: "",
        children: folderChildren.length > 0 ? folderChildren : [homePageId],
      },
    ],
  ]);

  return {
    schemaVersion: "5.0",
    meta,
    data: {
      pages: {
        homePageId,
        rootFolderId,
        pages: wsPages as unknown as WebstudioData["pages"]["pages"],
        folders: folders as unknown as WebstudioData["pages"]["folders"],
      } as unknown as WebstudioData["pages"],
      assets: new Map(),
      dataSources: new Map(),
      resources: new Map(),
      instances,
      props,
      breakpoints,
      styleSourceSelections,
      styleSources,
      styles: new Map(),
    },
  };
}

// ─── walkElement: recursive Element → Instance conversion ───────────────────

function walkElement(
  el: LegacyElement,
  instances: Map<string, Instance>,
  props: Map<string, Prop>,
  styleSources: Map<string, StyleSource>,
  styleSourceSelections: Map<string, StyleSourceSelection>
): { type: "id"; value: string } {
  // Recurse children first so the map is built bottom-up.
  const childRefs = (el.children ?? []).map((child) =>
    walkElement(child, instances, props, styleSources, styleSourceSelections)
  );

  const component = mapType(el.type);
  instances.set(el.id, {
    type: "instance",
    id: el.id,
    component,
    children: childRefs,
  });

  // Create a local StyleSource for this instance.
  const styleSourceId = `local-${el.id}`;
  styleSources.set(styleSourceId, { type: "local", id: styleSourceId });
  styleSourceSelections.set(el.id, {
    instanceId: el.id,
    values: [styleSourceId],
  });

  // Convert props — classOverrides become _legacyClasses, everything else typed.
  for (const [key, value] of Object.entries(el.props ?? {})) {
    const propId = `${el.id}:${key}`;
    if (key === "classOverrides") {
      // Tailwind classes cannot be reliably converted to StyleDecl.
      // Store for user reference as a json prop named _legacyClasses.
      props.set(propId, {
        id: propId,
        instanceId: el.id,
        name: "_legacyClasses",
        type: "json",
        value,
      });
    } else {
      const typed = toTypedProp(propId, el.id, key, value);
      if (typed !== null) props.set(propId, typed);
    }
  }

  return { type: "id", value: el.id };
}

// ─── Type mapping: Nova block names → Webstudio component names ──────────────

const TYPE_MAP: Record<string, string> = {
  Box: "Box",
  Container: "Box",
  Section: "Box",
  Row: "Box",
  Column: "Box",
  Divider: "Box",
  Button: "Button",
  Text: "Paragraph",
  TextBlock: "Paragraph",
  Heading: "Heading",
  Image: "Image",
  Link: "Link",
  NavLink: "Link",
  Form: "Form",
  Input: "Input",
  Textarea: "Textarea",
  Select: "Select",
  Label: "Label",
  // Unknown types pass through — canvas renders MissingComponentStub (red box,
  // children preserved) so no data is lost.
};

function mapType(type: string): string {
  return TYPE_MAP[type] ?? type;
}

// ─── Prop value conversion ───────────────────────────────────────────────────

function toTypedProp(
  id: string,
  instanceId: string,
  name: string,
  value: unknown
): Prop | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    return { id, instanceId, name, type: "string", value };
  }
  if (typeof value === "number") {
    return { id, instanceId, name, type: "number", value };
  }
  if (typeof value === "boolean") {
    return { id, instanceId, name, type: "boolean", value };
  }
  // Arrays and objects → json type.
  return { id, instanceId, name, type: "json", value };
}

// ─── Route sanitization ──────────────────────────────────────────────────────

function sanitizeRoute(route: string): string {
  // Ensure starts with /, remove trailing slash, lowercase.
  let p = route.trim().toLowerCase();
  if (!p.startsWith("/")) p = `/${p}`;
  if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
  // Replace disallowed chars with -.
  p = p.replace(/[^a-z0-9/_\-:.?*]/g, "-");
  // Avoid "/" alone (WS doesn't allow it for non-home pages).
  if (p === "/") p = "/page";
  return p;
}

// ─── Local type aliases to avoid full WS SDK import at top level ─────────────
// These match the WebstudioData.pages structure without importing Zod schemas.
type WsPage = {
  id: string;
  name: string;
  title: string;
  rootInstanceId: string;
  path: string;
  meta: {
    title?: string;
    description?: string;
  };
};

type WebstudioData = import("@webstudio-is/sdk").WebstudioData;
