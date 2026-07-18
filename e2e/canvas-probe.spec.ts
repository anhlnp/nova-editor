import { test, expect } from "@playwright/test";
import { mkdirSync } from "fs";
try { mkdirSync("qa-screenshots", { recursive: true }); } catch {}
const ss = async (page: import("@playwright/test").Page, name: string) =>
  page.screenshot({ path: `qa-screenshots/${name}.png` }).catch(() => {});

test("probe: canvas iframe content + h1/h2 access", async ({ page }) => {
  await page.goto("/builder/demo");
  await page.waitForSelector('iframe[title="Canvas"]', { timeout: 30_000 });
  // Wait for canvas content to actually render
  await page.waitForTimeout(8_000);
  await ss(page, "probe-after-8s");

  // List all iframes
  const iframes = page.locator("iframe");
  const count = await iframes.count();
  console.log("iframe count:", count);
  for (let i = 0; i < count; i++) {
    const src = await iframes.nth(i).getAttribute("src").catch(() => "");
    const title = await iframes.nth(i).getAttribute("title").catch(() => "");
    const box = await iframes.nth(i).boundingBox().catch(() => null);
    console.log(`iframe[${i}]:`, { src, title, w: box?.width, h: box?.height });
  }

  // Try frameLocator by title
  const fl = page.frameLocator('iframe[title="Canvas"]');
  const bodyVis = await fl.locator("body").isVisible({ timeout: 5_000 }).catch((e: Error) => "ERR: " + e.message);
  console.log("frameLocator body visible:", bodyVis);

  // Text content of body
  const bodyText = await fl.locator("body").textContent({ timeout: 5_000 }).catch((e: Error) => "ERR: " + e.message);
  console.log("canvas body text (200):", String(bodyText).slice(0, 200));

  // h1/h2/h3
  const h1count = await fl.locator("h1, h2, h3").count().catch(() => -1);
  console.log("h1/h2/h3 count in canvas:", h1count);

  // Any [data-ws-id] elements?
  const wsCount = await fl.locator("[data-ws-id]").count().catch(() => -1);
  console.log("[data-ws-id] count:", wsCount);

  // Check if canvas src is cross-origin (would block frameLocator)
  const canvasSrc = await page.locator('iframe[title="Canvas"]').getAttribute("src").catch(() => "");
  console.log("canvas iframe src:", canvasSrc);
});

test("probe: click heading by coordinate + check props CONTENT", async ({ page }) => {
  await page.goto("/builder/demo");
  await page.waitForSelector('iframe[title="Canvas"]', { timeout: 30_000 });
  await page.waitForTimeout(6_000); // let canvas fully load

  const iframeBox = await page.locator('iframe[title="Canvas"]').boundingBox();
  console.log("iframe bounds:", JSON.stringify(iframeBox));

  if (!iframeBox) { console.log("no iframe box"); return; }

  // The demo shows "Build any website with AI." heading roughly at y+280 in canvas
  // Canvas y starts at iframeBox.y, heading is roughly 280px down
  const clickY = iframeBox.y + 280;
  const clickX = iframeBox.x + iframeBox.width / 2;
  console.log(`clicking at (${clickX}, ${clickY})`);
  await page.mouse.click(clickX, clickY);
  await page.waitForTimeout(800);
  await ss(page, "probe-heading-click");

  // What's selected in right panel header?
  const selectedLabel = await page.locator("text=/inst_|Body|Heading|Paragraph|Box|Section/i").first().textContent({ timeout: 3_000 }).catch(() => "none");
  console.log("Right panel selected label:", selectedLabel);

  // Click Props tab
  const propsTab = page.locator('[role="tab"]').filter({ hasText: /^props$/i }).first();
  await propsTab.click();
  await page.waitForTimeout(400);
  await ss(page, "probe-props-after-click");

  // Check for CONTENT
  const contentVis = await page.locator("label").filter({ hasText: /CONTENT/i }).first().isVisible({ timeout: 2_000 }).catch(() => false);
  console.log("CONTENT field visible:", contentVis);

  // What component is shown in header?
  const compHeader = await page.locator("div").filter({ hasText: /Heading|Paragraph|Text|Button|Box|Body|Section/i }).first().textContent({ timeout: 2_000 }).catch(() => "none");
  console.log("Component header:", compHeader?.slice(0, 100));
});
