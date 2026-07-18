// GET /api/projects/:projectId/sitemap — auto-generates sitemap.xml from project pages.
// Public — no auth required.

import { migrateToLatest } from "@/lib/migrate";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const { data: project } = await getSupabaseAdmin()
    .from("projects")
    .select("id, schema_json, updated_at")
    .eq("id", projectId)
    .single();

  if (!project) {
    return new Response("<?xml version='1.0'?><urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'/>", {
      headers: { "Content-Type": "application/xml" },
    });
  }

  const baseUrl = new URL(req.url).origin;
  let pages: Array<{ path?: string; name?: string }> = [];

  try {
    const nova = migrateToLatest(project.schema_json ?? null);
    pages = [...nova.data.pages.pages.values()].map((p) => ({
      path: (p as { path?: string }).path ?? "/",
      name: (p as { name?: string }).name ?? "Page",
    }));
  } catch {
    pages = [{ path: "/", name: "Home" }];
  }

  const seoData = (project.schema_json as Record<string, unknown> | null)?.seoData as Record<string, { noIndex?: boolean }> | undefined;
  const lastMod = project.updated_at
    ? new Date(project.updated_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const urls = pages
    .filter((p) => {
      const pageSeo = seoData?.[p.path ?? "/"];
      return !pageSeo?.noIndex;
    })
    .map((p) => {
      const loc = `${baseUrl}/preview/${projectId}${p.path === "/" ? "" : p.path ?? ""}`;
      return `  <url><loc>${loc}</loc><lastmod>${lastMod}</lastmod><changefreq>weekly</changefreq></url>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
