// POST /api/auth/forgot-password — public. Body: { email }
// Always responds { ok: true } regardless of whether the account exists
// (no account enumeration). When an email+password account matches, a
// single-use reset link is emailed. Rate-limited to blunt abuse.

import { NextResponse } from "next/server";
import { issuePasswordResetToken } from "@/lib/passwordReset";
import { sendEmail, emailShell } from "@/lib/email";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { getAppUrl } from "@/lib/appUrl";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "forgot-password"), 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  let email = "";
  try {
    const body = (await req.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  try {
    const rawToken = await issuePasswordResetToken(email);
    if (rawToken) {
      const appUrl = getAppUrl(req);
      const link = `${appUrl}/reset-password?token=${rawToken}`;
      await sendEmail({
        to: email,
        subject: "Reset your Nova password",
        html: emailShell(
          "Reset your password",
          "We received a request to reset your Nova password. This link expires in 1 hour. If you didn't request it, you can safely ignore this email.",
          "Reset password",
          link
        ),
      });
    }
  } catch (err) {
    // Never leak existence (or infra state) via the response — log and succeed.
    console.error("[forgot-password] issue/send failed:", err);
  }

  // Identical response whether or not the account exists.
  return NextResponse.json({ ok: true });
}
