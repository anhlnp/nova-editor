// COMPOSE-WS flow: natural-language description → WebstudioData tree.
// Uses the WS component system (Box, Heading, Button…) instead of Nova legacy blocks.
// Output schema: { tree: AINode[] } — then validated by validateCompositionWS().
import type { AIProvider, AIMessage } from "../providers/base.js";
import { buildComposePromptWS } from "../prompts/compose-ws.prompt.js";

function extractJsonPatch(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch?.[1] != null ? fenceMatch[1].trim() : text.trim();
  const start = raw.search(/[\[{]/);
  if (start === -1) throw new Error("No JSON found in response");
  const slice = raw.slice(start);
  return JSON.parse(slice);
}

export async function composerAgentWS(
  provider: AIProvider,
  userPrompt: string,
  extraHints?: string,
  onRetry?: (attempt: number, error: string) => void
): Promise<unknown> {
  const system = buildComposePromptWS(extraHints);
  const userContent = `Compose a page for this description:\n\n${userPrompt}\n\nOutput the JSON object with a "tree" key now.`;

  let lastError = "";

  for (let attempt = 1; attempt <= 3; attempt++) {
    const messages: AIMessage[] =
      attempt === 1
        ? [{ role: "user", content: userContent }]
        : [
            { role: "user", content: userContent },
            { role: "assistant", content: '{"tree":[]}' },
            {
              role: "user",
              content: `Your previous output caused this error: "${lastError}". Output ONLY a valid JSON object with a "tree" array of node objects using ONLY the listed component names.`,
            },
          ];

    try {
      const text = await provider.complete(messages, {
        tier: "patcher",
        maxTokens: 6000,
        system,
      });

      // extractJsonPatch returns the outermost JSON array or object
      const parsed = extractJsonPatch(text);

      // If AI returned an array instead of {tree:[...]}, wrap it
      if (Array.isArray(parsed)) {
        return { tree: parsed };
      }
      return parsed;
    } catch (err) {
      lastError = String(err);
      onRetry?.(attempt, lastError);
      if (attempt === 3) {
        throw new Error(`composerAgentWS failed after 3 attempts: ${lastError}`);
      }
    }
  }

  return { tree: [] };
}
