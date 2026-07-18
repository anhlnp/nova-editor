// packages/ai/src/__tests__/providers.test.ts
import { describe, it, expect } from "vitest";
import { getProvider, PROVIDER_NAMES } from "../providers/registry.js";

describe("getProvider", () => {
  it("returns AnthropicProvider by default", () => {
    const p = getProvider();
    expect(p.id).toBe("anthropic");
    expect(p.name).toContain("Anthropic");
  });

  it("returns AnthropicProvider for 'anthropic'", () => {
    expect(getProvider("anthropic").id).toBe("anthropic");
  });

  it("returns OpenAIProvider for 'openai'", () => {
    expect(getProvider("openai").id).toBe("openai");
  });

  it("returns GoogleProvider for 'google'", () => {
    expect(getProvider("google").id).toBe("google");
  });

  it("returns GroqProvider for 'groq'", () => {
    const p = getProvider("groq");
    expect(p.id).toBe("groq");
    expect(p.name).toContain("Groq");
  });

  it("returns OpenRouterProvider for 'openrouter'", () => {
    const p = getProvider("openrouter");
    expect(p.id).toBe("openrouter");
    expect(p.name).toContain("OpenRouter");
  });

  it("returns MistralProvider for 'mistral'", () => {
    const p = getProvider("mistral");
    expect(p.id).toBe("mistral");
    expect(p.name).toContain("Mistral");
  });

  it("falls back to anthropic for unknown provider string", () => {
    expect(getProvider("unknown-llm").id).toBe("anthropic");
  });
});

describe("PROVIDER_NAMES", () => {
  it("lists all six providers", () => {
    const ids = PROVIDER_NAMES.map((p) => p.id);
    expect(ids).toContain("anthropic");
    expect(ids).toContain("openai");
    expect(ids).toContain("google");
    expect(ids).toContain("groq");
    expect(ids).toContain("openrouter");
    expect(ids).toContain("mistral");
  });

  it("every entry has id, label, and free flag", () => {
    for (const p of PROVIDER_NAMES) {
      expect(typeof p.id).toBe("string");
      expect(typeof p.label).toBe("string");
      expect(typeof p.free).toBe("boolean");
    }
  });

  it("marks exactly 4 providers as free", () => {
    const freeProviders = PROVIDER_NAMES.filter((p) => p.free);
    expect(freeProviders).toHaveLength(4);
    const freeIds = freeProviders.map((p) => p.id);
    expect(freeIds).toContain("google");
    expect(freeIds).toContain("groq");
    expect(freeIds).toContain("openrouter");
    expect(freeIds).toContain("mistral");
  });
});
