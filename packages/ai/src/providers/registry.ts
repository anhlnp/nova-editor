// packages/ai/src/providers/registry.ts
// Factory: resolve a provider name → AIProvider instance.
// New providers are added here with zero changes elsewhere.
import type { AIProvider, ProviderName } from "./base.js";
import { AnthropicProvider }   from "./anthropic.js";
import { OpenAIProvider }      from "./openai.js";
import { GoogleProvider }      from "./google.js";
import { GroqProvider }        from "./groq.js";
import { OpenRouterProvider }  from "./openrouter.js";
import { MistralProvider }     from "./mistral.js";

export function getProvider(name?: ProviderName | string | null): AIProvider {
  switch (name) {
    case "openai":      return new OpenAIProvider();
    case "google":      return new GoogleProvider();
    case "groq":        return new GroqProvider();
    case "openrouter":  return new OpenRouterProvider();
    case "mistral":     return new MistralProvider();
    case "anthropic":
    default:            return new AnthropicProvider();
  }
}

export const PROVIDER_NAMES: { id: ProviderName; label: string; free: boolean }[] = [
  { id: "anthropic",   label: "Claude (Anthropic)",              free: false },
  { id: "openai",      label: "GPT (OpenAI)",                    free: false },
  { id: "google",      label: "Gemini (Google)",                 free: true  },
  { id: "groq",        label: "Groq — Llama 3.3 70B",           free: true  },
  { id: "openrouter",  label: "OpenRouter — Gemma 3 / Llama 3", free: true  },
  { id: "mistral",     label: "Mistral — Mixtral 8×7B",         free: true  },
];
