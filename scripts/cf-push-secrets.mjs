#!/usr/bin/env node
// Push the Nova Worker's RUNTIME secrets to Cloudflare in one shot.
//
//   node scripts/cf-push-secrets.mjs [envFile] [--dry-run]
//
// Reads a dotenv file (default: apps/nova-builder/.env.production, falling back
// to apps/nova-builder/.env.local), keeps only the *runtime* server-side vars,
// and uploads them via `wrangler secret bulk`.
//
// IMPORTANT — what this does NOT do (by design):
//   • NEXT_PUBLIC_* are BUILD-TIME (Next.js inlines them into the client bundle).
//     They cannot be set as Worker secrets — configure them in the Cloudflare
//     Dashboard → nova-editor → Settings → Build → Variables (Build scope).
//   • This is skipped here so you never accidentally ship a build var as a
//     runtime-only secret (it would still be `undefined` in the client bundle).
//
// Secrets are written to a temp file OUTSIDE the repo and deleted afterwards.

import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workerDir = join(repoRoot, "apps", "nova-builder");

// Keys that must NEVER be pushed as runtime secrets.
const SKIP_EXACT = new Set([
  "NODE_ENV",       // set by the runtime
  "E2E_EMAIL", "E2E_PASSWORD", "E2E_EMAIL_B", "E2E_PASSWORD_B", // local test creds
  // Deploy/CI credentials — used by wrangler/GitHub Actions, NOT by the app at
  // runtime. The Worker should not carry the CF API token.
  "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID",
]);
const isBuildTime = (k) => k.startsWith("NEXT_PUBLIC_");

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

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fileArg = args.find((a) => !a.startsWith("--"));

  const candidates = fileArg
    ? [resolve(fileArg)]
    : [join(workerDir, ".env.production"), join(workerDir, ".env.local")];
  const envFile = candidates.find((f) => existsSync(f));
  if (!envFile) {
    console.error(`No env file found. Tried:\n  ${candidates.join("\n  ")}`);
    process.exit(1);
  }

  const parsed = parseDotenv(readFileSync(envFile, "utf8"));
  const secrets = {};
  const skipped = [];
  for (const [k, v] of Object.entries(parsed)) {
    if (isBuildTime(k)) { skipped.push(`${k} (build-time → Dashboard Build vars)`); continue; }
    if (SKIP_EXACT.has(k)) { skipped.push(`${k} (excluded)`); continue; }
    if (v === "") { skipped.push(`${k} (empty)`); continue; }
    secrets[k] = v;
  }

  const keys = Object.keys(secrets);
  console.log(`Source: ${envFile}`);
  console.log(`\nWill push ${keys.length} runtime secret(s):`);
  for (const k of keys) console.log(`  + ${k}`);
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length}:`);
    for (const s of skipped) console.log(`  - ${s}`);
  }

  if (dryRun) {
    console.log("\n--dry-run: nothing pushed.");
    return;
  }
  if (keys.length === 0) {
    console.log("\nNothing to push.");
    return;
  }

  const tmp = join(tmpdir(), `nova-cf-secrets-${Date.now()}.json`);
  try {
    writeFileSync(tmp, JSON.stringify(secrets), { mode: 0o600 });
    console.log(`\nRunning: wrangler secret bulk (cwd: apps/nova-builder)\n`);
    const res = spawnSync(
      "npx",
      ["wrangler", "secret", "bulk", tmp],
      { cwd: workerDir, stdio: "inherit", shell: process.platform === "win32" }
    );
    process.exit(res.status ?? 1);
  } finally {
    try { rmSync(tmp, { force: true }); } catch { /* best effort */ }
  }
}

main();
