// packages/git/src/commands/writeProject.ts
// Free tier: commit schema-only (project.json) to the user's repo.
import { createOctokit } from "../client.js";
import type { WriteProjectArgs } from "../types.js";

export async function writeProject(args: WriteProjectArgs): Promise<string> {
  const octokit = createOctokit(args.token);
  const content = Buffer.from(
    JSON.stringify(args.project, null, 2),
    "utf-8"
  ).toString("base64");

  const response = await octokit.repos.createOrUpdateFileContents({
    owner: args.owner,
    repo: args.repo,
    path: "project.json",
    message: "feat: update project schema via Nova Editor",
    content,
    ...(args.currentSha != null ? { sha: args.currentSha } : {}),
    branch: args.branch,
    committer: {
      name: args.authorName,
      email: args.authorEmail,
    },
  });

  // Return new SHA for subsequent operations
  const fileData = response.data.content as { sha: string } | null;
  return fileData?.sha ?? "";
}
