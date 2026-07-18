// POST /api/auth/verify-email — public. Body: { token }
// Marks the user's email verified. Rate-limited.

import { NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/emailVerification";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "verify-email"), 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  let token = "";
  try {
    const body = (await req.json()) as { token?: unknown };
    token = typeof body.token === "string" ? body.token : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const result = await verifyEmailToken(token);
  if (result === "ok") return NextResponse.json({ ok: true });
  if (result === "expired") {
    return NextResponse.json({ error: "This link has expired. Please request a new one." }, { status: 400 });
  }
  return NextResponse.json({ error: "This link is invalid." }, { status: 400 });
}
