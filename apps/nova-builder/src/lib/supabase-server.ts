// Server-side Supabase client using the service role key.
// NEVER import this in client components — service key must stay server-side.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialize: missing env throws a clear error at call time, not at import.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env not configured — set SUPABASE_URL and SUPABASE_SERVICE_KEY."
    );
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

// Lazy Proxy so every existing call site (`supabase.from(...)`) is unchanged.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRow = {
  id: string;
  github_id: string | null;
  github_login: string | null;
  github_email: string | null;
  email: string | null;
  provider: string;
  display_name: string | null;
  tier: string;
  credits_remaining: number;
  topup_credits_remaining: number;
};

// ── User helpers ──────────────────────────────────────────────────────────────

async function grantInitialCredits(userId: string, initialCredits: number) {
  const { count } = await supabase
    .from("credit_transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("reason", "initial_grant");
  if (count === 0) {
    await supabase.from("users").update({ credits_remaining: initialCredits }).eq("id", userId);
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      delta: initialCredits,
      reason: "initial_grant",
    });
  }
}

export async function upsertUser(args: {
  githubId: string;
  githubLogin: string;
  githubEmail?: string | null;
  githubAccountCreatedAt?: string | null;
}) {
  const accountCreatedAt = args.githubAccountCreatedAt
    ? new Date(args.githubAccountCreatedAt)
    : null;
  const ageInDays = accountCreatedAt
    ? (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  const initialCredits = ageInDays < 30 ? 50 : 200;

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        github_id: args.githubId,
        github_login: args.githubLogin,
        github_email: args.githubEmail,
        github_account_created_at: args.githubAccountCreatedAt,
        provider: "github",
      },
      { onConflict: "github_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (!error && data) {
    await grantInitialCredits((data as { id: string }).id, initialCredits);
  }

  return data;
}

export async function createEmailUser(args: {
  email: string;
  passwordHash: string;
  displayName?: string | null;
}): Promise<UserRow> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      email: args.email,
      provider: "email",
      display_name: args.displayName ?? null,
      password_hash: args.passwordHash,
      tier: "free",
    })
    .select("id, email, provider, display_name, tier, credits_remaining, topup_credits_remaining, github_id, github_login, github_email")
    .single();
  if (error) throw new Error(`createEmailUser failed: ${error.message}`);
  const user = data as UserRow;
  await grantInitialCredits(user.id, 200);
  return user;
}

export async function upsertEmailUser(args: {
  email: string;
  provider: "google" | "email";
  displayName?: string | null;
}) {
  const initialCredits = 200;

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        email: args.email,
        provider: args.provider,
        display_name: args.displayName ?? null,
      },
      { onConflict: "provider,email", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (!error && data) {
    await grantInitialCredits((data as { id: string }).id, initialCredits);
  }
  if (error) throw new Error(`upsertEmailUser failed: ${error.message}`);
  return data as UserRow;
}

export async function getUser(githubId: string): Promise<UserRow> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("github_id", githubId)
    .single();
  if (error) throw new Error(`User not found: ${githubId}`);
  return data as UserRow;
}

export async function getUserByEmail(provider: string, email: string): Promise<UserRow> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("provider", provider)
    .eq("email", email)
    .single();
  if (error) throw new Error(`User not found: ${provider}/${email}`);
  return data as UserRow;
}

export async function getMonthlySpentToday(userId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("credit_transactions")
    .select("delta")
    .eq("user_id", userId)
    .eq("reason", "ai_operation")
    .eq("from_topup", false)
    .gte("created_at", startOfDay.toISOString());
  return (data ?? []).reduce((sum, r) => sum + Math.abs((r as { delta: number }).delta), 0);
}

export interface ProvisionableToken {
  provider?: unknown;
  githubId?: unknown;
  githubLogin?: unknown;
  githubEmail?: unknown;
  accountCreatedAt?: unknown;
  email?: unknown;
  displayName?: unknown;
}

export async function getOrProvisionUser(token: ProvisionableToken): Promise<UserRow> {
  const provider = (token.provider as string) ?? "github";

  if (provider === "github") {
    const githubId = token.githubId as string | undefined;
    if (!githubId) throw new Error("Missing githubId on token");
    try {
      return await getUser(githubId);
    } catch {
      const upserted = await upsertUser({
        githubId,
        githubLogin: (token.githubLogin as string) ?? githubId,
        githubEmail: (token.githubEmail as string | null) ?? null,
        githubAccountCreatedAt: (token.accountCreatedAt as string | null) ?? null,
      });
      if (!upserted) throw new Error(`upsertUser returned null for github_id=${githubId}`);
      return await getUser(githubId);
    }
  }

  const email = token.email as string | undefined;
  if (!email) throw new Error(`Missing email on token for provider=${provider}`);
  try {
    return await getUserByEmail(provider, email);
  } catch {
    return await upsertEmailUser({
      email,
      provider: provider as "google" | "email",
      displayName: (token.displayName as string | null) ?? null,
    });
  }
}

export async function deductCredit(
  userId: string,
  projectId: string | null,
  credits = 1,
  fromTopup = false
) {
  await supabase.rpc("deduct_credit", {
    p_user_id: userId,
    p_project_id: projectId,
    p_credits: credits,
    p_from_topup: fromTopup,
  });
}

export async function setUserTier(userId: string, tier: string): Promise<void> {
  const { error } = await supabase.from("users").update({ tier }).eq("id", userId);
  if (error) throw error;
}

// ── AI conversation + message helpers ────────────────────────────────────────

export interface AIConversation {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIChatMessage {
  id: string;
  conversation_id: string | null;
  project_id: string | null;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  provider: string | null;
  credits_used: number | null;
  created_at: string;
}

export async function createAIConversation(
  projectId: string,
  userId: string,
  title: string
): Promise<AIConversation> {
  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ project_id: projectId, user_id: userId, title })
    .select()
    .single();
  if (error) throw error;
  return data as AIConversation;
}

export async function getAIConversations(
  projectId: string,
  userId: string
): Promise<AIConversation[]> {
  const { data } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(100);
  return (data ?? []) as AIConversation[];
}

export async function deleteAIConversation(id: string, userId: string): Promise<void> {
  await supabase.from("ai_conversations").delete().eq("id", id).eq("user_id", userId);
}

export async function saveAIMessage(msg: {
  conversationId: string;
  projectId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  provider?: string;
  creditsUsed?: number;
}): Promise<string> {
  const { data, error } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id: msg.conversationId,
      project_id: msg.projectId,
      user_id: msg.userId,
      role: msg.role,
      content: msg.content,
      provider: msg.provider ?? null,
      credits_used: msg.creditsUsed ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function getAIMessages(
  conversationId: string,
  limit = 50
): Promise<AIChatMessage[]> {
  const { data } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);
  return (data ?? []) as AIChatMessage[];
}

// ── Project helpers ───────────────────────────────────────────────────────────

export type ProjectRow = {
  id: string;
  user_id: string;
  schema_json: unknown | null;
  project_name: string | null;
  cf_deploy_url: string | null;
  git_url: string | null;
  git_subdir: string | null;
  git_provider: string | null;
  repo_owner: string | null;
  repo_name: string | null;
  repo_full_name: string | null;
  default_branch: string | null;
  vercel_token_enc: string | null;
  vercel_project_id: string | null;
};

export async function getProject(projectId: string, userId: string): Promise<ProjectRow | null> {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();
  return data as ProjectRow | null;
}

export async function getUserProjects(userId: string) {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as (ProjectRow & { created_at: string; updated_at: string })[];
}

export async function createProject(
  userId: string,
  name: string,
  schemaJson: Record<string, unknown>
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: userId, project_name: name, schema_json: schemaJson })
    .select("id")
    .single();
  if (error) throw new Error(`createProject failed: ${error.message}`);
  return data as { id: string };
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);
  if (error) throw new Error(`deleteProject failed: ${error.message}`);
}
