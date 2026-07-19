import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = user.id;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("processed_payments")
    .select("order_code, provider, kind, amount, plan, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[PayOS Billing History Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ history: data || [] });
}
