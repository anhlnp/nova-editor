import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
// GET /api/projects/:projectId/robots — serves robots.txt for the project.
// Content is stored in seoData.robotsTxt; defaults to permissive.



export async function GET(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const { data: project } = await getSupabaseAdmin()
    .from("projects")
    .select("schema_json")
    .eq("id", projectId)
    .single();

  const seoData = (project?.schema_json as Record<string, unknown> | null)?.seoData as
    | { robotsTxt?: string }
    | undefined;

  const baseUrl = new URL(req.url).origin;
  const sitemapUrl = `${baseUrl}/api/projects/${projectId}/sitemap`;
  const robotsTxt = seoData?.robotsTxt ??
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;

  return new Response(robotsTxt, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
