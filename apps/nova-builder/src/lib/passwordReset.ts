// FA-005 — password reset token lifecycle (server-only).
// The raw token is returned once (to be emailed) and never stored; only its
// SHA-256 hash is persisted, so the DB alone cannot reset an account.
import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

// Issues a reset token for the email+password account with this address.
// Returns the raw token to email, or null if no such account exists (the caller
// must respond identically either way to avoid account enumeration).
export async function issuePasswordResetToken(email: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("provider", "email")
    .eq("email", email)
    .maybeSingle();

  if (!user) return null;

  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  // One active token per request; older tokens for the user are cleared so a
  // new request invalidates any previous link.
  await supabase.from("password_reset_tokens").delete().eq("user_id", (user as { id: string }).id);
  const { error } = await supabase.from("password_reset_tokens").insert({
    token_hash: hashToken(rawToken),
    user_id: (user as { id: string }).id,
    expires_at: expiresAt,
  });
  if (error) return null;

  return rawToken;
}

export type ResetResult = "ok" | "invalid" | "expired";

// Consumes a reset token and sets the new password. Single-use: the token row
// is deleted on success.
export async function resetPasswordWithToken(rawToken: string, newPassword: string): Promise<ResetResult> {
  const supabase = getSupabaseAdmin();
  const { data: row } = await supabase
    .from("password_reset_tokens")
    .select("token_hash, user_id, expires_at")
    .eq("token_hash", hashToken(rawToken))
    .maybeSingle();

  if (!row) return "invalid";
  const token = row as { token_hash: string; user_id: string; expires_at: string };

  if (new Date(token.expires_at).getTime() < Date.now()) {
    await supabase.from("password_reset_tokens").delete().eq("token_hash", token.token_hash);
    return "expired";
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await supabase.from("users").update({ password_hash: passwordHash }).eq("id", token.user_id);
  await supabase.from("password_reset_tokens").delete().eq("user_id", token.user_id);

  return "ok";
}
