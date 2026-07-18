// P54 — Transfer a project into a team workspace (or back to personal: teamId=null).

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();

  // Must own the project.
  const { data: project } = await supabase
    .from("projects").select("id").eq("id", projectId).eq("user_id", userId).single();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json()) as { teamId: string | null };

  // If moving into a team, must be a member of that team.
  if (body.teamId) {
    const { data: membership } = await supabase
      .from("team_members").select("id").eq("team_id", body.teamId).eq("user_id", userId).single();
    if (!membership) return NextResponse.json({ error: "Not a member of that team" }, { status: 403 });
  }

  await supabase.from("projects").update({ team_id: body.teamId }).eq("id", projectId);
  return NextResponse.json({ ok: true, teamId: body.teamId });
}
