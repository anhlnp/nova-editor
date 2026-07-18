// packages/ai/src/index.ts
export type { AIProvider, AIMessage, CompleteOptions, ProviderName } from "./providers/base.js";
export { PROVIDER_CREDIT_COST } from "./providers/base.js";
export { AnthropicProvider }   from "./providers/anthropic.js";
export { OpenAIProvider }      from "./providers/openai.js";
export { GoogleProvider }      from "./providers/google.js";
export { GroqProvider }        from "./providers/groq.js";
export { OpenRouterProvider }  from "./providers/openrouter.js";
export { MistralProvider }     from "./providers/mistral.js";
export { getProvider, PROVIDER_NAMES } from "./providers/registry.js";

export type { PlanStep } from "./agents/plannerAgent.js";
export { plannerAgent }  from "./agents/plannerAgent.js";
export { composerAgentWS } from "./agents/composerAgentWS.js";
export { buildComposePromptWS } from "./prompts/compose-ws.prompt.js";
export { validateCompositionWS } from "./utils/validateCompositionWS.js";
export type { WSCompositionResult } from "./utils/validateCompositionWS.js";
export { buildSystemPrompt } from "./prompts/system.prompt.js";
