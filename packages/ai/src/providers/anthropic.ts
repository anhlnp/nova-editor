// packages/ai/src/providers/anthropic.ts
// Anthropic Claude adapter — default provider (ADR-011)
import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, AIMessage, CompleteOptions } from "./base.js";

const MODELS = {
  planner: "claude-haiku-4-5-20251001",
  patcher: "claude-sonnet-4-6",
} as const;

export class AnthropicProvider implements AIProvider {
  readonly name = "Claude (Anthropic)";
  readonly id = "anthropic" as const;

  private _client: Anthropic | null = null;
  private readonly _apiKey: string | undefined;

  constructor(apiKey?: string) {
    this._apiKey = apiKey ?? process.env["ANTHROPIC_API_KEY"];
  }

  private get client(): Anthropic {
    if (!this._client) {
      this._client = new Anthropic({ apiKey: this._apiKey });
    }
    return this._client;
  }

  async complete(messages: AIMessage[], opts: CompleteOptions): Promise<string> {
    // Anthropic keeps system separate from messages
    const systemMsg = opts.system ?? messages.find((m) => m.role === "system")?.content;
    const chatMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const response = await this.client.messages.create({
      model: MODELS[opts.tier],
      max_tokens: opts.maxTokens,
      ...(systemMsg ? { system: systemMsg } : {}),
      messages: chatMessages,
    });

    const block = response.content[0];
    return block?.type === "text" ? block.text : "";
  }
}
