// M1 (v21.0.0) — builder→canvas mutation sync regression guard (WSA-2).
// Before M1, builder edits mutated atoms directly and NEVER reached the canvas
// follower (immerhin transactions were the sync currency but had zero callers).
// This spec edits a style in the BUILDER panel and asserts the computed style
// changes INSIDE the canvas iframe — then proves transaction undo syncs too.
import { test, expect } from "@playwright/test";

test("builder style edit repaints the canvas (transaction sync + undo)", async ({
  page,
}) => {
  await page.goto("/builder/demo");
  const frame = page.frameLocator('iframe[src*="/canvas"]');
  await expect(frame.locator("[data-ws-component]").first()).toBeVisible({
    timeout: 60_000,
  });
  // Style sheet mounted (M-S1) — canvas paints before we measure edits.
  await expect
    .poll(
      async () =>
        page.frame({ url: /\/canvas/ })!.evaluate(() => {
          const el = document.querySelector(
            'style[data-webstudio="nova-user-styles"]'
          );
          return el?.textContent?.length ?? 0;
        }),
      { timeout: 30_000 }
    )
    .toBeGreaterThan(100);

  // Body is auto-selected on load; its SPACING section shows a padding row.
  const paddingInput = page
    .locator('tr:has(td:has-text("padding")) input[type="number"]')
    .first();
  await expect(paddingInput).toBeVisible({ timeout: 15_000 });

  const readBodyPadding = () =>
    page.frame({ url: /\/canvas/ })!.evaluate(() => {
      const body = document.querySelector('[data-ws-component="Body"]');
      return body ? getComputedStyle(body as HTMLElement).paddingTop : null;
    });

  const before = await readBodyPadding();
  expect(before).not.toBe("55px");

  // Edit in the builder panel → commit on Enter.
  await paddingInput.fill("55");
  await paddingInput.press("Enter");

  // WSA-2 proof: the change must arrive INSIDE the iframe.
  await expect.poll(readBodyPadding, { timeout: 15_000 }).toBe("55px");

  // Transaction undo must also propagate to the canvas.
  await page.keyboard.press("Control+z");
  await expect.poll(readBodyPadding, { timeout: 15_000 }).toBe(before);
});
