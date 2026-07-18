import { defineConfig } from "@playwright/test";

// Smoke-test harness (Phase 0 — Triage & Audit).
// Runs against the dev server on :3001; reuses one if already running.
export default defineConfig({
  testDir: "./e2e",
  // 90s: the /builder/demo test triggers two serial cold compiles on the dev
  // server (the builder route, then the nested /canvas iframe). Under full-suite
  // compile load this exceeds 60s even though the page renders correctly.
  timeout: 90_000,
  // One retry absorbs dev-server cold-compile flakiness on the heaviest route
  // (/builder/demo compiles the builder + nested /canvas serially under full-
  // suite load). A genuine failure still fails both attempts.
  retries: 1,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3001",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm --filter @nova/builder dev",
    url: "http://localhost:3001/login",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
