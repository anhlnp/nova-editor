// FA-v1 / R4 — email verification token lifecycle (server-only).
// Mirrors lib/passwordReset.ts: the raw token is emailed once and never stored;
// only its SHA-256 hash is persisted. Tokens are single-use, 24-hour expiry.
import { randomBytes, createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail, emailShell } from "@/lib/email";
import { getAppUrl } from "@/lib/appUrl";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

// Issues a verification token for a user and emails the link. Best-effort: any
// failure is logged, never thrown, so it can't block signup.
export async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const rawToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

    await supabase.from("email_verification_tokens").delete().eq("user_id", userId);
    const { error } = await supabase.from("email_verification_tokens").insert({
      token_hash: hashToken(rawToken),
      user_id: userId,
      expires_at: expiresAt,
    });
    if (error) return;

    const appUrl = getAppUrl();
    const link = `${appUrl}/verify-email?token=${rawToken}`;
    await sendEmail({
      to: email,
      subject: "Verify your Nova email",
      html: emailShell(
        "Confirm your email",
        "Welcome to Nova! Confirm your email address to secure your account. This link expires in 24 hours.",
        "Verify email",
        link
      ),
    });
  } catch (err) {
    console.error("[email-verification] send failed:", err);
  }
}

export type VerifyResult = "ok" | "invalid" | "expired";

// Consumes a token and marks the user's email verified. Single-use.
export async function verifyEmailToken(rawToken: string): Promise<VerifyResult> {
  const supabase = getSupabaseAdmin();
  const { data: row } = await supabase
    .from("email_verification_tokens")
    .select("token_hash, user_id, expires_at")
    .eq("token_hash", hashToken(rawToken))
    .maybeSingle();

  if (!row) return "invalid";
  const token = row as { token_hash: string; user_id: string; expires_at: string };

  if (new Date(token.expires_at).getTime() < Date.now()) {
    await supabase.from("email_verification_tokens").delete().eq("token_hash", token.token_hash);
    return "expired";
  }

  await supabase.from("users").update({ email_verified: true }).eq("id", token.user_id);
  await supabase.from("email_verification_tokens").delete().eq("user_id", token.user_id);
  return "ok";
}
