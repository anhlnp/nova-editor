// P41 — Custom-domain resolver.
// Middleware rewrites requests on foreign hosts here (?host=<domain>).
// Looks up a verified project_domains row and forwards to the project preview.
// Public by /preview prefix. Middleware stays DB-free; the lookup lives here.

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET(req: Request) {
  const url = new URL(req.url);
  const host = url.searchParams.get("host")?.toLowerCase().replace(/:\d+$/, "");
  if (!host) {
    return new Response("Domain not specified", { status: 400 });
  }

  const { data: row } = await getSupabaseAdmin()
    .from("project_domains")
    .select("project_id, status")
    .eq("domain", host)
    .in("status", ["verified", "ssl_active"])
    .single();

  if (!row) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family:system-ui;background:#0a0a14;color:#e2e8f0;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h1 style="font-size:18px">Domain not connected</h1><p style="font-size:13px;color:rgba(255,255,255,0.5)">${host} is not linked to a published Nova site.</p></div></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return NextResponse.redirect(new URL(`/preview/${row.project_id}`, url.origin));
}
