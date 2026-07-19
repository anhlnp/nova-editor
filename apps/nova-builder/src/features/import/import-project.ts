import { validateImportedProject } from "./validator";
import { deserializeProject } from "./deserializer";
import { showToast } from "@/lib/nano-states";

export function importProject(fileContent: string): boolean {
  try {
    const validation = validateImportedProject(fileContent);
    if (!validation.valid || !validation.project) {
      showToast(validation.error || "Unable to import this project.", "error");
      return false;
    }

    deserializeProject(validation.project.project);
    showToast("Project imported successfully!", "success");
    return true;
  } catch (err) {
    console.error("Failed to import project:", err);
    showToast("Unable to import this project. The file may be corrupted or incompatible.", "error");
    return false;
  }
}
