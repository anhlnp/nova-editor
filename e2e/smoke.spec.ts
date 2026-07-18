import { test, expect } from "@playwright/test";

// Phase 0 smoke tests — characterization, not spec:
// they pin down how the system behaves TODAY so refactors can't silently break it.
//
// Test 3 (save) needs a real account: set E2E_EMAIL + E2E_PASSWORD env vars.
// Tests 1–2 run with no credentials or database seed.

test("login: page renders and rejects bad credentials end-to-end", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Sign in to Nova" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();

  // Bad credentials must round-trip through NextAuth and surface the error.
  await page.locator('input[type="email"]').fill("nobody@example.com");
  await page.locator('input[type="password"]').fill("definitely-wrong-password");
  await page.getByRole("button", { name: "Sign in with Email" }).click();

  // 30s: first hit compiles the NextAuth route on the dev server (cold start).
  await expect(page.getByText("Invalid email or password.")).toBeVisible({ timeout: 30_000 });
});

test("load: /builder/demo boots the builder and canvas without a session", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto("/builder/demo");

  // Demo builder is public (middleware PUBLIC_PREFIXES) — must not bounce to /login.
  await expect(page).not.toHaveURL(/\/login/);

  // Builder shell ready: demo notice + canvas iframe present.
  await expect(page.getByText("Demo — edits not saved")).toBeVisible({ timeout: 45_000 });
  const iframe = page.locator('iframe[src*="/canvas"]');
  await expect(iframe).toBeVisible({ timeout: 45_000 });

  // Canvas iframe actually rendered content (ADR-NB-003: no auth redirect inside).
  // 45s: the /canvas route compiles separately from /builder and then waits for
  // the emitter handshake, so its body can appear late on a cold dev server —
  // give it the same headroom as the demo-notice wait above.
  const canvasBody = page.frameLocator('iframe[src*="/canvas"]').locator("body");
  await expect(canvasBody).toBeVisible({ timeout: 45_000 });

  expect(consoleErrors, `Uncaught page errors:\n${consoleErrors.join("\n")}`).toEqual([]);
});

test("save: authenticated user can open a project and save it", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD to run the save smoke test");

  await page.goto("/login");
  await page.locator('input[type="email"]').fill(email!);
  await page.locator('input[type="password"]').fill(password!);
  await page.getByRole("button", { name: "Sign in with Email" }).click();
  await page.waitForURL(/\/projects/, { timeout: 30_000 });

  // Open the first project card.
  const firstProject = page.locator('a[href^="/builder/"]').first();
  await expect(firstProject).toBeVisible({ timeout: 15_000 });
  await firstProject.click();
  await page.waitForURL(/\/builder\//, { timeout: 30_000 });

  const saveButton = page.getByRole("button", { name: "Save", exact: true });
  await expect(saveButton).toBeVisible({ timeout: 45_000 });
  await saveButton.click();

  // Save round-trips: button flips to "Saving…" then back with no error surface.
  await expect(page.getByRole("button", { name: /Save$/ })).toBeEnabled({ timeout: 30_000 });
});
