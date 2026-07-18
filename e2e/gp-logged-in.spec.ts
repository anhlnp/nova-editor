/**
 * Golden path QA — logged-in user flow (v25.1.3)
 * Steps: signup → create project → AI generate → canvas render →
 *        text edit (Props + Lexical) → component insert → export HTML
 */
import { test, expect } from "@playwright/test";
import { mkdirSync } from "fs";

try { mkdirSync("qa-screenshots", { recursive: true }); } catch {}
const ss = (page: import("@playwright/test").Page, name: string) =>
  page.screenshot({ path: `qa-screenshots/gp-li-${name}.png`, fullPage: false }).catch(() => {});

const EMAIL = `gp_${Date.now()}@testqa.dev`;
const PASS  = "Test1234!";

// ─────────────────────────────────────────────────────────────────────────────
test("GP-FULL: signup → create project → AI gen → edit → export", async ({ page }) => {
  page.on("console", m => {
    if (m.type() === "error") console.log(`[PAGE ERR] ${m.text().slice(0, 200)}`);
  });

  // ── 1. Signup ───────────────────────────────────────────────────────────────
  console.log("\n── STEP 1: Signup ──");
  await page.goto("/signup");
  await page.waitForLoadState("networkidle");
  console.log("signup title:", await page.title());
  await ss(page, "01-signup");

  const pwFields = await page.locator('input[type="password"]').all();
  await page.fill('input[type="email"]', EMAIL);
  await pwFields[0].fill(PASS);
  if (pwFields.length >= 2) await pwFields[1].fill(PASS);
  await page.click('button[type="submit"]');

  try {
    await page.waitForURL(url => url.pathname.includes("/projects") || url.pathname.includes("/builder"), { timeout: 20_000 });
  } catch { console.log("signup redirect timeout — current URL:", page.url()); }
  console.log("after signup URL:", page.url());
  await ss(page, "02-after-signup");

  // ── 2. Create / open project ────────────────────────────────────────────────
  console.log("\n── STEP 2: Project ──");
  if (!page.url().includes("/builder")) {
    if (!page.url().includes("/projects")) {
      await page.goto("/projects");
      await page.waitForLoadState("networkidle");
    }
    await ss(page, "03-projects");
    console.log("projects page title:", await page.title());

    // Try "New project" or "Create" button
    const newBtn = page.locator("button, a").filter({ hasText: /new project|create|start/i }).first();
    const hasNewBtn = await newBtn.isVisible({ timeout: 8_000 }).catch(() => false);
    console.log("'New project' button visible:", hasNewBtn);
    if (hasNewBtn) {
      await newBtn.click();
      try {
        await page.waitForURL(url => url.pathname.includes("/builder/"), { timeout: 15_000 });
      } catch { console.log("builder redirect timeout:", page.url()); }
    }
  }

  // If still not in builder fall back to demo
  if (!page.url().includes("/builder/")) {
    console.log("Falling back to /builder/demo");
    await page.goto("/builder/demo");
  }
  console.log("builder URL:", page.url());

  // Wait for canvas iframe
  await expect(page.locator('iframe[title="Canvas"]')).toBeVisible({ timeout: 30_000 });
  const canvas = page.frameLocator('iframe[title="Canvas"]');
  await ss(page, "04-builder-loaded");
  console.log("Builder loaded ✓");

  // ── 3. AI panel ─────────────────────────────────────────────────────────────
  console.log("\n── STEP 3: AI panel ──");
  // Look for AI button in topbar (text "AI" or sparkle icon)
  const aiBtn = page.locator("button").filter({ hasText: /^AI$|Generate|✨/i }).first();
  const hasAI = await aiBtn.isVisible({ timeout: 6_000 }).catch(() => false);
  console.log("AI button visible:", hasAI);

  let aiGenerated = false;
  if (hasAI) {
    await aiBtn.click();
    await page.waitForTimeout(600);
    await ss(page, "05-ai-panel-open");

    const aiTextarea = page.locator("textarea").filter({ hasText: "" }).first();
    const hasTA = await aiTextarea.isVisible({ timeout: 5_000 }).catch(() => false);
    console.log("AI textarea visible:", hasTA);

    if (hasTA) {
      await aiTextarea.fill("portfolio with hero section, about me, and contact");
      await ss(page, "06-ai-prompt");

      const genBtn = page.locator("button").filter({ hasText: /generate|create|build/i }).first();
      const hasGen = await genBtn.isVisible({ timeout: 3_000 }).catch(() => false);
      if (hasGen) {
        await genBtn.click();
        console.log("AI generation started, waiting up to 60s...");
        try {
          await page.waitForSelector('button:has-text("Apply")', { timeout: 60_000 });
          console.log("Apply button appeared ✓");
          await ss(page, "07-ai-result");
          await page.locator("button").filter({ hasText: /apply/i }).first().click();
          await page.waitForTimeout(2_000);
          console.log("AI result applied ✓");
          aiGenerated = true;
        } catch (e) {
          console.log("Apply button not found:", (e as Error).message.slice(0, 100));
          await ss(page, "07-ai-timeout");
        }
      }
    }
  } else {
    console.log("SKIP: AI button not visible");
  }
  await ss(page, "08-after-ai");
  console.log("AI generated:", aiGenerated);

  // ── 4. Canvas renders ───────────────────────────────────────────────────────
  console.log("\n── STEP 4: Canvas render ──");
  const iframeBox = await page.locator('iframe[title="Canvas"]').boundingBox();
  console.log("canvas bounds:", JSON.stringify(iframeBox));

  // Wait for actual content in canvas
  const headingVisible = await canvas.locator("h1, h2, h3").first()
    .isVisible({ timeout: 15_000 }).catch(() => false);
  console.log("heading visible in canvas:", headingVisible);
  if (headingVisible) {
    const txt = await canvas.locator("h1, h2, h3").first().textContent().catch(() => "");
    console.log("first heading text:", JSON.stringify(txt?.slice(0, 60)));
  }
  await ss(page, "09-canvas-content");

  // ── 5a. Click heading → right panel updates ─────────────────────────────────
  console.log("\n── STEP 5a: Canvas click → Props CONTENT ──");
  if (headingVisible) {
    await canvas.locator("h1, h2, h3").first().click();
    await page.waitForTimeout(700);
    await ss(page, "10-heading-selected");

    // Right panel should show heading component (not Body)
    const rpText = await page.locator("[style*='gridArea: right'], [style*='grid-area: right']")
      .first().textContent({ timeout: 3_000 }).catch(() => "");
    const showsHeading = rpText?.toLowerCase().includes("heading") ?? false;
    console.log("right panel shows heading:", showsHeading, "| text:", rpText?.slice(0, 80));

    // Props tab
    const propsTab = page.locator('[role="tab"]').filter({ hasText: /^props$/i }).first();
    await propsTab.click();
    await page.waitForTimeout(400);

    const contentLabel = page.locator("label").filter({ hasText: /CONTENT/i }).first();
    const contentVisible = await contentLabel.isVisible({ timeout: 5_000 }).catch(() => false);
    console.log("CONTENT field visible:", contentVisible);
    await ss(page, "11-props-content-field");

    if (contentVisible) {
      const ta = page.locator("textarea").first();
      const origVal = await ta.inputValue().catch(() => "");
      console.log("CONTENT original value:", JSON.stringify(origVal.slice(0, 60)));

      const edited = "GP-LOGGED-IN TEST ✓";
      await ta.fill(edited);
      await ta.press("Enter");
      await page.waitForTimeout(800);
      await ss(page, "12-content-edited");

      const canvasHeadingAfter = await canvas.locator("h1, h2, h3").first()
        .textContent().catch(() => "");
      console.log("canvas heading after edit:", JSON.stringify(canvasHeadingAfter?.slice(0, 60)));
      const editWorked = canvasHeadingAfter?.includes("GP-LOGGED-IN") ?? false;
      console.log("CONTENT edit reflected in canvas:", editWorked);
    }
  } else {
    console.log("SKIP: no heading in canvas");
  }

  // ── 5b. Double-click → Lexical ──────────────────────────────────────────────
  console.log("\n── STEP 5b: Double-click → Lexical ──");
  const paraOrHeading = await canvas.locator("p, h1, h2, h3").first()
    .isVisible({ timeout: 5_000 }).catch(() => false);
  if (paraOrHeading) {
    await canvas.locator("p, h1, h2, h3").first().dblclick();
    await page.waitForTimeout(800);
    const editable = canvas.locator('[contenteditable="true"]');
    const editableVisible = await editable.isVisible({ timeout: 5_000 }).catch(() => false);
    console.log("Lexical contenteditable opened:", editableVisible);
    await ss(page, "13-lexical-open");
    if (editableVisible) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      console.log("Lexical closed via Escape ✓");
    }
  }

  // ── 6. Insert Button ────────────────────────────────────────────────────────
  console.log("\n── STEP 6: Insert Button ──");
  const compTab = page.locator('[aria-label="Components"]').first();
  const hasCompTab = await compTab.isVisible({ timeout: 5_000 }).catch(() => false);
  console.log("Components (Add) tab visible:", hasCompTab);
  if (hasCompTab) {
    await compTab.click();
    await page.waitForTimeout(500);
    await ss(page, "14-components-panel");

    const btnItem = page.locator("button").filter({ hasText: /^Button$/i }).first();
    const hasBtnItem = await btnItem.isVisible({ timeout: 5_000 }).catch(() => false);
    console.log("Button component item visible:", hasBtnItem);
    if (hasBtnItem) {
      await btnItem.click();
      await page.waitForTimeout(1_200);
      await ss(page, "15-button-inserted");

      const canvasBtn = canvas.locator("button").first();
      const btnInCanvas = await canvasBtn.isVisible({ timeout: 5_000 }).catch(() => false);
      console.log("Button in canvas after insert:", btnInCanvas);
      if (btnInCanvas) {
        const btnText = await canvasBtn.textContent().catch(() => "");
        console.log("Button text:", JSON.stringify(btnText));
      }
    }
  }

  // ── 7. Export ───────────────────────────────────────────────────────────────
  console.log("\n── STEP 7: Export HTML ──");
  const exportBtn = page.locator("button").filter({ hasText: /^export$/i }).first();
  const hasExport = await exportBtn.isVisible({ timeout: 5_000 }).catch(() => false);
  console.log("Export button visible:", hasExport);
  await ss(page, "16-topbar");

  if (hasExport) {
    await exportBtn.click();
    await page.waitForTimeout(600);
    await ss(page, "17-export-menu");

    // Try to find the HTML download link
    const htmlLink = page.locator("a").filter({ hasText: /html/i }).first();
    const hasHtmlLink = await htmlLink.isVisible({ timeout: 3_000 }).catch(() => false);
    console.log("HTML export link visible:", hasHtmlLink);

    if (hasHtmlLink) {
      const href = await htmlLink.getAttribute("href").catch(() => "");
      console.log("Export href:", href);
      if (href) {
        const resp = await page.request.get(
          href.startsWith("http") ? href : `http://localhost:3001${href}`
        );
        console.log("Export GET status:", resp.status());
        if (resp.status() === 200) {
          const html = await resp.text();
          console.log("Export HTML length:", html.length);
          console.log("Has <html>:", html.includes("<html"));
          console.log("Has <body>:", html.includes("<body"));
          // Save for inspection
          try {
            require("fs").writeFileSync("qa-screenshots/exported.html", html);
            console.log("Saved to qa-screenshots/exported.html ✓");
          } catch {}
        } else {
          const body = await resp.text().catch(() => "");
          console.log("Export error:", body.slice(0, 200));
        }
      }
    } else {
      // Maybe export goes directly
      const projectId = page.url().split("/builder/")[1]?.split("/")[0] ?? "demo";
      const directResp = await page.request.get(`http://localhost:3001/api/export/${projectId}`);
      console.log("Direct export status:", directResp.status());
      if (directResp.status() === 200) {
        const html = await directResp.text();
        console.log("Direct export HTML length:", html.length);
      }
    }
  } else {
    console.log("Export button not found — checking topbar text:");
    const topbar = await page.locator("[style*='topbar']").first()
      .textContent({ timeout: 2_000 }).catch(() => "");
    console.log("Topbar:", topbar?.slice(0, 150));
  }

  await ss(page, "18-final");
  console.log("\n── GOLDEN PATH COMPLETE ──");
  console.log("Email used:", EMAIL);
});
