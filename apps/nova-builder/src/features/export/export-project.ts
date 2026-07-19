import { serializeProject } from "./serializer";
import { downloadFile } from "./downloader";
import { showToast } from "@/lib/nano-states";

export function exportProject(projectName: string) {
  try {
    const exportedObj = serializeProject(projectName);
    const content = JSON.stringify(exportedObj, null, 2);
    const safeName = projectName
      ? projectName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : "untitled";
    const filename = `${safeName || "untitled"}.nova`;
    downloadFile(content, filename, "application/json");
    showToast("Project exported successfully!", "success");
  } catch (err) {
    console.error("Failed to export project:", err);
    showToast(
      err instanceof Error ? err.message : "Failed to export project",
      "error"
    );
  }
}
