// POST /api/analytics/track — public endpoint, no auth required.
// Called from the preview page on every visitor load.
// Body: { projectId: string; path?: string; referrer?: string }

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { rateLimit, clientKey } from "@/lib/rateLimit";


function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  const lc = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(lc)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(lc)) return "mobile";
  return "desktop";
}

export async function POST(req: Request) {
  // FA-011: public beacon — cap per client to prevent page_views pollution.
  const limit = rateLimit(clientKey(req, "analytics"), 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  const body = (await req.json()) as { projectId?: string; path?: string; referrer?: string };
  if (!body.projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const ua = req.headers.get("user-agent") ?? "";
  const cfCountry = req.headers.get("cf-ipcountry") ?? null;
  const deviceType = detectDevice(ua);

  // Verify the project exists (prevents pollution of analytics for fake IDs)
  const { data: project } = await getSupabaseAdmin()
    .from("projects")
    .select("id")
    .eq("id", body.projectId)
    .single();

  if (!project) return NextResponse.json({ ok: false }, { status: 404 });

  await getSupabaseAdmin().from("page_views").insert({
    project_id: body.projectId,
    path: body.path ?? "/",
    referrer: body.referrer ?? null,
    device_type: deviceType,
    country: cfCountry,
  });

  return NextResponse.json({ ok: true });
}
