import { serializeWebstudioData } from "@/lib/schema";
import {
  $pages, $assets, $instances, $props, $dataSources, $resources, $breakpoints, $styles, $styleSources, $styleSourceSelections,
} from "@/lib/data-stores";
import {
  $cssVars, $interactions, $customCss,
} from "@/lib/nano-states";
import { $symbols } from "@/lib/symbols";
import type { ExportedNovaProject } from "./types";

export function serializeProject(name: string): ExportedNovaProject {
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

  const serializedData = serializeWebstudioData(data);

  return {
    version: 1,
    type: "nova-template",
    exportedAt: new Date().toISOString(),
    project: {
      name,
      schema_json: {
        schemaVersion: "5.0",
        data: serializedData,
        cssVars: $cssVars.get(),
        interactions: $interactions.get(),
        customCss: $customCss.get(),
        symbols: $symbols.get(),
        metadata: {
          description: "",
          thumbnail: "",
        },
      },
    },
  };
}
