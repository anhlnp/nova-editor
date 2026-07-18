/**
 * Debug: does CONTENT field commit actually update builder atom?
 * Does builder→canvas sync via immerhin work?
 */
import { test, expect } from "@playwright/test";
import { mkdirSync } from "fs";
try { mkdirSync("qa-screenshots", { recursive: true }); } catch {}

test("debug: CONTENT commit chain", async ({ page }) => {
  const builderLogs: string[] = [];
  const canvasLogs: string[] = [];
  page.on("console", m => builderLogs.push(`[B:${m.type()}] ${m.text().slice(0, 300)}`));

  await page.goto("/builder/demo");
  const canvas = page.frameLocator('iframe[title="Canvas"]');
  await expect(canvas.locator("h1, h2, h3").first()).toBeVisible({ timeout: 45_000 });

  // Attach canvas console
  for (const f of page.frames()) {
    f.on("console", m => canvasLogs.push(`[C:${m.type()}] ${m.text().slice(0, 300)}`));
  }

  // Inject debug monitors into builder page
  await page.evaluate(() => {
    // Watch for nova:updateInstance or any message to canvas
    const orig = (window as any).__webstudio__orig_postMessage;
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[title="Canvas"]');
    if (iframe?.contentWindow) {
      const origPost = iframe.contentWindow.postMessage.bind(iframe.contentWindow);
      (iframe.contentWindow as any).postMessage = (...args: unknown[]) => {
        console.log("[BUILDER→CANVAS postMessage]", JSON.stringify(args[0]).slice(0, 200));
        return (origPost as (...a: unknown[]) => void)(...args);
      };
    }
    console.log("[DEBUG] builder page eval OK, iframe found:", !!iframe);
  });

  // Click heading → select
  await canvas.locator("h1, h2, h3").first().click();
  await page.waitForTimeout(600);

  // Switch to Props tab
  const propsTab = page.locator('[role="tab"]').filter({ hasText: /^props$/i }).first();
  await propsTab.click();
  await page.waitForTimeout(300);

  // Read initial CONTENT value
  const ta = page.locator("textarea").first();
  await expect(ta).toBeVisible({ timeout: 5_000 });
  const before = await ta.inputValue();
  console.log("Before:", before);

  // Commit new text
  await ta.fill("CANVAS_UPDATE_TEST_XYZ");
  await ta.press("Enter");

  // Wait longer for sync chain
  await page.waitForTimeout(2000);

  // Check builder atom via page eval
  const builderInstances = await page.evaluate(() => {
    // Try to find any exposed debug or atom
    return (window as any).__nova_debug_instances ?? "not exposed";
  });
  console.log("Builder instances (debug):", typeof builderInstances);

  // Check what the canvas heading says now
  const headingAfter = await canvas.locator("h1, h2, h3").first().textContent().catch(() => "ERR");
  console.log("Canvas heading after:", headingAfter);

  // Check if heading text changed in canvas DOM
  const bodyText = await canvas.locator("body").textContent().catch(() => "");
  console.log("Canvas has CANVAS_UPDATE_TEST_XYZ:", bodyText.includes("CANVAS_UPDATE_TEST_XYZ"));

  await page.screenshot({ path: "qa-screenshots/debug-content-commit.png" });

  console.log("\n=== Builder logs ===");
  builderLogs.slice(-20).forEach(l => console.log(l));
  console.log("\n=== Canvas logs ===");
  canvasLogs.slice(-10).forEach(l => console.log(l));
});
