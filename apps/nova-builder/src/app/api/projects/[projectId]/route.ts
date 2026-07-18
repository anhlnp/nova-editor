// REST API for project load (GET) and save (PATCH).
// This is the crossing point between the Webstudio frontend (nanostores atoms)
// and the Nova backend (Supabase).
//
// GET  /api/projects/:projectId  → returns NovaProjectJson (deserialized on client)
// PATCH /api/projects/:projectId → stores schema_json (serialized WebstudioData)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { migrateToLatest } from "@/lib/migrate";
import { serializeWebstudioData } from "@/lib/schema";
import { deleteProject } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Lazy — avoids calling createClient at module-init time during `next build`
// when env vars are not injected (would throw "supabaseUrl is required").

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // `version` (migration 0020) may not be applied yet — degrade gracefully:
  // without the column, optimistic concurrency is off (version: null).
  type ProjectRow = {
    id: string;
    project_name: string | null;
    schema_json: unknown;
    updated_at: string;
    version?: number | null;
  };
  let project: ProjectRow | null = null;
  let versionSupported = true;
  {
    const result = await getSupabaseAdmin()
      .from("projects")
      .select("id, project_name, schema_json, updated_at, version")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();
    if (result.error && /version/i.test(result.error.message ?? "")) {
      versionSupported = false;
      const fallback = await getSupabaseAdmin()
        .from("projects")
        .select("id, project_name, schema_json, updated_at")
        .eq("id", projectId)
        .eq("user_id", userId)
        .single();
      project = fallback.data as ProjectRow | null;
    } else {
      project = result.data as ProjectRow | null;
    }
  }

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // migrateToLatest handles any schema version (1.0–4.0 Nova Element[] or 5.0 WebstudioData).
  let novaProject;
  try {
    novaProject = migrateToLatest(project.schema_json ?? null);
  } catch (err) {
    console.error("[api/projects] migration failed:", err);
    return NextResponse.json(
      { error: "Failed to parse project" },
      { status: 500 }
    );
  }

  // Return serialized form (Maps → arrays) so it round-trips through JSON.
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
    symbols: storedJson?.symbols ?? [],
    seoData: storedJson?.seoData ?? {},
    cookieConsent: storedJson?.cookieConsent ?? null,
    updatedAt: project.updated_at,
    // null = concurrency disabled (migration 0020 not applied yet)
    version: versionSupported ? ((project.version as number | null) ?? 0) : null,
  });
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { schema_json?: unknown; name?: string; seoData?: unknown; robotsTxt?: string; cookieConsent?: unknown; baseVersion?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name) updates["project_name"] = body.name;

  if (body.schema_json !== undefined) {
    updates["schema_json"] = body.schema_json;
  } else if (body.seoData !== undefined || body.robotsTxt !== undefined || body.cookieConsent !== undefined) {
    // Partial metadata update — merge into existing schema_json
    const { data: existing } = await getSupabaseAdmin()
      .from("projects").select("schema_json").eq("id", projectId).single();
    const current = (existing?.schema_json ?? {}) as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...current };
    if (body.seoData !== undefined) merged["seoData"] = body.seoData;
    if (body.robotsTxt !== undefined) merged["robotsTxt"] = body.robotsTxt;
    if (body.cookieConsent !== undefined) merged["cookieConsent"] = body.cookieConsent;
    updates["schema_json"] = merged;
  }

  // Full-document saves participate in optimistic concurrency (M2): when the
  // client sends its baseVersion, a stale tab gets 409 instead of clobbering.
  // Metadata-only merges don't bump version (patches never touch the envelope).
  const isFullDataSave =
    body.schema_json !== undefined && typeof body.baseVersion === "number";

  let query = getSupabaseAdmin()
    .from("projects")
    .update(
      isFullDataSave
        ? { ...updates, version: (body.baseVersion as number) + 1 }
        : updates
    )
    .eq("id", projectId)
    .eq("user_id", userId);
  if (isFullDataSave) {
    query = query.eq("version", body.baseVersion as number);
  }
  const { data: updatedRows, error } = await query.select("version");

  if (error && isFullDataSave && /version/i.test(error.message ?? "")) {
    // Migration 0020 not applied — degrade to the unguarded full save.
    const { error: fallbackError } = await getSupabaseAdmin()
      .from("projects")
      .update(updates)
      .eq("id", projectId)
      .eq("user_id", userId);
    if (fallbackError) {
      console.error("[api/projects] save failed:", fallbackError);
      return NextResponse.json({ error: "Save failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, version: null });
  }
  if (error) {
    console.error("[api/projects] save failed:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
  if (isFullDataSave && (!updatedRows || updatedRows.length === 0)) {
    return NextResponse.json({ error: "Version conflict" }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    version: isFullDataSave ? (body.baseVersion as number) + 1 : undefined,
  });
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteProject(userId, projectId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/projects] delete failed:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
