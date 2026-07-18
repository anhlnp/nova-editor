import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Elder-first a11y gate — runs against the public funnel (no auth required).
// Fails the suite if any axe violation is serious or critical.

const PUBLIC_PAGES = ["/", "/login", "/signup", "/pricing"];

for (const path of PUBLIC_PAGES) {
  test(`a11y: ${path} passes wcag2a + wcag2aa`, async ({ page }) => {
    await page.goto(path);
    // Wait for networkidle, then confirm <title> is populated — ensures the
    // page has fully SSR-hydrated before axe scans (avoids false html-has-lang
    // / document-title violations on first cold-compile hit).
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(() => document.title.length > 0, { timeout: 30_000 });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    if (blocking.length > 0) {
      const summary = blocking
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}\n  ${v.nodes.map((n) => n.target.join(", ")).join("\n  ")}`)
        .join("\n\n");
      throw new Error(`${blocking.length} serious/critical a11y violation(s) on ${path}:\n\n${summary}`);
    }
  });
}

test("elder-first: landing page font size and CTA touch targets", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Body copy should be ≥ 16 px on public pages
  const pSize = await page.evaluate(() => {
    const p = document.querySelector("p");
    return p ? parseFloat(window.getComputedStyle(p).fontSize) : 0;
  });
  expect(pSize, "Body text should be ≥ 16px on public pages").toBeGreaterThanOrEqual(16);

  // Primary CTA button touch target ≥ 44 px
  const ctaSelector = 'a[href="/signup"], button:has-text("Get started"), button:has-text("Start building")';
  const cta = page.locator(ctaSelector).first();
  if (await cta.count() > 0) {
    const box = await cta.boundingBox();
    if (box) {
      expect(box.height, "Primary CTA height should be ≥ 44px").toBeGreaterThanOrEqual(44);
    }
  }
});
