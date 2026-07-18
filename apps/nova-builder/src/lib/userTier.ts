// Loads a user's subscription tier for server-side entitlement checks.
// Entitlement decisions themselves live in tiers.ts (entitlements()); this only
// resolves the tier string. Defaults to "free" when the row/column is missing.
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { entitlements, type TierEntitlements } from "@/lib/tiers";

export async function getUserTier(userId: string): Promise<string> {
  const { data } = await getSupabaseAdmin()
    .from("users")
    .select("tier")
    .eq("id", userId)
    .single();
  return (data?.tier as string) ?? "free";
}

export async function getUserEntitlements(userId: string): Promise<TierEntitlements> {
  return entitlements(await getUserTier(userId));
}
