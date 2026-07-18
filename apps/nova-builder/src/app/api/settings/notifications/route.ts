// GET/PATCH /api/settings/notifications — user notification preferences.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await getSupabaseAdmin()
    .from("users").select("notification_prefs").eq("id", userId).single();

  return NextResponse.json(data?.notification_prefs ?? {});
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prefs = await req.json();
  await getSupabaseAdmin().from("users").update({ notification_prefs: prefs }).eq("id", userId);

  return NextResponse.json({ ok: true });
}
