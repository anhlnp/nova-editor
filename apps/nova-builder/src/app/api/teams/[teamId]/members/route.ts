// P54/P69 — Team member management.
//   GET    → list members
//   POST   → invite a member by email (seat-gated: P69)
//   DELETE → remove a member

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, emailShell } from "@/lib/email";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAppUrl } from "@/lib/appUrl";


// Returns the caller's role in the team, or null if not a member.
async function teamRole(teamId: string, userId: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .from("team_members").select("role").eq("team_id", teamId).eq("user_id", userId).single();
  return data?.role ?? null;
}

async function callerId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;
  const userId = await callerId();
  if (!userId || !(await teamRole(teamId, userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { data } = await getSupabaseAdmin()
    .from("team_members").select("id, email, role, status, invited_at").eq("team_id", teamId).order("invited_at");
  return NextResponse.json({ members: data ?? [] });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;
  const userId = await callerId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await teamRole(teamId, userId);
  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ error: "Only owners/admins can invite" }, { status: 403 });
  }

  const body = (await req.json()) as { email?: string; role?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Seat gate (P69) — cannot invite beyond purchased seats.
  const { data: team } = await supabase.from("teams").select("seats").eq("id", teamId).single();
  const { count } = await supabase
    .from("team_members").select("id", { count: "exact", head: true }).eq("team_id", teamId);
  const seats = team?.seats ?? 1;
  if ((count ?? 0) >= seats) {
    return NextResponse.json({ error: `Seat limit reached (${seats}). Upgrade to add more members.`, seatLimit: true }, { status: 402 });
  }

  // Link to an existing user if one has this email.
  const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single();

  const { data, error } = await supabase.from("team_members").insert({
    team_id: teamId, email, user_id: existingUser?.id ?? null,
    role: body.role === "admin" ? "admin" : "member",
    status: existingUser ? "active" : "invited",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Invite email — fire-and-forget (no-op when RESEND_API_KEY unset).
  const { data: teamRow } = await supabase.from("teams").select("name").eq("id", teamId).single();
  const teamName = teamRow?.name ?? "a Nova team";
  const appUrl = getAppUrl(req);
  sendEmail({
    to: email,
    subject: `You've been invited to ${teamName} on Nova`,
    html: emailShell(
      `Join ${teamName}`,
      `You've been invited to collaborate on <strong>${teamName}</strong>. ${existingUser ? "Open your team settings to get started." : "Create a free account with this email address to accept the invitation."}`,
      existingUser ? "Open team settings" : "Sign up free",
      existingUser ? `${appUrl}/settings/teams` : `${appUrl}/signup`
    ),
  }).catch(() => { /* non-fatal */ });

  return NextResponse.json({ member: data });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await context.params;
  const userId = await callerId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await teamRole(teamId, userId);
  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { memberId: string };
  if (!body.memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

  // Never remove the owner row.
  const { data: member } = await getSupabaseAdmin()
    .from("team_members").select("role").eq("id", body.memberId).eq("team_id", teamId).single();
  if (member?.role === "owner") {
    return NextResponse.json({ error: "Cannot remove the team owner" }, { status: 400 });
  }

  await getSupabaseAdmin().from("team_members").delete().eq("id", body.memberId).eq("team_id", teamId);
  return NextResponse.json({ ok: true });
}
