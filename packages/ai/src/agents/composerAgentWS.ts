// COMPOSE-WS flow: natural-language description → WebstudioData tree.
// Uses the WS component system (Box, Heading, Button…) instead of Nova legacy blocks.
// Output schema: { tree: AINode[] } — then validated by validateCompositionWS().
import type { AIProvider, AIMessage } from "../providers/base.js";
import { buildComposePromptWS } from "../prompts/compose-ws.prompt.js";

/**
 * Attempt to repair a JSON string that was truncated mid-stream (e.g. due to
 * a max-token cutoff). Strategy:
 *  1. Strip the trailing partial token that caused the SyntaxError — anything
 *     after the last complete value delimiter (`,`, `}`, `]`, or a closing `"`).
 *  2. Close every unclosed `[` and `{` in LIFO order.
 * This produces a structurally valid (though possibly abbreviated) document
 * rather than throwing, allowing the validator downstream to work with
 * whatever nodes were fully generated.
 */
function repairTruncatedJson(raw: string): string {
  // Walk the string tracking open brackets/braces and whether we're inside a string.
  const stack: Array<"{" | "["> = [];
  let inString = false;
  let escaped = false;
  let lastSafePos = 0; // last position after a complete value delimiter

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\" && inString) { escaped = true; continue; }
    if (ch === '"') {
      inString = !inString;
      if (!inString) lastSafePos = i + 1; // closing quote = safe boundary
      continue;
    }
    if (inString) continue;

    if (ch === "{" || ch === "[") {
      stack.push(ch as "{" | "[");
    } else if (ch === "}" || ch === "]") {
      stack.pop();
      lastSafePos = i + 1;
    } else if (ch === "," || ch === ":") {
      lastSafePos = i; // after comma/colon the next token may be incomplete
    }
  }

  // Truncate to last known-safe position, then close open containers.
  let repaired = raw.slice(0, lastSafePos).trimEnd();
  // Remove trailing comma or colon before closing (would be invalid JSON)
  repaired = repaired.replace(/[,\s:]+$/, "");

  for (let i = stack.length - 1; i >= 0; i--) {
    repaired += stack[i] === "{" ? "}" : "]";
  }
  return repaired;
}

function extractJsonPatch(text: string): unknown {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenceMatch?.[1] != null ? fenceMatch[1].trim() : text.trim();
  const start = raw.search(/[\[{]/);
  if (start === -1) throw new Error("No JSON found in response");
  const slice = raw.slice(start);

  // First attempt: parse as-is (fast path — handles well-formed output).
  try {
    return JSON.parse(slice);
  } catch {
    // Second attempt: repair truncated JSON and retry.
    const repaired = repairTruncatedJson(slice);
    return JSON.parse(repaired);
  }
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
        // 12 000 tokens to avoid mid-string truncation on large page compositions.
        // The compose prompt is ~400 tokens; a full page JSON is typically 2 000–6 000
        // output tokens — 12 k gives 2× headroom for complex requests.
        maxTokens: 12000,
        system,
      });

      // extractJsonPatch returns the outermost JSON array or object.
      // It auto-repairs truncated JSON before parsing.
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
