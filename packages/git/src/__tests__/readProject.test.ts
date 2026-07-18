// packages/git/src/__tests__/readProject.test.ts
import { describe, it, expect, vi } from "vitest";

// Mock Octokit before importing the module
vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn(),
}));

import { Octokit } from "@octokit/rest";

// Helper to set up mocked Octokit
function mockOctokit(getContentFn: (...args: unknown[]) => unknown) {
  const MockedOctokit = Octokit as unknown as ReturnType<typeof vi.fn>;
  MockedOctokit.mockImplementation(() => ({
    repos: {
      getContent: getContentFn,
    },
  }));
}

describe("readProject", () => {
  it("returns parsed project when project.json exists", async () => {
    const validProject = {
      schemaVersion: "1.0",
      meta: {
        name: "Test",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      pages: [
        {
          id: "page_xK2mRp",
          name: "Home",
          route: "/",
          elements: [],
        },
      ],
    };

    const base64Content = Buffer.from(JSON.stringify(validProject)).toString(
      "base64"
    );

    mockOctokit(vi.fn().mockResolvedValue({
      data: {
        content: base64Content,
        sha: "abc123",
      },
    }));

    // Dynamic import to get fresh module with mocked deps
    const { readProject } = await import("../commands/readProject.js");

    const result = await readProject({
      token: "test-token",
      owner: "test-owner",
      repo: "test-repo",
      branch: "main",
    });

    expect(result.project).not.toBeNull();
    expect(result.project?.schemaVersion).toBe("4.0"); // migrated from stored 1.0 to latest
    expect(result.project?.meta.name).toBe("Test");
    expect(result.sha).toBe("abc123");
  });

  it("returns null project when file is 404", async () => {
    mockOctokit(vi.fn().mockRejectedValue({ status: 404 }));

    const { readProject } = await import("../commands/readProject.js");

    const result = await readProject({
      token: "test-token",
      owner: "test-owner",
      repo: "test-repo",
      branch: "main",
    });

    expect(result.project).toBeNull();
    expect(result.sha).toBeNull();
  });

  it("migrates old integer-version schemas", async () => {
    const oldProject = {
      version: 2,
      meta: {
        name: "Old",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      pages: [
        {
          id: "page_xK2mRp",
          name: "Home",
          route: "/",
          elements: [],
        },
      ],
    };

    const base64Content = Buffer.from(JSON.stringify(oldProject)).toString(
      "base64"
    );

    mockOctokit(vi.fn().mockResolvedValue({
      data: {
        content: base64Content,
        sha: "def456",
      },
    }));

    const { readProject } = await import("../commands/readProject.js");

    const result = await readProject({
      token: "test-token",
      owner: "test-owner",
      repo: "test-repo",
      branch: "main",
    });

    expect(result.project?.schemaVersion).toBe("4.0"); // migrated from stored 1.0 to latest
  });
});
