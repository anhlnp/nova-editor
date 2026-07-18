// packages/git/src/commands/publishFiles.ts
// Pro tier: atomic multi-file commit (project.json + .tsx files) via GitHub Trees API.
import { createOctokit } from "../client.js";
import type { PublishFilesArgs } from "../types.js";
import type { Octokit } from "@octokit/rest";

async function createBlob(
  octokit: Octokit,
  owner: string,
  repo: string,
  content: string
): Promise<string> {
  const { data } = await octokit.git.createBlob({
    owner,
    repo,
    content: Buffer.from(content, "utf-8").toString("base64"),
    encoding: "base64",
  });
  return data.sha;
}

export async function publishFiles(args: PublishFilesArgs): Promise<void> {
  const octokit = createOctokit(args.token);

  // GitHub Trees API allows committing multiple files atomically

  // Step 1: Get current HEAD SHA
  const { data: ref } = await octokit.git.getRef({
    owner: args.owner,
    repo: args.repo,
    ref: `heads/${args.branch}`,
  });
  const headSha = ref.object.sha;

  // Step 2: Create blobs for all files
  type TreeItem = {
    path: string;
    mode: "100644";
    type: "blob";
    sha: string | null;
  };

  const treeItems: TreeItem[] = await Promise.all([
    // Always include project.json
    createBlob(
      octokit,
      args.owner,
      args.repo,
      JSON.stringify(args.project, null, 2)
    ).then((sha) => ({
      path: "project.json",
      mode: "100644" as const,
      type: "blob" as const,
      sha,
    })),
    // All generated .tsx files
    ...Object.entries(args.files).map(([path, content]) =>
      createBlob(octokit, args.owner, args.repo, content).then((sha) => ({
        path,
        mode: "100644" as const,
        type: "blob" as const,
        sha,
      }))
    ),
  ]);

  // Step 2b: delete "ghost" files (C8.1). With `base_tree`, GitHub MERGES the new
  // tree onto the old one, so any file we stop emitting (a deleted page, a removed
  // block) lingers forever and the repo bloats. Diff the previous tree and push an
  // explicit `sha: null` tombstone for each Nova-managed file no longer emitted.
  // Scoped to the exact patterns Nova generates (`app/**/page.tsx`,
  // `components/blocks/*.tsx`) so we never touch user-owned files (package.json,
  // globals.css, layout, config, …).
  const keptPaths = new Set(treeItems.map((t) => t.path));
  const isNovaManaged = (p: string): boolean =>
    /^app\/.*page\.tsx$/.test(p) || /^components\/blocks\/[^/]+\.tsx$/.test(p);

  try {
    const { data: existing } = await octokit.git.getTree({
      owner: args.owner,
      repo: args.repo,
      tree_sha: headSha,
      recursive: "true",
    });
    // If GitHub truncated the listing it's incomplete — skip deletions rather than
    // risk leaving some ghosts (safe: next publish with a smaller tree retries).
    if (!existing.truncated) {
      for (const entry of existing.tree) {
        if (
          entry.type === "blob" &&
          typeof entry.path === "string" &&
          isNovaManaged(entry.path) &&
          !keptPaths.has(entry.path)
        ) {
          treeItems.push({
            path: entry.path,
            mode: "100644",
            type: "blob",
            sha: null,
          });
        }
      }
    }
  } catch {
    // No previous tree (e.g. empty repo) — nothing to clean up.
  }

  // Step 3: Create tree
  const { data: tree } = await octokit.git.createTree({
    owner: args.owner,
    repo: args.repo,
    tree: treeItems,
    base_tree: headSha,
  });

  // Step 4: Create commit
  const { data: commit } = await octokit.git.createCommit({
    owner: args.owner,
    repo: args.repo,
    message: "feat: publish via Nova Editor",
    tree: tree.sha,
    parents: [headSha],
    author: { name: args.authorName, email: args.authorEmail },
  });

  // Step 5: Update branch reference
  await octokit.git.updateRef({
    owner: args.owner,
    repo: args.repo,
    ref: `heads/${args.branch}`,
    sha: commit.sha,
  });
}
