import { test, expect } from "@playwright/test";

// FA-007 — canvas direct-manipulation. Runs against the public /builder/demo,
// so no credentials. Proves the selection overlay renders on select; the resize
// and drag-reparent *mutations* need a human pass (see doc/qa-nova-builder.md).

test("FA-007: selecting a canvas element shows the selection overlay + handles", async ({ page }) => {
  await page.goto("/builder/demo");
  const canvas = page.frameLocator('iframe[src*="/canvas"]');
  // Canvas content rendered (demo Body + hero).
  await expect(canvas.locator("body")).toBeVisible({ timeout: 45_000 });

  // Click a known demo element to select it.
  await canvas.getByText("Build any website with AI.").first().click({ timeout: 15_000 });

  // The in-iframe overlay appears with its 8 resize handles.
  const overlay = canvas.locator("[data-nova-overlay]");
  await expect(overlay).toBeVisible({ timeout: 10_000 });
  // box + label + 8 handles = 10 direct children (handles are the last 8).
  await expect(overlay.locator("> div")).toHaveCount(10, { timeout: 10_000 });
});
