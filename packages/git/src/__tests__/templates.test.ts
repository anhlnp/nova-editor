// packages/git/src/__tests__/templates.test.ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@octokit/rest", () => ({ Octokit: vi.fn() }));
import { Octokit } from "@octokit/rest";

function mockOctokit(impl: {
  getContent?: (...a: unknown[]) => unknown;
  createOrUpdateFileContents?: (...a: unknown[]) => unknown;
}) {
  const Mocked = Octokit as unknown as ReturnType<typeof vi.fn>;
  Mocked.mockImplementation(() => ({ repos: impl }));
}

const base = { token: "t", owner: "o", repo: "r", branch: "main" };

describe("listTemplates", () => {
  it("returns slugs for .json files in the templates dir", async () => {
    mockOctokit({
      getContent: vi.fn().mockResolvedValue({
        data: [
          { type: "file", name: "hero.json", path: ".nova/templates/hero.json" },
          { type: "file", name: "readme.md", path: ".nova/templates/readme.md" },
          { type: "dir", name: "sub", path: ".nova/templates/sub" },
        ],
      }),
    });
    const { listTemplates } = await import("../commands/templates.js");
    const refs = await listTemplates(base);
    expect(refs).toEqual([{ slug: "hero", path: ".nova/templates/hero.json" }]);
  });

  it("returns [] when the directory does not exist (404)", async () => {
    mockOctokit({ getContent: vi.fn().mockRejectedValue(new Error("Not Found")) });
    const { listTemplates } = await import("../commands/templates.js");
    expect(await listTemplates(base)).toEqual([]);
  });
});

describe("readTemplate", () => {
  it("decodes and parses the template JSON", async () => {
    const tpl = { scope: "page", meta: { name: "Hero" } };
    mockOctokit({
      getContent: vi.fn().mockResolvedValue({
        data: { content: Buffer.from(JSON.stringify(tpl)).toString("base64") },
      }),
    });
    const { readTemplate } = await import("../commands/templates.js");
    expect(await readTemplate({ ...base, slug: "hero" })).toEqual(tpl);
  });

  it("returns null on error", async () => {
    mockOctokit({ getContent: vi.fn().mockRejectedValue(new Error("nope")) });
    const { readTemplate } = await import("../commands/templates.js");
    expect(await readTemplate({ ...base, slug: "missing" })).toBeNull();
  });
});

describe("saveTemplate", () => {
  it("creates a new file (no sha) when none exists", async () => {
    const createFn = vi.fn().mockResolvedValue({ data: { content: { sha: "newsha" } } });
    mockOctokit({
      getContent: vi.fn().mockRejectedValue(new Error("Not Found")),
      createOrUpdateFileContents: createFn,
    });
    const { saveTemplate } = await import("../commands/templates.js");
    const sha = await saveTemplate({
      ...base,
      slug: "hero",
      template: { a: 1 },
      authorName: "octocat",
      authorEmail: "o@e.com",
    });
    expect(sha).toBe("newsha");
    const callArg = createFn.mock.calls[0]![0] as Record<string, unknown>;
    expect(callArg["path"]).toBe(".nova/templates/hero.json");
    expect(callArg["sha"]).toBeUndefined(); // create, not update
  });

  it("updates in place with the existing sha", async () => {
    const createFn = vi.fn().mockResolvedValue({ data: { content: { sha: "sha2" } } });
    mockOctokit({
      getContent: vi.fn().mockResolvedValue({ data: { sha: "oldsha" } }),
      createOrUpdateFileContents: createFn,
    });
    const { saveTemplate } = await import("../commands/templates.js");
    await saveTemplate({
      ...base,
      slug: "hero",
      template: { a: 1 },
      authorName: "octocat",
      authorEmail: "o@e.com",
    });
    const callArg = createFn.mock.calls[0]![0] as Record<string, unknown>;
    expect(callArg["sha"]).toBe("oldsha");
  });
});
