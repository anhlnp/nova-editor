// P54 — Team workspaces.
//   GET  → teams the current user owns or is a member of
//   POST → create a team (owner = current user; owner row added to team_members)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


async function currentUser() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string; email?: string } | undefined) ?? null;
}

export async function GET() {
  const user = await currentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  // Teams where the user is a member (includes owner rows)
  const { data: memberships } = await supabase
    .from("team_members").select("team_id, role, status").eq("user_id", user.id);

  const teamIds = (memberships ?? []).map((m) => m.team_id);
  if (teamIds.length === 0) return NextResponse.json({ teams: [] });

  const { data: teams } = await supabase
    .from("teams").select("id, name, owner_id, plan, seats, created_at").in("id", teamIds);

  const roleByTeam = new Map((memberships ?? []).map((m) => [m.team_id, m.role]));
  return NextResponse.json({
    teams: (teams ?? []).map((t) => ({ ...t, myRole: roleByTeam.get(t.id) ?? "member" })),
  });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { name?: string };
  if (!body.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: team, error } = await supabase
    .from("teams").insert({ name: body.name.trim(), owner_id: user.id }).select().single();

  if (error || !team) return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 400 });

  await supabase.from("team_members").insert({
    team_id: team.id, user_id: user.id, email: user.email ?? "", role: "owner", status: "active",
  });

  return NextResponse.json({ team });
}
