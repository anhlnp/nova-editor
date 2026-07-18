import { getSupabaseAdmin } from "@/lib/supabaseAdmin";


export async function logActivity(
  projectId: string,
  userId: string,
  action: string,
  meta?: Record<string, unknown>
) {
  return getSupabaseAdmin().from("project_activity").insert({
    project_id: projectId,
    user_id: userId,
    action,
    meta: meta ?? null,
  });
}
