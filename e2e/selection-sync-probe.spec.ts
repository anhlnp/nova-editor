import { test, expect } from "@playwright/test";

// Probe: does clicking a canvas element update $selectedInstanceSelector in the builder context?

test("probe: canvas click → builder selection atom sync", async ({ page }) => {
  const builderLogs: string[] = [];

  // Capture console from the main builder page
  page.on("console", (msg) => {
    builderLogs.push(`[PAGE ${msg.type()}] ${msg.text().slice(0, 300)}`);
  });

  await page.goto("/builder/demo");
  const canvas = page.frameLocator('iframe[title="Canvas"]');
  await expect(canvas.locator("h1, h2, h3").first()).toBeVisible({ timeout: 45_000 });

  // Read initial selection from the builder page's atom
  const initialSel = await page.evaluate(() => {
    return (window as any).__nova_debug_selectedInstanceSelector;
  });
  console.log("Initial selection (undefined expected):", initialSel);

  // Inject a debug monitor into builder page to track atom changes
  await page.evaluate(() => {
    // Try to access the nanostores atom from window
    (window as any).__nova_selection_log = [];
    // We can't directly access the atom, but we can watch the right panel DOM
  });

  // Click heading in canvas
  await canvas.locator("h1, h2, h3").first().click();
  await page.waitForTimeout(3000); // wait 3s for sync to propagate

  // Check what the right panel shows now
  const rightPanelText = await page.locator("[style*='gridArea: right'], [style*='grid-area: right']").first()
    .textContent({ timeout: 2_000 }).catch(() => "NOT_FOUND");
  console.log("Right panel text after 3s wait:", rightPanelText?.slice(0, 200));

  // Check footer (shows selected element name)
  const footerText = await page.locator("footer, [style*='gridArea: footer']").first()
    .textContent({ timeout: 2_000 }).catch(() => "FOOTER_NOT_FOUND");
  console.log("Footer text:", footerText?.slice(0, 100));

  // Screenshot
  await page.screenshot({ path: "qa-screenshots/probe-selection-after-3s.png" });

  // Check what component is shown in right panel header
  const rpHeader = page.locator("div").filter({ hasText: /^(Body|Heading|Paragraph|Box|Text|Section)$/ }).first();
  const rpText = await rpHeader.textContent({ timeout: 2_000 }).catch(() => "none");
  console.log("Right panel component header text:", rpText);

  // Log all console messages from builder
  console.log("Builder console logs:", builderLogs.join("\n").slice(0, 1000));
});

test("probe: canvas iframe console logs on click", async ({ page, browser }) => {
  const canvasLogs: string[] = [];

  await page.goto("/builder/demo");
  const canvas = page.frameLocator('iframe[title="Canvas"]');
  await expect(canvas.locator("h1, h2, h3").first()).toBeVisible({ timeout: 45_000 });

  // Get the canvas frame to monitor its console
  const frames = page.frames();
  console.log("frames count:", frames.length);
  for (const f of frames) {
    console.log("frame url:", f.url());
    f.on("console", (msg) => {
      canvasLogs.push(`[CANVAS ${msg.type()}] ${msg.text().slice(0, 200)}`);
    });
  }

  // Click heading
  await canvas.locator("h1, h2, h3").first().click();
  await page.waitForTimeout(2000);

  console.log("Canvas logs:", canvasLogs.join("\n") || "(none)");

  // Check navigator panel — should show selected element highlighted
  const navHighlight = page.locator("[style*='background'][style*='rgba(124']").first();
  const navText = await navHighlight.textContent({ timeout: 2_000 }).catch(() => "none");
  console.log("Navigator highlight text:", navText);

  // Check footer text
  const footer = page.locator("div").last();
  const footText = await page.locator("body").textContent({ timeout: 1_000 }).catch(() => "");
  // Look for the instance ID pattern or component name in the page text
  const hasHeadingRef = footText?.includes("Heading") || false;
  console.log("Page text includes 'Heading':", hasHeadingRef);

  await page.screenshot({ path: "qa-screenshots/probe-selection-sync.png" });
});
