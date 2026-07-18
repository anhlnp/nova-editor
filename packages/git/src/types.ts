// packages/git/src/types.ts
// Shared types for git operations.
// NovaData is a generic JSON blob — schema version is embedded inside it.
// Migration to latest schema version happens at the caller (nova-builder API routes).

export interface GitContext {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

// The raw JSON stored as project.json on GitHub (any schema version).
export type NovaData = Record<string, unknown>;

export interface ReadProjectResult {
  project: NovaData | null; // null = file doesn't exist yet (new project)
  sha: string | null;       // current file SHA (needed for update calls)
}

export interface WriteProjectArgs extends GitContext {
  project: NovaData;
  currentSha: string | null; // null = create new file
  authorName: string;
  authorEmail: string;
}

export interface PublishFilesArgs extends GitContext {
  project: NovaData;
  files: Record<string, string>; // path → file content
  authorName: string;
  authorEmail: string;
}

export interface CheckConflictArgs extends GitContext {
  lastKnownSha: string;
}
