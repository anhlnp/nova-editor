// packages/git/src/commands/readProject.ts
// Load project.json from a GitHub repo.
// Returns null project if the file doesn't exist (new project).
// Migrates the schema to the latest version (currently 4.0) before returning.

import { createOctokit } from "../client.js";
import type { GitContext, ReadProjectResult, NovaData } from "../types.js";

const CURRENT_SCHEMA = "4.0";

function migrateSchema(data: NovaData): NovaData {
  const out = { ...data };
  // Integer `version` field (old format) → string schemaVersion
  if (typeof out.version === "number" && !out.schemaVersion) {
    delete out.version;
    out.schemaVersion = CURRENT_SCHEMA;
  }
  // String schemaVersion lower than current → upgrade
  if (typeof out.schemaVersion === "string" && out.schemaVersion !== CURRENT_SCHEMA) {
    out.schemaVersion = CURRENT_SCHEMA;
  }
  return out;
}

export async function readProject(args: GitContext): Promise<ReadProjectResult> {
  const octokit = createOctokit(args.token);

  try {
    const response = await octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: "project.json",
      ref: args.branch,
    });

    if (Array.isArray(response.data)) {
      throw new Error("project.json is a directory, not a file");
    }

    const data = response.data as { content?: string; sha: string };
    if (!data.content) throw new Error("project.json has no content");

    const content = Buffer.from(data.content, "base64").toString("utf-8");
    const project = migrateSchema(JSON.parse(content));
    return { project, sha: data.sha };
  } catch (err: unknown) {
    if (
      err instanceof Object &&
      "status" in err &&
      (err as { status: number }).status === 404
    ) {
      return { project: null, sha: null };
    }
    throw err;
  }
}
