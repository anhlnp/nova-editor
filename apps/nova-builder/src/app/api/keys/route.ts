// GET  /api/keys — list API keys for authenticated user (prefixes only, never full key)
// POST /api/keys — create a new API key; returns the full key ONCE

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("api_keys")
    .select("id, name, key_prefix, created_at, last_used_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });
  return NextResponse.json({ keys: data ?? [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = (await req.json()) as { name?: string };
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  // Generate a random 32-byte key with a "nova_" prefix
  const rawKey = `nova_${randomBytes(24).toString("hex")}`;
  const keyPrefix = rawKey.slice(0, 13); // "nova_" + first 8 hex chars
  const keyHash = await bcrypt.hash(rawKey, 10);

  const { data, error } = await getSupabaseAdmin()
    .from("api_keys")
    .insert({ user_id: userId, name: name.trim(), key_prefix: keyPrefix, key_hash: keyHash })
    .select("id, name, key_prefix, created_at")
    .single();

  if (error) return NextResponse.json({ error: "Create failed" }, { status: 500 });
  // Return the full key ONCE — never stored in plaintext
  return NextResponse.json({ key: data, fullKey: rawKey }, { status: 201 });
}
