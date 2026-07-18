// POST: create a new email+password account.
// Validates input, hashes the password, inserts into users, grants initial credits.
// Called from the /signup page before auto-signing-in via CredentialsProvider.
import bcrypt from "bcryptjs";
import { createEmailUser } from "@/lib/supabase-server";
import { sendVerificationEmail } from "@/lib/emailVerification";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown; name?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() || null : null;

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "A valid email address is required." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await createEmailUser({ email, passwordHash, displayName: name });
    // Soft email verification: fire-and-forget, never blocks signup.
    await sendVerificationEmail(user.id, email);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505")) {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return Response.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
