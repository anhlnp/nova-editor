import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// POST /api/projects/[projectId]/clone
// Deep-copies the project's schema_json into a new project row owned by the same user.
// Idempotent-safe: creates a new row on every call (no upsert). Returns { id, name }.

export async function POST(
  _req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();

  const { data: source, error } = await supabase
    .from("projects")
    .select("project_name, schema_json")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error || !source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const clonedName = `${source.project_name ?? "Untitled"} (copy)`;

  const { data: newProject, error: insertError } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      project_name: clonedName,
      schema_json: source.schema_json,
    })
    .select("id, project_name")
    .single();

  if (insertError || !newProject) {
    return NextResponse.json({ error: "Clone failed" }, { status: 500 });
  }

  return NextResponse.json({ id: newProject.id, name: newProject.project_name });
}
