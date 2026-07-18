// POST /api/ai/content — AI fills placeholder text in the current page.
// Takes a list of { instanceId, currentText } objects and a topic/tone prompt.
// Returns { fills: { instanceId: string; text: string }[] }.
// Auth and credit logic identical to /api/ai.

import { getToken } from "next-auth/jwt";
import {
  getOrProvisionUser,
  deductCredit,
  getMonthlySpentToday,
} from "@/lib/supabase-server";
import { getProvider, PROVIDER_CREDIT_COST } from "@studio/ai";
import type { ProviderName } from "@studio/ai";
import { dailyCreditCap, decideCreditSource } from "@/lib/tiers";

type TextInstance = { instanceId: string; currentText: string };

async function generateContent(
  provider: ReturnType<typeof getProvider>,
  topic: string,
  instances: TextInstance[]
): Promise<{ instanceId: string; text: string }[]> {
  const list = instances
    .map((i, idx) => `${idx + 1}. [${i.instanceId}] "${i.currentText || "(empty)"}"`)
    .join("\n");

  const prompt = `You are filling placeholder text for a website about: "${topic}".

Below are the text elements that need content. For each, write compelling, concise copy that fits the context.
Reply ONLY with a JSON array: [{ "instanceId": "...", "text": "..." }, ...]
Keep each text under 120 characters unless it's a paragraph element.

Elements to fill:
${list}`;

  const raw = await provider.complete(
    [{ role: "user", content: prompt }],
    { tier: "patcher", maxTokens: 2000 }
  );
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]) as { instanceId: string; text: string }[];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const token = await getToken({ req: req as Parameters<typeof getToken>[0]["req"] });
  if (!token?.githubId && !token?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user: Awaited<ReturnType<typeof getOrProvisionUser>>;
  try {
    user = await getOrProvisionUser(token);
  } catch {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const { topic, instances, provider: clientProvider } = (await req.json()) as {
    topic: string;
    instances: TextInstance[];
    provider?: ProviderName;
  };

  if (!topic?.trim() || !instances?.length) {
    return Response.json({ error: "topic and instances are required" }, { status: 400 });
  }

  const providerName: ProviderName =
    clientProvider ?? (process.env["AI_PROVIDER"] as ProviderName | undefined) ?? "anthropic";
  const provider = getProvider(providerName);
  const creditCost = Math.max(1, Math.ceil(instances.length / 5));

  const cap = dailyCreditCap(user.tier);
  const spentTodayMonthly = cap !== null ? await getMonthlySpentToday(user.id) : 0;
  const decision = decideCreditSource({
    cost: creditCost,
    monthly: user.credits_remaining,
    topup: user.topup_credits_remaining,
    dailyCap: cap,
    spentTodayMonthly,
  });
  if (!decision.ok) {
    return Response.json({ error: "Insufficient credits" }, { status: 402 });
  }

  try {
    const fills = await generateContent(provider, topic, instances);
    if (fills.length > 0) {
      await deductCredit(user.id, null, creditCost, decision.source === "topup");
    }
    return Response.json({ fills, creditCost: fills.length > 0 ? creditCost : 0 });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
