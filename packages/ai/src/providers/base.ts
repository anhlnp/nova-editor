// packages/ai/src/providers/base.ts
// Provider-agnostic interface every AI adapter must implement.

export type AIRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface CompleteOptions {
  /** Model to use — provider resolves this to its own model ID */
  tier: "planner" | "patcher";
  maxTokens: number;
  /** Optional system prompt (passed separately if the provider supports it) */
  system?: string;
}

export interface AIProvider {
  /** Human-readable name shown in the UI */
  readonly name: string;
  /** Machine identifier matching the AI_PROVIDER env var */
  readonly id: "groq" | "openrouter" | "google" | "mistral" | "anthropic" | "openai";

  /**
   * Send a chat completion request and return the raw text response.
   * The caller is responsible for JSON parsing and validation.
   */
  complete(messages: AIMessage[], opts: CompleteOptions): Promise<string>;
}

export type ProviderName = AIProvider["id"];

/**
 * Credit cost per AI operation (planner + patcher combined).
 * 1 credit = $0.002 USD.
 *
 * Methodology — typical Nova operation token budget:
 *   Planner:  2,000 input  +  300 output tokens
 *   Patcher:  4,000 input  +  600 output tokens
 *
 * Paid provider costs verified: 2026-06-15
 *   Anthropic: Haiku 4.5 ($0.80/$4.00 per M) + Sonnet 4.6 ($3/$15 per M) → ~$0.024/op → 12 credits
 *   OpenAI:    GPT-4o-mini ($0.15/$0.60 per M) + GPT-4o ($2.50/$10 per M) → ~$0.016/op →  8 credits
 *   Google:    Gemini 2.5 Flash ($0.075/$0.30 per M) + Pro ($1.25/$10 per M) → ~$0.011/op → 6 credits
 *
 * Re-verify when providers reprice. Update this constant and redeploy — no DB change needed.
 * If you need live pricing without a redeploy, see doc/pricing-policy.md §5 (DB-driven cost table).
 *
 * Free providers (groq, openrouter, mistral) pay $0 to the operator; 1 credit is rate-limit only.
 */
export const PROVIDER_CREDIT_COST: Record<ProviderName, number> = {
  groq:       1,   // $0.000/op — free LPU; 1 credit = rate-limit only
  openrouter: 1,   // $0.000/op — ":free" models; 1 credit = rate-limit only
  mistral:    1,   // ~$0.000/op — open-weight, operator cost negligible
  google:     6,   // ~$0.011/op — Gemini 2.5 Flash + Pro  (verify: 2026-06-15)
  openai:     8,   // ~$0.016/op — GPT-4o-mini + GPT-4o    (verify: 2026-06-15)
  anthropic:  12,  // ~$0.024/op — Haiku 4.5 + Sonnet 4.6  (verify: 2026-06-15)
};
