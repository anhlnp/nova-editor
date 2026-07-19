// Client-side Export Static HTML.
// Collects WebstudioData from the current builder atoms, calls the existing
// server-side-compatible exportToHtml() renderer (lib/htmlExporter.ts), and
// triggers a browser download. No server round-trip, no API calls.

import { exportToHtml } from "@/lib/htmlExporter";
import { getExportMetas } from "@/lib/publish/metas";
import { downloadFile } from "@/features/export/downloader";
import { showToast } from "@/lib/nano-states";
import {
  $pages, $assets, $instances, $props, $dataSources,
  $resources, $breakpoints, $styles, $styleSources,
  $styleSourceSelections, $projectMeta,
} from "@/lib/data-stores";
import { $cssVars, $interactions, $customCss } from "@/lib/nano-states";

export function exportHtml() {
  try {
    const pages = $pages.get();
    if (!pages) {
      showToast("No project loaded.", "error");
      return;
    }

    // Assemble WebstudioData from current atoms (same pattern as serializer.ts)
    const data = {
      pages,
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

    const meta = $projectMeta.get();
    const projectName = meta?.name || "untitled";
    const title = projectName;

    const html = exportToHtml(data, {
      title,
      customCss: $customCss.get(),
      interactions: $interactions.get() as any,
      // Pass component preset metas for full-fidelity preset CSS output
      metas: getExportMetas(),
    });

    // Slugify project name for safe filename
    const safeName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "untitled";

    downloadFile(html, `${safeName}.html`, "text/html;charset=utf-8");
    showToast("HTML exported successfully!", "success");
  } catch (err) {
    console.error("Failed to export HTML:", err);
    showToast(
      err instanceof Error ? err.message : "Failed to export HTML.",
      "error"
    );
  }
}
