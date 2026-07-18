// GET /api/export/[projectId] — download project as a self-contained HTML file.
// Fetches from Supabase, migrates to latest schema, runs htmlExporter, returns attachment.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { migrateToLatest } from "@/lib/migrate";
import { exportToHtml, exportAllPages } from "@/lib/htmlExporter";
import type { ExportInteraction, ExportCookieConsent } from "@/lib/htmlExporter";
import { getExportMetas } from "@/lib/publish/metas";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserEntitlements } from "@/lib/userTier";
import { getAppUrl } from "@/lib/appUrl";


export async function GET(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FA-002: code export is a paid feature.
  if (!(await getUserEntitlements(userId)).codeExport) {
    return NextResponse.json(
      { error: "Code export is available on Pro and above. Upgrade to download your site's code.", upgrade: true },
      { status: 402 }
    );
  }

  const { data: row, error } = await getSupabaseAdmin()
    .from("projects")
    .select("project_name, schema_json")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error || !row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let novaProject;
  try {
    novaProject = migrateToLatest(row.schema_json ?? null);
  } catch {
    return NextResponse.json({ error: "Failed to parse project" }, { status: 500 });
  }

  const title = String(row.project_name || novaProject.meta.name || "Site");
  const safeName = title.replace(/[^a-zA-Z0-9]/g, "-");

  // Published-site wiring (R5): custom CSS, interactions, cookie banner, and
  // live form capture all travel with the export.
  const stored = (row.schema_json ?? {}) as Record<string, unknown>;
  const sharedOpts = {
    customCss: (stored.customCss as string) ?? "",
    interactions: (stored.interactions as Record<string, ExportInteraction[]>) ?? {},
    cookieConsent: (stored.cookieConsent as ExportCookieConsent | null) ?? null,
    projectId,
    apiBaseUrl: getAppUrl(req),
    // M9: full-fidelity CSS needs component preset styles (media/state/cascade).
    metas: getExportMetas(),
  };

  // M9 multi-page: ?format=pages returns every page as JSON { pages: [{path, filename, html}] }.
  if (new URL(req.url).searchParams.get("format") === "pages") {
    const pages = exportAllPages(novaProject.data, sharedOpts);
    return NextResponse.json({ pages });
  }

  const html = exportToHtml(novaProject.data, { title, ...sharedOpts });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.html"`,
    },
  });
}
