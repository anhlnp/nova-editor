// Public read-only endpoint for the preview page.
// No auth check — project IDs are UUIDs (unguessable) so this is safe for MVP.
// Returns the same shape as GET /api/projects/[projectId] but accessible without session.

import { NextResponse } from "next/server";
import { migrateToLatest } from "@/lib/migrate";
import { serializeWebstudioData } from "@/lib/schema";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const { data: project, error } = await getSupabaseAdmin()
    .from("projects")
    .select("id, project_name, schema_json, updated_at")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let novaProject;
  try {
    novaProject = migrateToLatest(project.schema_json ?? null);
  } catch (err) {
    console.error("[api/preview] migration failed:", err);
    return NextResponse.json({ error: "Failed to parse project" }, { status: 500 });
  }

  const serialized = serializeWebstudioData(novaProject.data);
  const storedJson = project.schema_json as Record<string, unknown> | null;
  return NextResponse.json({
    id: project.id,
    name: project.project_name ?? novaProject.meta.name,
    schemaVersion: "5.0",
    data: serialized,
    cssVars: storedJson?.cssVars ?? {},
    interactions: storedJson?.interactions ?? {},
    customCss: storedJson?.customCss ?? "",
    cookieConsent: storedJson?.cookieConsent ?? null,
    updatedAt: project.updated_at,
  });
}
