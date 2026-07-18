// Nova's storage envelope for projects in Supabase schema_json.
// schemaVersion "5.0" = WebstudioData format (Webstudio-based builder).
// schemaVersion ≤ "4.0" = legacy Nova Element[] format — always migrated up on read.

import type {
  WebstudioData,
  Instances,
  Props,
  Styles,
  StyleSources,
  StyleSourceSelections,
  Breakpoints,
  Assets,
  DataSources,
  Resources,
} from "@webstudio-is/sdk";

export type { WebstudioData };

// The project as stored in Supabase (schema_json column).
// Data fields that are JS Maps are serialized to [key, value][] arrays for JSON.
export type NovaProject = {
  schemaVersion: "5.0";
  meta: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  data: WebstudioData;
};

// Serialized form that travels over HTTP and is stored as JSONB.
// Maps → [key, value][] so they survive JSON.stringify / JSON.parse.
export type NovaProjectJson = {
  schemaVersion: "5.0";
  meta: NovaProject["meta"];
  data: {
    pages: unknown; // Pages type is already plain-object-serializable
    assets: [string, unknown][];
    dataSources: [string, unknown][];
    resources: [string, unknown][];
    instances: [string, unknown][];
    props: [string, unknown][];
    breakpoints: [string, unknown][];
    styleSourceSelections: [string, unknown][];
    styleSources: [string, unknown][];
    styles: [string, unknown][];
  };
};

// Serialize WebstudioData Maps to plain JSON-safe arrays.
export function serializeWebstudioData(
  data: WebstudioData
): NovaProjectJson["data"] {
  return {
    pages: serializePages(data.pages),
    assets: Array.from(data.assets.entries()),
    dataSources: Array.from(data.dataSources.entries()),
    resources: Array.from(data.resources.entries()),
    instances: Array.from(data.instances.entries()),
    props: Array.from(data.props.entries()),
    breakpoints: Array.from(data.breakpoints.entries()),
    styleSourceSelections: Array.from(data.styleSourceSelections.entries()),
    styleSources: Array.from(data.styleSources.entries()),
    styles: Array.from(data.styles.entries()),
  };
}

// Deserialize from JSON-safe arrays back to WebstudioData Maps.
export function deserializeWebstudioData(
  raw: NovaProjectJson["data"]
): WebstudioData {
  return {
    pages: deserializePages(raw.pages),
    assets: new Map(raw.assets) as Assets,
    dataSources: new Map(raw.dataSources) as DataSources,
    resources: new Map(raw.resources) as Resources,
    instances: new Map(raw.instances) as Instances,
    props: new Map(raw.props) as Props,
    breakpoints: new Map(raw.breakpoints) as Breakpoints,
    styleSourceSelections: new Map(raw.styleSourceSelections) as StyleSourceSelections,
    styleSources: new Map(raw.styleSources) as StyleSources,
    styles: new Map(raw.styles) as Styles,
  };
}

// Pages contains nested Maps (pages Map, folders Map) — needs special handling.
function serializePages(pages: WebstudioData["pages"]): unknown {
  return {
    ...pages,
    pages: Array.from(pages.pages.entries()),
    folders: Array.from(pages.folders.entries()),
    pageTemplates: pages.pageTemplates
      ? Array.from(pages.pageTemplates.entries())
      : undefined,
  };
}

function deserializePages(raw: unknown): WebstudioData["pages"] {
  const r = raw as {
    homePageId: string;
    rootFolderId: string;
    meta?: unknown;
    compiler?: unknown;
    redirects?: unknown[];
    pages: [string, unknown][];
    folders: [string, unknown][];
    pageTemplates?: [string, unknown][];
  };
  return {
    homePageId: r.homePageId,
    rootFolderId: r.rootFolderId,
    meta: r.meta as WebstudioData["pages"]["meta"],
    compiler: r.compiler as WebstudioData["pages"]["compiler"],
    redirects: r.redirects as WebstudioData["pages"]["redirects"],
    pages: new Map(r.pages) as WebstudioData["pages"]["pages"],
    folders: new Map(r.folders) as WebstudioData["pages"]["folders"],
    pageTemplates: r.pageTemplates
      ? (new Map(r.pageTemplates) as WebstudioData["pages"]["pageTemplates"])
      : undefined,
  };
}
