import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Simple dotenv parser
function parseDotenv(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    let key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function main() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("No .env.local found at " + envPath);
    return;
  }
  const env = parseDotenv(envPath);
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  console.log("=== LATEST 5 USERS ===");
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id, email, display_name, tier, credits_remaining, provider, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (userError) {
    console.error("Error fetching users:", userError.message);
  } else {
    console.log(users);
  }

  console.log("\n=== LATEST 5 PROCESSED PAYMENTS ===");
  const { data: payments, error: paymentError } = await supabase
    .from("processed_payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (paymentError) {
    console.error("Error fetching processed_payments:", paymentError.message);
  } else {
    console.log(payments);
  }

  console.log("\n=== TESTING PAYOS KEYS ===");
  const clientId = env.PAYOS_CLIENT_ID;
  const apiKey = env.PAYOS_API_KEY;
  console.log("PAYOS_CLIENT_ID:", clientId);
  console.log("PAYOS_API_KEY length:", apiKey ? apiKey.length : 0);
  
  if (clientId && apiKey) {
    try {
      const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests/12345", {
        headers: {
          "x-client-id": clientId,
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        }
      });
      console.log("PayOS Test HTTP Status:", res.status);
      const json = await res.json();
      console.log("PayOS Test Response:", JSON.stringify(json));
    } catch (err) {
      console.error("PayOS Test Error:", err.message);
    }
  } else {
    console.log("PayOS keys not found in .env.local");
  }
}

main().catch(err => {
  console.error("Unhandled error:", err);
});
