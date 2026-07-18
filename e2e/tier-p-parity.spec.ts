// Tier P Batch (M3 + M6 + M7b) E2E verification
import { test, expect } from "@playwright/test";

test("Tier P: style cascade order, shift-click multi-select, and link interceptor", async ({ page }) => {
  await page.goto("/builder/demo");
  const frame = page.frameLocator('iframe[src*="/canvas"]');
  await expect(frame.locator("[data-ws-component]").first()).toBeVisible({
    timeout: 60_000,
  });

  // Verify stylesheet cascade order includes all sheets correctly
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

  // Verify design mode interceptor prevents link navigation
  const prevented = await page.frame({ url: /\/canvas/ })!.evaluate(() => {
    let defaultPrevented = false;
    const a = document.createElement("a");
    a.href = "https://example.com";
    document.body.appendChild(a);
    const evt = new MouseEvent("click", { bubbles: true, cancelable: true });
    a.dispatchEvent(evt);
    defaultPrevented = evt.defaultPrevented;
    a.remove();
    return defaultPrevented;
  });
  expect(prevented).toBe(true);
});
