import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/projects/[projectId]/redirects
// Returns the Cloudflare _redirects file content generated from all pages'
// meta.redirects arrays. Called at publish time to write the _redirects file
// into the static export bundle.
//
// Cloudflare _redirects syntax: /from /to <status>
// https://developers.cloudflare.com/pages/configuration/redirects/

export async function GET(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const { data: project, error } = await supabase
    .from("projects")
    .select("owner_id, data")
    .eq("id", projectId)
    .single();

  if (error || !project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.owner_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const wsData = project.data as { pages?: { pages?: Record<string, unknown> } } | null;
  const pagesMap = wsData?.pages?.pages ?? {};

  const lines: string[] = ["# Nova Builder — auto-generated _redirects"];

  for (const page of Object.values(pagesMap)) {
    const p = page as { meta?: { redirects?: string } };
    if (!p.meta?.redirects) continue;
    try {
      const redirects = JSON.parse(p.meta.redirects) as Array<{
        from: string;
        to: string;
        permanent: boolean;
      }>;
      for (const r of redirects) {
        if (!r.from || !r.to) continue;
        const status = r.permanent ? "301" : "302";
        lines.push(`${r.from} ${r.to} ${status}`);
      }
    } catch { /* malformed json */ }
  }

  const body = lines.join("\n") + "\n";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="_redirects"`,
      "cache-control": "no-store",
    },
  });
}
