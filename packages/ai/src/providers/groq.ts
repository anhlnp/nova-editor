// packages/ai/src/providers/groq.ts
// Groq LPU adapter — OpenAI-compatible, free tier (no credit card required).
// Docs: https://console.groq.com/docs/openai
import OpenAI from "openai";
import type { AIProvider, AIMessage, CompleteOptions } from "./base.js";

// Groq model IDs (as of 2025). Updated via: https://console.groq.com/docs/models
const MODELS = {
  planner: "llama-3.1-8b-instant",      // Fast 8B — ideal for short planning prompts
  patcher: "llama-3.3-70b-versatile",   // Best free Groq model — strong JSON generation
} as const;

export class GroqProvider implements AIProvider {
  readonly name = "Groq (Llama 3)";
  readonly id = "groq" as const;

  private _client: OpenAI | null = null;
  private readonly _apiKey: string | undefined;

  constructor(apiKey?: string) {
    this._apiKey = apiKey ?? process.env["GROQ_API_KEY"];
  }

  private get client(): OpenAI {
    if (!this._client) {
      this._client = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: this._apiKey,
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
