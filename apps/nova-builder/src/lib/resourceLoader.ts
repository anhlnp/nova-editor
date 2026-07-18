"use client";
// M5 — Resources runtime (client side).
// Runs every "resource" data source through the server loader route and stores
// the response in $resourceValues keyed by the resource's data-source id, so the
// canvas expression scope can resolve props bound to that resource. Server-side
// fetch avoids CORS and keeps request headers off the client (ADR-NB-015 route).

import type { DataSources, Resource, Resources } from "@webstudio-is/sdk";
import { $resourceValues } from "./nano-states";

export async function loadProjectResources(
  projectId: string,
  dataSources: DataSources,
  resources: Resources
): Promise<void> {
  const resourceSources = [...dataSources.values()].filter(
    (ds) => ds.type === "resource"
  );
  if (resourceSources.length === 0) return;

  const next = new Map($resourceValues.get());

  await Promise.all(
    resourceSources.map(async (ds) => {
      if (ds.type !== "resource") return;
      const resource: Resource | undefined = resources.get(ds.resourceId);
      if (!resource) return;
      try {
        const res = await fetch(`/api/projects/${projectId}/resources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: resource.url,
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
          }),
        });
        if (!res.ok) return;
        const json = (await res.json()) as { data?: unknown };
        next.set(ds.id, json.data);
      } catch {
        // leave the resource unresolved; bound props render undefined
      }
    })
  );

  $resourceValues.set(next);
}
