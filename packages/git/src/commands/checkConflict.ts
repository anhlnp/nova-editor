// packages/git/src/commands/checkConflict.ts
// Detect if remote project.json has changed since we last read it.
// Returns true if there's a conflict (remote is ahead).
import { createOctokit } from "../client.js";
import type { CheckConflictArgs } from "../types.js";

export async function checkConflict(args: CheckConflictArgs): Promise<boolean> {
  const octokit = createOctokit(args.token);

  try {
    const response = await octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: "project.json",
      ref: args.branch,
    });

    const data = response.data as { sha: string };
    return data.sha !== args.lastKnownSha; // true = conflict
  } catch {
    return false; // If file doesn't exist, no conflict
  }
}
