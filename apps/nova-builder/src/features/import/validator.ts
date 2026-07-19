import type { ImportedNovaProject } from "./types";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  project?: ImportedNovaProject;
}

export function validateImportedProject(content: string): ValidationResult {
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    return { valid: false, error: "Invalid project file." };
  }

  if (!parsed || typeof parsed !== "object") {
    return { valid: false, error: "Unable to import this project. The file may be corrupted or incompatible." };
  }

  if (parsed.type !== "nova-template") {
    return { valid: false, error: "Unsupported file format. Please select a .nova file." };
  }

  if (typeof parsed.version !== "number" || parsed.version > 1) {
    return { valid: false, error: "This project was created with a newer version of Nova." };
  }

  if (!parsed.project || typeof parsed.project !== "object" || !parsed.project.schema_json) {
    return { valid: false, error: "Unable to import this project. The file may be corrupted or incompatible." };
  }

  return { valid: true, project: parsed as ImportedNovaProject };
}
