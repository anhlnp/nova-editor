"use client";
// Serializes the full atom set → PATCH /api/projects/:id.
// The single save path for the builder (Ctrl+S, Save button, autosave callers).

import { serializeWebstudioData } from "./schema";
import {
  $pages,
  $assets,
  $instances,
  $props,
  $dataSources,
  $resources,
  $breakpoints,
  $styles,
  $styleSources,
  $styleSourceSelections,
} from "./data-stores";
import { $cssVars, $interactions, $customCss } from "./nano-states";
import { $symbols } from "./symbols";
import { $docVersion, $saveStatus, discardQueuedPatches } from "./saveQueue";

export async function saveProject(projectId: string): Promise<void> {
  const data = {
    pages: $pages.get()!,
    assets: $assets.get(),
    instances: $instances.get(),
    props: $props.get(),
    dataSources: $dataSources.get(),
    resources: $resources.get(),
    breakpoints: $breakpoints.get(),
    styles: $styles.get(),
    styleSources: $styleSources.get(),
    styleSourceSelections: $styleSourceSelections.get(),
  };
  const serialized = serializeWebstudioData(data);
  const res = await fetch(`/api/projects/${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      baseVersion: $docVersion.get(),
      schema_json: { schemaVersion: "5.0", data: serialized, cssVars: $cssVars.get(), interactions: $interactions.get(), customCss: $customCss.get(), symbols: $symbols.get() },
    }),
  });
  if (res.status === 409) {
    $saveStatus.set("conflict");
    throw new Error("Save conflict: project changed elsewhere");
  }
  if (!res.ok) throw new Error(`Save failed: HTTP ${res.status}`);
  const json = (await res.json()) as { version?: number };
  if (typeof json.version === "number") $docVersion.set(json.version);
  // The full document is persisted — queued patches are already included.
  discardQueuedPatches();
  $saveStatus.set("saved");
}
