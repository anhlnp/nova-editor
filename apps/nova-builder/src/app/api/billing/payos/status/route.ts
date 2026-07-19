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

  const url = new URL(req.url);
  const orderCode = url.searchParams.get("orderCode");
  if (!orderCode) {
    return NextResponse.json({ error: "Missing orderCode" }, { status: 400 });
  }

  const queryPlan = url.searchParams.get("plan");
  const queryTeamId = url.searchParams.get("teamId") || "";

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("processed_payments")
    .select("order_code, user_id")
    .eq("order_code", orderCode)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data) {
    console.log(`[PayOS Status Check] orderCode ${orderCode} found in DB. Paid = true`);
    if (data.user_id && data.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ paid: true });
  }

  // Fallback: Check PayOS API directly if the webhook hasn't processed/arrived yet (crucial for localhost dev)
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  console.log(`[PayOS Status Check] orderCode ${orderCode} NOT found in DB. Checking PayOS API... Keys present:`, !!clientId, !!apiKey);
  
  if (clientId && apiKey) {
    try {
      const payosRes = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`, {
        headers: {
          "x-client-id": clientId,
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });
      console.log(`[PayOS Status Check] PayOS API HTTP Status:`, payosRes.status);
      if (payosRes.ok) {
        const json = await payosRes.json() as {
          code?: string;
          data?: {
            status?: string;
            items?: Array<{ name?: string }>;
          };
        };
        console.log(`[PayOS Status Check] PayOS API response code:`, json.code, `status:`, json.data?.status);
        console.log(`[PayOS Status Check] PayOS API full response data:`, JSON.stringify(json.data));
        
        if (json.code === "00" && json.data?.status === "PAID") {
          const items = json.data.items ?? [];
          const itemName = items[0]?.name ?? "";
          console.log(`[PayOS Status Check] Payment is PAID. Item name:`, itemName);
          
          let tag = "nova";
          let plan = queryPlan;
          let itemUserId = userId;
          let teamId = queryTeamId;

          if (itemName) {
            const parts = itemName.split(":");
            if (parts[0] === "nova" && parts[1]) {
              tag = parts[0];
              plan = parts[1];
              itemUserId = parts[2] || userId;
              teamId = parts[3] || queryTeamId;
            }
          }
          
          if (tag === "nova" && plan) {
            // Deduplicate/Idempotency: try to insert processed_payments record
            const { error: claimError } = await supabase.from("processed_payments").insert({
              order_code: String(orderCode),
              provider: "payos",
              kind: plan === "credits" ? "credits" : "plan",
              user_id: itemUserId || userId || null,
            });
            if (!claimError) {
              console.log(`[PayOS Status Check] Database claimed orderCode ${orderCode} successfully. Updating subscription...`);
              const CREDIT_PACK = 500;
              if (plan === "credits" && (itemUserId || userId)) {
                const targetUid = itemUserId || userId;
                const { data: userRow } = await supabase.from("users").select("credits_remaining").eq("id", targetUid).single();
                await supabase.from("users").update({ credits_remaining: (userRow?.credits_remaining ?? 0) + CREDIT_PACK }).eq("id", targetUid);
                console.log(`[PayOS Status Check] Updated user ${targetUid} credits +${CREDIT_PACK}`);
              } else if (teamId) {
                await supabase.from("teams").update({ plan: plan === "team" ? "team" : plan === "max" ? "max" : "pro" }).eq("id", teamId);
                console.log(`[PayOS Status Check] Updated team ${teamId} plan to ${plan}`);
              } else if (itemUserId || userId) {
                const targetUid = itemUserId || userId;
                await supabase.from("users").update({ tier: plan === "team" ? "team" : plan === "max" ? "max" : "pro" }).eq("id", targetUid);
                console.log(`[PayOS Status Check] Updated user ${targetUid} tier to ${plan}`);
              }
              return NextResponse.json({ paid: true });
            } else {
              console.error(`[PayOS Status Check] Claim database insert failed:`, claimError);
              if (claimError.code === "23505") {
                // Already claimed by another concurrent request / webhook
                return NextResponse.json({ paid: true });
              }
            }
          } else {
            console.warn(`[PayOS Status Check] Invalid item tag or plan:`, tag, plan);
          }
        }
      } else {
        const errorText = await payosRes.text();
        console.error(`[PayOS Status Check] PayOS API error response:`, errorText);
      }
    } catch (payosErr) {
      console.error("[PayOS Direct Status Check Error]:", payosErr);
    }
  }

  return NextResponse.json({ paid: false });
}
