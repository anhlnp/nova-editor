// GET /api/analytics/:projectId — returns page-view stats for the owner.
// Query params: ?days=7 (default) or ?days=30

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: project } = await getSupabaseAdmin()
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(req.url);
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") ?? "30", 10)));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: rows } = await getSupabaseAdmin()
    .from("page_views")
    .select("path, device_type, referrer, created_at")
    .eq("project_id", projectId)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  const views = rows ?? [];
  const totalViews = views.length;

  // Views by day — count per YYYY-MM-DD
  const byDay: Record<string, number> = {};
  for (const v of views) {
    const day = (v.created_at as string).slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }

  // Fill empty days to make a contiguous series
  const daySeries: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    daySeries.push({ date: key, count: byDay[key] ?? 0 });
  }

  // Top paths
  const pathCount: Record<string, number> = {};
  for (const v of views) {
    const p = (v.path as string) || "/";
    pathCount[p] = (pathCount[p] ?? 0) + 1;
  }
  const topPages = Object.entries(pathCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  // Device breakdown
  const deviceCount: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };
  for (const v of views) {
    const d = (v.device_type as string) || "desktop";
    deviceCount[d] = (deviceCount[d] ?? 0) + 1;
  }

  // Top referrers
  const refCount: Record<string, number> = {};
  for (const v of views) {
    const ref = v.referrer as string | null;
    if (!ref) continue;
    let host = ref;
    try { host = new URL(ref).hostname; } catch { /* keep raw */ }
    refCount[host] = (refCount[host] ?? 0) + 1;
  }
  const topReferrers = Object.entries(refCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([referrer, count]) => ({ referrer, count }));

  return NextResponse.json({
    totalViews,
    days,
    daySeries,
    topPages,
    devices: deviceCount,
    topReferrers,
  });
}
