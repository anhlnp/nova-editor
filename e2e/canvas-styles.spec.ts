// M-S1 (v20.0.0) — canvas style rendering regression guard (WSA-1).
// The demo project defines StyleDecls (dark bg, padding, flex/grid layout);
// this spec proves they actually PAINT in the /canvas iframe — the exact
// failure mode found by WS-PARITY-AUDIT (styles atom written, nothing rendered).
import { test, expect } from "@playwright/test";

test("canvas paints StyleDecls (user sheet + computed styles)", async ({
  page,
}) => {
  await page.goto("/builder/demo");
  const frame = page.frameLocator('iframe[src*="/canvas"]');
  // Canvas has rendered instances (emitter handshake complete).
  await expect(frame.locator("[data-ws-component]").first()).toBeVisible({
    timeout: 60_000,
  });

  // The user stylesheet mounts and fills after subscriptions render (rAF).
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

  // All five sheets mount in cascade order.
  const sheetNames = await page.frame({ url: /\/canvas/ })!.evaluate(() =>
    Array.from(document.querySelectorAll("style[data-webstudio]")).map((el) =>
      el.getAttribute("data-webstudio")
    )
  );
  expect(sheetNames).toEqual([
    "nova-fonts",
    "nova-presets",
    "nova-user-styles",
    "nova-state-styles",
    "nova-helpers",
  ]);

  // Computed-style probe: at least one element paints a non-default
  // background, and at least one uses flex or grid from StyleDecls.
  const probe = await page.frame({ url: /\/canvas/ })!.evaluate(() =>
    Array.from(document.querySelectorAll("[data-ws-component]"))
      .slice(0, 25)
      .map((el) => {
        const cs = getComputedStyle(el as HTMLElement);
        return { display: cs.display, bg: cs.backgroundColor };
      })
  );
  expect(probe.some((s) => s.bg !== "rgba(0, 0, 0, 0)")).toBe(true);
  expect(probe.some((s) => s.display === "flex" || s.display === "grid")).toBe(
    true
  );
});
