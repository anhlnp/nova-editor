// POST: AI compose — natural language → WebstudioData patch (WS component format).
// Auth, rate-limit, credit check identical to studio's AI route (ADR-006/038).
// Returns WSCompositionResult which the client applies to nanostores atoms.
import { getToken } from "next-auth/jwt";
import {
  getOrProvisionUser,
  deductCredit,
  getMonthlySpentToday,
  saveAIMessage,
  createAIConversation,
  supabase,
} from "@/lib/supabase-server";
import {
  getProvider,
  composerAgentWS,
  validateCompositionWS,
  PROVIDER_CREDIT_COST,
} from "@studio/ai";
import type { ProviderName } from "@studio/ai";
import { dailyCreditCap, decideCreditSource } from "@/lib/tiers";

export async function POST(req: Request) {
  // 1. Auth
  const token = await getToken({ req: req as Parameters<typeof getToken>[0]["req"] });
  if (!token?.githubId && !token?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Load user
  let user: Awaited<ReturnType<typeof getOrProvisionUser>>;
  try {
    user = await getOrProvisionUser(token);
  } catch {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // 3. Parse body
  const {
    userMessage,
    projectId,
    conversationId: clientConversationId,
    provider: clientProvider,
  } = (await req.json()) as {
    userMessage: string;
    projectId?: string | null;
    conversationId?: string | null;
    provider?: ProviderName;
  };

  const providerName: ProviderName =
    clientProvider ?? (process.env["AI_PROVIDER"] as ProviderName | undefined) ?? "anthropic";
  const provider = getProvider(providerName);
  const creditCost = PROVIDER_CREDIT_COST[providerName] ?? 1;

  // 4. Credit check (ADR-038)
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
    const combined = user.credits_remaining + user.topup_credits_remaining;
    return decision.reason === "daily_cap"
      ? Response.json(
          { error: `Daily limit reached (${cap} credits/day). Buy a top-up or come back tomorrow.` },
          { status: 429 }
        )
      : Response.json(
          { error: `Need ${creditCost} credits, have ${combined}. Upgrade or buy a top-up.` },
          { status: 402 }
        );
  }

  // 5. Rate limit: max 10 AI ops/minute
  const { count } = await supabase
    .from("credit_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("reason", "ai_request")
    .gte("created_at", new Date(Date.now() - 60_000).toISOString());

  if ((count ?? 0) >= 10) {
    return Response.json(
      { error: "Rate limit exceeded. Max 10 AI calls per minute." },
      { status: 429 }
    );
  }

  // 5b. Log the request marker BEFORE the slow AI call (closes concurrent-burst race)
  await supabase.from("credit_transactions").insert({
    user_id: user.id,
    project_id: projectId ?? null,
    delta: 0,
    reason: "ai_request",
  });

  // 6. Resolve or create conversation
  let conversationId = clientConversationId ?? null;
  if (!conversationId && projectId) {
    const title = userMessage.slice(0, 60).trim() || "New composition";
    const created = await createAIConversation(projectId, user.id, title).catch(() => null);
    conversationId = created?.id ?? null;
  }

  // 7. Save user message
  if (conversationId && projectId) {
    await saveAIMessage({
      conversationId,
      projectId,
      userId: user.id,
      role: "user",
      content: userMessage,
    }).catch(() => { /* non-fatal */ });
  }

  try {
    // 8. Compose → validate
    const rawOutput = await composerAgentWS(provider, userMessage);
    const composition = validateCompositionWS(rawOutput);

    // ADR-006: deduct ONLY after we have a valid composition (never for empty/invalid)
    if (composition.instances.length > 0) {
      await deductCredit(user.id, projectId ?? null, creditCost, decision.source === "topup");
    }

    // 9. Save assistant response
    const responseText = `Composed ${composition.instances.length} instance(s) using: ${composition.usedComponents.join(", ") || "none"}.`;
    if (conversationId && projectId) {
      await saveAIMessage({
        conversationId,
        projectId,
        userId: user.id,
        role: "assistant",
        content: responseText,
        provider: provider.id,
        creditsUsed: composition.instances.length > 0 ? creditCost : 0,
      }).catch(() => { /* non-fatal */ });
    }

    return Response.json({
      composition,
      provider: provider.id,
      creditCost: composition.instances.length > 0 ? creditCost : 0,
      creditsRemaining: user.credits_remaining + user.topup_credits_remaining - creditCost,
      conversationId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI compose failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
