// M2 (v22.0.0) — patch-based autosave + optimistic concurrency guard (audit #7).
// Self-contained: registers a throwaway user via the public register API and
// signs in with credentials, so no E2E_* secrets are needed. Skips gracefully
// when the dev database is unavailable (register fails).
import { test, expect, type Page } from "@playwright/test";

const password = "e2e-password-123";

async function editPadding(page: Page, value: string) {
  const frame = page.frameLocator('iframe[src*="/canvas"]');
  await expect(frame.locator("[data-ws-component]").first()).toBeVisible({
    timeout: 60_000,
  });
  const paddingRow = page
    .locator('tr:has(td:has-text("padding")) input[type="number"]')
    .first();
  if (await paddingRow.isVisible().catch(() => false)) {
    // Row exists — edit via the UnitInput.
    await paddingRow.fill(value);
    await paddingRow.press("Enter");
    return;
  }
  // Fresh project has no styles — add the declaration via AddPropertyRow.
  await page.locator('input[placeholder="property"]').fill("padding");
  await page.locator('input[placeholder="value"]').fill(`${value}px`);
  await page.locator('input[placeholder="value"]').press("Enter");
}

test("autosave persists via patches; stale tab gets conflict UI", async ({
  page,
  context,
}) => {
  test.setTimeout(180_000);
  // 1. Register a fresh user (skip when no DB behind the dev server).
  const email = `e2e-save-${Date.now()}@nova-e2e.local`;
  const register = await page.request.post("/api/auth/register", {
    data: { email, password, name: "E2E Save" },
  });
  test.skip(!register.ok(), `register unavailable: ${register.status()}`);

  // 2. Sign in through the UI (credentials form).
  await page.goto("/login");
  await page.getByRole("button", { name: /email/i }).first().click().catch(() => {});
  await page.locator('input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/\/projects/, { timeout: 30_000 });

  // 3. Create a project via the API (session cookie shared with the page).
  const created = await page.request.post("/api/projects", {
    data: { name: "E2E Patch Save" },
  });
  expect(created.ok()).toBe(true);
  const project = (await created.json()) as { id: string };

  // Concurrency requires migration 0020 (version column) on the dev DB.
  const loaded = await page.request.get(`/api/projects/${project.id}`);
  const versionSupported =
    ((await loaded.json()) as { version: number | null }).version !== null;

  // 4. Open the builder in two tabs — B loads the same version as A.
  await page.goto(`/builder/${project.id}`);
  const pageB = await context.newPage();
  await pageB.goto(`/builder/${project.id}`);
  const frameB = pageB.frameLocator('iframe[src*="/canvas"]');
  await expect(frameB.locator("[data-ws-component]").first()).toBeVisible({
    timeout: 60_000,
  });

  // 5. Tab A edits → patch autosave confirms ("All changes saved").
  await editPadding(page, "44");
  await expect(
    page.getByText(/All changes saved|Đã lưu mọi thay đổi/).first()
  ).toBeVisible({ timeout: 20_000 });

  // 6. Reload tab A — the patched document persisted server-side.
  await page.reload();
  const paddingAfterReload = page
    .locator('tr:has(td:has-text("padding")) input[type="number"]')
    .first();
  await expect(paddingAfterReload).toBeVisible({ timeout: 60_000 });
  await expect(paddingAfterReload).toHaveValue("44", { timeout: 15_000 });

  // 7. Tab B is now stale (its baseVersion predates A's save) — editing there
  //    must surface the conflict UI instead of clobbering A's work.
  //    (Requires migration 0020 on the dev DB; degraded mode skips this part.)
  if (versionSupported) {
    await editPadding(pageB, "77");
    await expect(
      pageB.getByText(/changed elsewhere|bị sửa ở nơi khác/).first()
    ).toBeVisible({ timeout: 20_000 });

    // 8. And A's value must still be intact on the server.
    const check = await page.request.get(`/api/projects/${project.id}`);
    expect(check.ok()).toBe(true);
    const body = (await check.json()) as {
      data: { styles: [string, { property: string; value: { value?: number } }][] };
    };
    const padding = body.data.styles.find(([, decl]) => decl.property === "padding");
    expect(padding?.[1].value.value).toBe(44);
  } else {
    test.info().annotations.push({
      type: "warning",
      description: "version column missing (migration 0020) — conflict path not exercised",
    });
  }
});
