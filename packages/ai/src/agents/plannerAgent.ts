// packages/ai/src/agents/plannerAgent.ts
// Cheap-model step: user message → structured plan array.
// Provider-agnostic: receives any AIProvider implementation.
import type { AIProvider } from "../providers/base.js";

export interface PlanStep {
  action: string; // "change background color"
  target: string; // "elements[0] (HeroSection)"
  value:  string; // "dark navy #0f172a"
}

export async function plannerAgent(
  provider: AIProvider,
  userMessage: string,
  schemaContext: string
): Promise<PlanStep[]> {
  const prompt = `Given this page schema, what changes are needed to fulfill this request?
"${userMessage}"

Schema summary: ${schemaContext}

Output ONLY a JSON array of { action, target, value } objects. No explanation. No markdown.
Example: [{ "action": "change color", "target": "HeroSection background", "value": "#0f172a" }]`;

  const text = await provider.complete(
    [{ role: "user", content: prompt }],
    { tier: "planner", maxTokens: 500 }
  );

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim()) as PlanStep[];
  } catch {
    // Planner parse failure is non-fatal — return empty plan, patcher will still try
    return [];
  }
}
