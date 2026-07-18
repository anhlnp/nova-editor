// packages/git/src/commands/templates.ts
// W6 (ADR-014): personal/team template storage in the user's repo under
// /.nova/templates/<slug>.json. No public index — that's the v2.0 marketplace.
import { createOctokit } from "../client.js";

const DIR = ".nova/templates";
const pathFor = (slug: string) => `${DIR}/${slug}.json`;

export interface TemplateRef {
  slug: string;
  path: string;
}

interface BaseArgs {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

/** List template files. Returns [] if the directory doesn't exist yet. */
export async function listTemplates(args: BaseArgs): Promise<TemplateRef[]> {
  const octokit = createOctokit(args.token);
  try {
    const res = await octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: DIR,
      ref: args.branch,
    });
    const data = res.data;
    if (!Array.isArray(data)) return [];
    return data
      .filter((e) => e.type === "file" && e.name.endsWith(".json"))
      .map((e) => ({ slug: e.name.replace(/\.json$/, ""), path: e.path }));
  } catch {
    return []; // 404 = no templates dir yet
  }
}

/** Read + JSON-parse a single template. Caller validates with TemplateSchema. */
export async function readTemplate(
  args: BaseArgs & { slug: string }
): Promise<unknown | null> {
  const octokit = createOctokit(args.token);
  try {
    const res = await octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path: pathFor(args.slug),
      ref: args.branch,
    });
    const data = res.data as { content?: string };
    if (!data.content) return null;
    return JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

/** Create or update a template file. Returns the new blob sha. */
export async function saveTemplate(
  args: BaseArgs & {
    slug: string;
    template: unknown;
    authorName: string;
    authorEmail: string;
  }
): Promise<string> {
  const octokit = createOctokit(args.token);
  const path = pathFor(args.slug);

  // Look up the existing sha so we can update in place (omit it to create).
  let sha: string | undefined;
  try {
    const existing = await octokit.repos.getContent({
      owner: args.owner,
      repo: args.repo,
      path,
      ref: args.branch,
    });
    if (!Array.isArray(existing.data)) {
      sha = (existing.data as { sha?: string }).sha;
    }
  } catch {
    /* not found — creating */
  }

  const content = Buffer.from(JSON.stringify(args.template, null, 2), "utf-8").toString(
    "base64"
  );
  const res = await octokit.repos.createOrUpdateFileContents({
    owner: args.owner,
    repo: args.repo,
    path,
    message: `chore: save Nova template "${args.slug}"`,
    content,
    ...(sha ? { sha } : {}),
    branch: args.branch,
    committer: { name: args.authorName, email: args.authorEmail },
  });
  return (res.data.content as { sha?: string } | null)?.sha ?? "";
}
