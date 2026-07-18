// GET /api/export/[projectId]/react — download project as a React (.tsx) component.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { migrateToLatest } from "@/lib/migrate";
import { exportToReact } from "@/lib/reactExporter";
import { getExportMetas } from "@/lib/publish/metas";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getUserEntitlements } from "@/lib/userTier";


export async function GET(
  _req: Request,
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

  const title = String(row.project_name || novaProject.meta.name || "Page");
  const safeName = title.replace(/[^a-zA-Z0-9]/g, "-");
  const tsx = exportToReact(novaProject.data, title, getExportMetas());

  return new Response(tsx, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}.tsx"`,
    },
  });
}
