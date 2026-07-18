// Single source of truth for project-ownership verification.
// Every mutating or reading `[projectId]` route that is scoped to the owner
// calls ownsProject() instead of hand-rolling `.eq("user_id")` — so the
// ownership contract lives in one place (ADR-NB-015).
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function ownsProject(projectId: string, userId: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();
  return Boolean(data);
}
