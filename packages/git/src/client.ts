// packages/git/src/client.ts
// Octokit instance factory — ADR-003: server-side only
import { Octokit } from "@octokit/rest";

export function createOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}
