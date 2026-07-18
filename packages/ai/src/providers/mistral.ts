// packages/ai/src/providers/mistral.ts
// Mistral AI adapter — open-weight models are free, no billing required.
// Docs: https://docs.mistral.ai/api/
// Free models: open-mistral-7b, open-mixtral-8x7b, open-mixtral-8x22b
import OpenAI from "openai";
import type { AIProvider, AIMessage, CompleteOptions } from "./base.js";

const MODELS = {
  planner: "open-mistral-7b",     // Mistral 7B — fast, free, solid for planning prompts
  patcher: "open-mixtral-8x7b",  // Mixtral 8×7B MoE — stronger reasoning, still free
} as const;

export class MistralProvider implements AIProvider {
  readonly name = "Mistral (Mixtral)";
  readonly id = "mistral" as const;

  private _client: OpenAI | null = null;
  private readonly _apiKey: string | undefined;

  constructor(apiKey?: string) {
    this._apiKey = apiKey ?? process.env["MISTRAL_API_KEY"];
  }

  private get client(): OpenAI {
    if (!this._client) {
      this._client = new OpenAI({
        baseURL: "https://api.mistral.ai/v1",
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
