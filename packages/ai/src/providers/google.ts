// packages/ai/src/providers/google.ts
// Google Gemini adapter (ADR-011)
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, AIMessage, CompleteOptions } from "./base.js";

const MODELS = {
  planner: "gemini-2.0-flash",
  patcher: "gemini-2.0-flash",
} as const;

export class GoogleProvider implements AIProvider {
  readonly name = "Gemini (Google)";
  readonly id = "google" as const;

  private _genAI: GoogleGenerativeAI | null = null;
  private readonly _apiKey: string;

  constructor(apiKey?: string) {
    this._apiKey = apiKey ?? process.env["GOOGLE_GENERATIVE_AI_API_KEY"] ?? "";
  }

  private get genAI(): GoogleGenerativeAI {
    if (!this._genAI) {
      this._genAI = new GoogleGenerativeAI(this._apiKey);
    }
    return this._genAI;
  }

  async complete(messages: AIMessage[], opts: CompleteOptions): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: MODELS[opts.tier],
      // Inject system prompt via systemInstruction
      ...(opts.system ? { systemInstruction: { role: "system", parts: [{ text: opts.system }] } } : {}),
    });

    // Gemini uses alternating user/model turns; collapse system messages into user turn
    const history: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    const nonSystem = messages.filter((m) => m.role !== "system");

    for (let i = 0; i < nonSystem.length - 1; i++) {
      const m = nonSystem[i]!;
      history.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      });
    }

    const lastMsg = nonSystem[nonSystem.length - 1];
    const userText = lastMsg?.content ?? "";

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userText);
    return result.response.text();
  }
}
