// packages/ai/src/__tests__/plannerAgent.test.ts
import { describe, it, expect, vi } from "vitest";
import { plannerAgent } from "../agents/plannerAgent.js";
import type { AIProvider } from "../providers/base.js";

function makeMockProvider(response: string): AIProvider {
  return {
    name: "MockProvider",
    id: "anthropic",
    complete: vi.fn().mockResolvedValue(response),
  };
}

describe("plannerAgent", () => {
  it("returns parsed plan steps from valid JSON", async () => {
    const plan = [{ action: "change color", target: "HeroSection", value: "#000" }];
    const provider = makeMockProvider(JSON.stringify(plan));
    const result = await plannerAgent(provider, "Make hero dark", "{}");
    expect(result).toEqual(plan);
  });

  it("returns empty array when provider returns empty JSON array", async () => {
    const provider = makeMockProvider("[]");
    const result = await plannerAgent(provider, "Do nothing", "{}");
    expect(result).toEqual([]);
  });

  it("strips markdown fences before parsing", async () => {
    const plan = [{ action: "add button", target: "hero", value: "CTA" }];
    const provider = makeMockProvider("```json\n" + JSON.stringify(plan) + "\n```");
    const result = await plannerAgent(provider, "Add CTA", "{}");
    expect(result).toEqual(plan);
  });

  it("returns empty array on JSON parse failure (non-fatal)", async () => {
    const provider = makeMockProvider("This is not JSON at all");
    const result = await plannerAgent(provider, "Anything", "{}");
    expect(result).toEqual([]);
  });

  it("calls provider.complete with the user message in the prompt", async () => {
    const provider = makeMockProvider("[]");
    await plannerAgent(provider, "Turn background red", "{}");
    const calls = (provider.complete as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBe(1);
    const [messages] = calls[0] as Parameters<AIProvider["complete"]>;
    expect(messages[0]?.content).toContain("Turn background red");
  });
});
