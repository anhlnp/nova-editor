// packages/ai/src/providers/openai.ts
// OpenAI GPT adapter (ADR-011)
import OpenAI from "openai";
import type { AIProvider, AIMessage, CompleteOptions } from "./base.js";

const MODELS = {
  planner: "gpt-4o-mini",
  patcher: "gpt-4o",
} as const;

export class OpenAIProvider implements AIProvider {
  readonly name = "GPT (OpenAI)";
  readonly id = "openai" as const;

  private _client: OpenAI | null = null;
  private readonly _apiKey: string | undefined;

  constructor(apiKey?: string) {
    this._apiKey = apiKey ?? process.env["OPENAI_API_KEY"];
  }

  private get client(): OpenAI {
    if (!this._client) {
      this._client = new OpenAI({ apiKey: this._apiKey });
    }
    return this._client;
  }

  async complete(messages: AIMessage[], opts: CompleteOptions): Promise<string> {
    // OpenAI supports system as a message with role "system"
    const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
      ...messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    const response = await this.client.chat.completions.create({
      model: MODELS[opts.tier],
      max_tokens: opts.maxTokens,
      messages: allMessages,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}
