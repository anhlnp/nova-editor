// packages/deploy/src/__tests__/vercel.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { triggerVercelDeploy } from "../vercel.js";

const args = { token: "tok", repoFullName: "octocat/site", branch: "main" };

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("triggerVercelDeploy", () => {
  it("returns ok + deployUrl on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "site-abc.vercel.app" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await triggerVercelDeploy(args);
    expect(result.ok).toBe(true);
    expect(result.deployUrl).toBe("https://site-abc.vercel.app");

    // sanity: posts to the deployments endpoint with the repo name
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toContain("api.vercel.com");
    expect(JSON.parse((init as RequestInit).body as string).name).toBe("site");
  });

  it("returns ok:false on non-2xx (does not throw)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => "forbidden" })
    );
    const result = await triggerVercelDeploy(args);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("HTTP 403");
    expect(result.deployUrl).toBe("");
  });

  it("returns ok:false when fetch throws (never propagates)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const result = await triggerVercelDeploy(args);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("network down");
  });

  it("tolerates a success body without a url", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    const result = await triggerVercelDeploy(args);
    expect(result.ok).toBe(true);
    expect(result.deployUrl).toBe("");
  });
});
