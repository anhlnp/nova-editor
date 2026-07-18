// P41 — Custom domains for a project.
//   GET    → list domains
//   POST   → add a domain (generates a CNAME verification token)
//   PATCH  → verify a domain (DNS TXT lookup for the token)
//   DELETE → remove a domain
//
// SSL provisioning is handled by the edge/CDN layer once a domain reaches
// "verified"; this route records status transitions. It does not itself issue
// certificates — that is an infrastructure concern outside the app process.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomBytes } from "crypto";
import { promises as dns } from "dns";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


async function requireOwner(projectId: string): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  const { data } = await getSupabaseAdmin()
    .from("projects").select("id").eq("id", projectId).eq("user_id", userId).single();
  return data ? userId : null;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  if (!(await requireOwner(projectId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data } = await getSupabaseAdmin()
    .from("project_domains").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
  return NextResponse.json({ domains: data ?? [] });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const userId = await requireOwner(projectId);
  if (!userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as { domain?: string };
  const domain = body.domain?.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const verifyToken = `nova-verify-${randomBytes(12).toString("hex")}`;
  const { data, error } = await getSupabaseAdmin()
    .from("project_domains")
    .insert({ project_id: projectId, user_id: userId, domain, verify_token: verifyToken, status: "pending" })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ domain: data });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  if (!(await requireOwner(projectId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as { id: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data: row } = await getSupabaseAdmin()
    .from("project_domains").select("domain, verify_token").eq("id", body.id).eq("project_id", projectId).single();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify by looking up a TXT record matching the token.
  let verified = false;
  try {
    const records = await dns.resolveTxt(`_nova-verify.${row.domain}`);
    verified = records.flat().some((r) => r.includes(row.verify_token));
  } catch {
    verified = false;
  }

  const status = verified ? "verified" : "error";
  const sslStatus = verified ? "provisioning" : "none";
  await getSupabaseAdmin()
    .from("project_domains")
    .update({ status, ssl_status: sslStatus, verified_at: verified ? new Date().toISOString() : null })
    .eq("id", body.id);

  return NextResponse.json({ verified, status });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  if (!(await requireOwner(projectId))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as { id: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await getSupabaseAdmin().from("project_domains").delete().eq("id", body.id).eq("project_id", projectId);
  return NextResponse.json({ ok: true });
}
