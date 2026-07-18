#!/usr/bin/env node
// Seed a known email+password test account into Supabase (idempotent).
//
//   cd apps/nova-builder && node scripts/seed-test-account.mjs [envFile]
//
// (Runs from apps/nova-builder so it resolves that workspace's bcryptjs +
//  @supabase/supabase-js. A repo-root copy exists as a pointer.)
//
// Defaults env: apps/nova-builder/.env.local. Creates (or resets the password of)
//   email:    test@nova.dev
//   password: Test1234!
// so you can sign in at /login without going through the signup flow.
//
// Uses the SERVICE key (server-side, never shipped to the client). Safe to re-run
// — an existing test user has its password_hash refreshed instead of duplicated.

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const TEST_EMAIL = "test@nova.dev";
const TEST_PASSWORD = "Test1234!";
const TEST_NAME = "Test User";

// This script lives in apps/nova-builder/scripts/ — the worker dir is its parent's parent.
const workerDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseDotenv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    let key = line.slice(0, eq).trim();
    if (key.startsWith("export ")) key = key.slice(7).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function main() {
  const fileArg = process.argv.slice(2).find((a) => !a.startsWith("--"));
  const candidates = fileArg
    ? [resolve(process.cwd(), fileArg)]
    : [join(workerDir, ".env.local"), join(workerDir, ".env.production")];
  const envFile = candidates.find((f) => existsSync(f));
  if (!envFile) {
    console.error("No env file found. Pass one explicitly:\n  node scripts/seed-test-account.mjs apps/nova-builder/.env.local");
    process.exit(1);
  }
  const env = parseDotenv(readFileSync(envFile, "utf8"));
  let url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  if (url) {
    if (url.endsWith("/rest/v1/")) url = url.slice(0, -9);
    else if (url.endsWith("/rest/v1")) url = url.slice(0, -8);
  }
  const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in", envFile);
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  // Upsert: refresh the hash if the account already exists, else insert.
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", TEST_EMAIL)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("users")
      .update({ password_hash: passwordHash, provider: "email" })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    console.log(`✓ Reset password for existing test account (${existing.id}).`);
  } else {
    const { data, error } = await supabase
      .from("users")
      .insert({
        email: TEST_EMAIL,
        provider: "email",
        display_name: TEST_NAME,
        password_hash: passwordHash,
        tier: "free",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    console.log(`✓ Created test account (${data.id}).`);
  }

  console.log("\n  Sign in at /login with:");
  console.log(`    email:    ${TEST_EMAIL}`);
  console.log(`    password: ${TEST_PASSWORD}\n`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
