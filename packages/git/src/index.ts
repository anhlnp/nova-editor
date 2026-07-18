// packages/git/src/index.ts
// Re-exports all git commands and types

export { createOctokit } from "./client.js";
export { readProject } from "./commands/readProject.js";
export { writeProject } from "./commands/writeProject.js";
export { publishFiles } from "./commands/publishFiles.js";
export { checkConflict } from "./commands/checkConflict.js";
export { listTemplates, readTemplate, saveTemplate } from "./commands/templates.js";
export type { TemplateRef } from "./commands/templates.js";

export type {
  GitContext,
  ReadProjectResult,
  WriteProjectArgs,
  PublishFilesArgs,
  CheckConflictArgs,
} from "./types.js";
