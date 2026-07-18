// packages/git/src/__tests__/checkConflict.test.ts
import { describe, it, expect, vi } from "vitest";

// Mock Octokit
vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn(),
}));

import { Octokit } from "@octokit/rest";

function mockOctokit(getContentFn: (...args: unknown[]) => unknown) {
  const MockedOctokit = Octokit as unknown as ReturnType<typeof vi.fn>;
  MockedOctokit.mockImplementation(() => ({
    repos: {
      getContent: getContentFn,
    },
  }));
}

describe("checkConflict", () => {
  it("returns false when SHA matches (no conflict)", async () => {
    mockOctokit(vi.fn().mockResolvedValue({
      data: { sha: "abc123" },
    }));

    const { checkConflict } = await import("../commands/checkConflict.js");

    const result = await checkConflict({
      token: "test-token",
      owner: "test-owner",
      repo: "test-repo",
      branch: "main",
      lastKnownSha: "abc123",
    });

    expect(result).toBe(false);
  });

  it("returns true when SHA doesn't match (conflict)", async () => {
    mockOctokit(vi.fn().mockResolvedValue({
      data: { sha: "new-sha-999" },
    }));

    const { checkConflict } = await import("../commands/checkConflict.js");

    const result = await checkConflict({
      token: "test-token",
      owner: "test-owner",
      repo: "test-repo",
      branch: "main",
      lastKnownSha: "abc123",
    });

    expect(result).toBe(true);
  });

  it("returns false when file doesn't exist (404)", async () => {
    mockOctokit(vi.fn().mockRejectedValue({ status: 404 }));

    const { checkConflict } = await import("../commands/checkConflict.js");

    const result = await checkConflict({
      token: "test-token",
      owner: "test-owner",
      repo: "test-repo",
      branch: "main",
      lastKnownSha: "abc123",
    });

    expect(result).toBe(false);
  });
});
