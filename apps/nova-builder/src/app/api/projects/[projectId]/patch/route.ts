// POST /api/projects/:projectId/patch — apply immerhin transaction patches to
// the stored document under optimistic concurrency (Tier P M2, ADR-NB-019 p2).
//
// Body: { baseVersion: number, transactions: { transactionId, changes: { namespace, patches }[] }[] }
// - 409 when baseVersion no longer matches the row's version (another tab won);
//   the response carries the current server version.
// - On success the row's version becomes baseVersion + 1 and is returned.
//
// Nova adaptation of reference/webstudio rest.data.$projectId + sync/patch/*:
// same contract (patches + version), Supabase JSONB instead of Prisma tables.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { enableMapSet, enablePatches, applyPatches, type Patch } from "immer";
import { authOptions } from "@/lib/auth";
import { migrateToLatest } from "@/lib/migrate";
import { serializeWebstudioData, type WebstudioData } from "@/lib/schema";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

enableMapSet();
enablePatches();

type ChangePayload = { namespace: string; patches: Patch[] };
type TransactionPayload = { transactionId: string; changes: ChangePayload[] };

const DATA_NAMESPACES = new Set<keyof WebstudioData>([
  "pages",
  "instances",
  "props",
  "breakpoints",
  "styleSourceSelections",
  "styleSources",
  "styles",
  "dataSources",
  "resources",
  "assets",
]);

export async function POST(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { baseVersion?: unknown; transactions?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const baseVersion = body.baseVersion;
  const transactions = body.transactions;
  if (typeof baseVersion !== "number" || !Array.isArray(transactions)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // `version` (migration 0020) may not be applied yet — degrade to
  // unguarded patch application (same safety as the pre-M2 full save).
  type ProjectRow = { id: string; schema_json: unknown; version?: number | null };
  let versionSupported = true;
  let project: ProjectRow | null = null;
  {
    const result = await getSupabaseAdmin()
      .from("projects")
      .select("id, schema_json, version")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();
    if (result.error && /version/i.test(result.error.message ?? "")) {
      versionSupported = false;
      console.warn("[api/projects/patch] version column missing — concurrency guard disabled (apply migration 0020)");
      const fallback = await getSupabaseAdmin()
        .from("projects")
        .select("id, schema_json")
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

  const currentVersion = (project.version as number | null) ?? 0;
  if (versionSupported && currentVersion !== baseVersion) {
    return NextResponse.json(
      { error: "Version conflict", version: currentVersion },
      { status: 409 }
    );
  }

  // Deserialize (migrating legacy docs up if needed), apply patches per
  // namespace, re-serialize. enableMapSet lets applyPatches address Map keys.
  let data: WebstudioData;
  try {
    data = migrateToLatest(project.schema_json ?? null).data;
  } catch (err) {
    console.error("[api/projects/patch] migration failed:", err);
    return NextResponse.json({ error: "Failed to parse project" }, { status: 500 });
  }

  try {
    for (const transaction of transactions as TransactionPayload[]) {
      for (const change of transaction.changes ?? []) {
        const namespace = change.namespace as keyof WebstudioData;
        if (!DATA_NAMESPACES.has(namespace)) continue;
        if (!Array.isArray(change.patches) || change.patches.length === 0) continue;
        (data[namespace] as unknown) = applyPatches(
          data[namespace] as object,
          change.patches
        );
      }
    }
  } catch (err) {
    console.error("[api/projects/patch] applyPatches failed:", err);
    return NextResponse.json({ error: "Invalid patches" }, { status: 400 });
  }

  const stored = (project.schema_json ?? {}) as Record<string, unknown>;
  const nextSchemaJson = {
    ...stored,
    schemaVersion: "5.0",
    data: serializeWebstudioData(data),
  };
  const nextVersion = baseVersion + 1;

  if (!versionSupported) {
    const { error: updateError } = await getSupabaseAdmin()
      .from("projects")
      .update({ schema_json: nextSchemaJson, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", userId);
    if (updateError) {
      console.error("[api/projects/patch] update failed:", updateError);
      return NextResponse.json({ error: "Save failed" }, { status: 500 });
    }
    return NextResponse.json({ version: baseVersion });
  }

  const { data: updated, error: updateError } = await getSupabaseAdmin()
    .from("projects")
    .update({
      schema_json: nextSchemaJson,
      version: nextVersion,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("user_id", userId)
    // second guard — if a concurrent writer bumped version between our read
    // and this update, zero rows match and we report the conflict.
    .eq("version", baseVersion)
    .select("version");

  if (updateError) {
    console.error("[api/projects/patch] update failed:", updateError);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
  if (!updated || updated.length === 0) {
    return NextResponse.json({ error: "Version conflict" }, { status: 409 });
  }

  return NextResponse.json({ version: nextVersion });
}
