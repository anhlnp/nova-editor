// packages/ai/src/providers/openrouter.ts
// OpenRouter adapter — aggregates many providers, free models available with ":free" suffix.
// Docs: https://openrouter.ai/docs
// Free model list: https://openrouter.ai/models?q=:free
import OpenAI from "openai";
import type { AIProvider, AIMessage, CompleteOptions } from "./base.js";

// openrouter/auto — smart router that picks from available free models automatically.
// This avoids hard-coding slugs that go in/out of the free tier.
// See: https://openrouter.ai/models?q=:free for manually-pinned alternatives.
const MODELS = {
  planner: "openrouter/auto",  // Auto-route to best available free model
  patcher: "openrouter/auto",  // Auto-route to best available free model
} as const;

export class OpenRouterProvider implements AIProvider {
  readonly name = "OpenRouter (Gemma 3 / Llama 3)";
  readonly id = "openrouter" as const;

  private _client: OpenAI | null = null;
  private readonly _apiKey: string | undefined;

  constructor(apiKey?: string) {
    this._apiKey = apiKey ?? process.env["OPENROUTER_API_KEY"];
  }

  private get client(): OpenAI {
    if (!this._client) {
      this._client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: this._apiKey,
        // OpenRouter asks for these headers for proper attribution + dashboard tracking.
        defaultHeaders: {
          "HTTP-Referer": "https://nova-editor.app",
          "X-Title": "Nova No-Code Editor",
        },
      });
    }
    return this._client;
  }

  async complete(messages: AIMessage[], opts: CompleteOptions): Promise<string> {
    const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
      ...messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const response = await this.client.chat.completions.create({
      model: MODELS[opts.tier],
      max_tokens: opts.maxTokens,
      messages: allMessages,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}
