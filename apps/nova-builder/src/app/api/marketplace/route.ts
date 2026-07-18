// M11 — Community marketplace.
//   GET  → browse published items (public, newest first, optional ?category=)
//   POST → publish a NovaBundle as a marketplace item (auth required)
//
// Bundles are stored as JSONB. Publishing is scoped to the authenticated user as
// author. Browsing is public so the marketplace can be shown before install.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  let query = getSupabaseAdmin()
    .from("marketplace_items")
    .select("id, author_id, name, description, icon, category, install_count, created_at")
    .order("created_at", { ascending: false })
    .limit(60);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let items = data ?? [];
  if (q) {
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description ?? "").toLowerCase().includes(q)
    );
  }
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    name?: string;
    description?: string;
    icon?: string;
    category?: string;
    bundle?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!body.bundle || typeof body.bundle !== "object") {
    return NextResponse.json({ error: "bundle is required" }, { status: 400 });
  }

  const category = ["section", "page", "component", "template"].includes(body.category ?? "")
    ? body.category
    : "section";

  const { data, error } = await getSupabaseAdmin()
    .from("marketplace_items")
    .insert({
      author_id: userId,
      name,
      description: body.description?.trim() ?? "",
      icon: body.icon ?? "📦",
      category,
      bundle: body.bundle,
    })
    .select("id, name, category")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
