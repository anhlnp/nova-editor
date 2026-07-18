// M11 — Fetch + install a marketplace item.
//   GET    → return the full item incl. its NovaBundle, and increment install_count
//   DELETE → remove an item (author only)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  _req: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await context.params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("marketplace_items")
    .select("id, name, description, icon, category, bundle, install_count")
    .eq("id", itemId)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Best-effort install-count increment (non-fatal).
  await supabase
    .from("marketplace_items")
    .update({ install_count: (data.install_count ?? 0) + 1 })
    .eq("id", itemId);

  return NextResponse.json({ item: data });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await getSupabaseAdmin()
    .from("marketplace_items")
    .delete()
    .eq("id", itemId)
    .eq("author_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
