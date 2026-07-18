// POST /api/auth/reset-password — public. Body: { token, password }
// Validates a single-use reset token and sets the new password.

import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/passwordReset";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "reset-password"), 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  let token = "";
  let password = "";
  try {
    const body = (await req.json()) as { token?: unknown; password?: unknown };
    token = typeof body.token === "string" ? body.token : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!token) return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const result = await resetPasswordWithToken(token, password);
  if (result === "ok") return NextResponse.json({ ok: true });
  if (result === "expired") {
    return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
  }
  return NextResponse.json({ error: "This reset link is invalid. Please request a new one." }, { status: 400 });
}
