import { deserializeWebstudioData } from "@/lib/schema";
import { seedDataStores, $projectMeta } from "@/lib/data-stores";
import {
  $cssVars,
  $interactions,
  $customCss,
  $selectedInstanceSelector,
  $selectedPageId,
  $hoveredInstanceSelector,
  $clipboard,
  $builderMode,
  $isDirty,
  $importKey,
} from "@/lib/nano-states";
import { $symbols } from "@/lib/symbols";
import type { Symbol } from "@/lib/symbols";

export function deserializeProject(projectData: any) {
  const schema = projectData.schema_json;

  // 1. Deserialize schema data (Maps from JSON arrays)
  const data = deserializeWebstudioData(schema.data);

  // 2. Seed all data stores (pages, component tree, styles, assets, etc.)
  seedDataStores(data);

  // 3. Restore editor-level atoms
  $cssVars.set(
    schema.cssVars && typeof schema.cssVars === "object" && !Array.isArray(schema.cssVars)
      ? (schema.cssVars as Record<string, string>)
      : {}
  );
  $interactions.set(
    schema.interactions && typeof schema.interactions === "object" && !Array.isArray(schema.interactions)
      ? schema.interactions
      : {}
  );
  $customCss.set(typeof schema.customCss === "string" ? schema.customCss : "");
  $symbols.set(Array.isArray(schema.symbols) ? (schema.symbols as Symbol[]) : []);

  // 4. Mark project as unsaved so it does NOT overwrite an existing DB project
  $projectMeta.set({
    id: "unsaved",
    name: projectData.name || "Imported Project",
    updatedAt: new Date().toISOString(),
  });

  // 5. Navigate to the home page and select its root instance
  const homePage = data.pages.pages.get(data.pages.homePageId);
  if (homePage) {
    $selectedPageId.set(homePage.id);
    $selectedInstanceSelector.set([homePage.rootInstanceId]);
  } else {
    $selectedInstanceSelector.set(undefined);
    $selectedPageId.set(undefined);
  }

  // 6. Reset transient editor states for a clean builder environment
  $hoveredInstanceSelector.set(undefined);
  $clipboard.set(null);
  $builderMode.set("design");

  // 7. Mark dirty so user knows the project needs to be saved
  $isDirty.set(true);

  // 8. Signal the builder page to reload the canvas iframe with the new data
  $importKey.set($importKey.get() + 1);
}
