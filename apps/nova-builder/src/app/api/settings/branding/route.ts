// GET  /api/settings/branding — return current user's branding settings
// PATCH /api/settings/branding — update branding_logo and branding_name

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("branding_logo, branding_name")
    .eq("id", userId)
    .single();

  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });
  return NextResponse.json({
    logo: data?.branding_logo ?? null,
    name: data?.branding_name ?? null,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { logo?: string | null; name?: string | null };

  const { error } = await getSupabaseAdmin()
    .from("users")
    .update({
      branding_logo: body.logo ?? null,
      branding_name: body.name ?? null,
    })
    .eq("id", userId);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
