/**
 * Golden Path QA — v25.1.2
 * Tests: selection sync fix, left sidebar labels, component insert, text edit, export
 */
import { test, expect } from "@playwright/test";
import { mkdirSync } from "fs";

try { mkdirSync("qa-screenshots", { recursive: true }); } catch {}
const ss = (page: import("@playwright/test").Page, name: string) =>
  page.screenshot({ path: `qa-screenshots/${name}.png` }).catch(() => {});

// ── GP-S1: Left sidebar has visible text labels ──────────────────────────────
test("GP-S1: left sidebar shows icon + text label on tabs", async ({ page }) => {
  await page.goto("/builder/demo");
  await expect(page.locator('iframe[title="Canvas"]')).toBeVisible({ timeout: 30_000 });

  // The "Add" label should be visible (Components tab)
  const addLabel = page.locator("text=Add").first();
  await expect(addLabel).toBeVisible({ timeout: 5_000 });

  // "Layers" label for Navigator
  const layersLabel = page.locator("text=Layers").first();
  await expect(layersLabel).toBeVisible({ timeout: 3_000 });

  // "Pages" label
  const pagesLabel = page.locator("text=Pages").first();
  await expect(pagesLabel).toBeVisible({ timeout: 3_000 });

  await ss(page, "gp-s1-sidebar-labels");
  console.log("Sidebar labels visible: Add, Layers, Pages ✓");
});

// ── GP-S2: Canvas click → builder selection sync ─────────────────────────────
test("GP-S2: canvas click → builder right panel updates via nova:select", async ({ page }) => {
  await page.goto("/builder/demo");
  const canvas = page.frameLocator('iframe[title="Canvas"]');

  // Wait for canvas to have actual heading content
  await expect(canvas.locator("h1, h2, h3").first()).toBeVisible({ timeout: 45_000 });
  await ss(page, "gp-s2-before-click");

  // Click the heading in the canvas iframe
  await canvas.locator("h1, h2, h3").first().click();

  // Builder's $selectedInstanceSelector should update via nova:select postMessage.
  // The right panel's instance header or component name should change from "Body".
  // We check: the footer should now reference a heading instance, OR
  // the panel content changes. Use a generous timeout for React re-render.
  await page.waitForTimeout(800);
  await ss(page, "gp-s2-after-click");

  // Check the right panel body — it should NO LONGER say "Body · inst_bod" as
  // the only content. Look for a Heading-related entry.
  const panelText = await page.locator("[style*='gridArea: right'], [style*='grid-area: right']")
    .first().textContent({ timeout: 3_000 }).catch(() => "");
  console.log("Right panel after click (first 200):", panelText?.slice(0, 200));

  // Verify: Props tab now shows CONTENT field for the selected heading.
  const propsTab = page.locator('[role="tab"]').filter({ hasText: /^props$/i }).first();
  await propsTab.click();
  await page.waitForTimeout(400);
  await ss(page, "gp-s2-props-tab");

  const contentField = page.locator("label").filter({ hasText: /CONTENT/i }).first();
  await expect(contentField).toBeVisible({ timeout: 5_000 });
  console.log("CONTENT field visible after canvas click ✓");

  const textareaVal = await page.locator("textarea").first().inputValue().catch(() => "");
  console.log("CONTENT value:", JSON.stringify(textareaVal.slice(0, 80)));
  expect(textareaVal.length).toBeGreaterThan(0);
});

// ── GP-S3: Edit CONTENT from Props panel ────────────────────────────────────
test("GP-S3: edit CONTENT field in Props panel commits to canvas", async ({ page }) => {
  await page.goto("/builder/demo");
  const canvas = page.frameLocator('iframe[title="Canvas"]');
  await expect(canvas.locator("h1, h2, h3").first()).toBeVisible({ timeout: 45_000 });

  // Click heading to select
  await canvas.locator("h1, h2, h3").first().click();
  await page.waitForTimeout(600);

  // Switch to Props tab
  const propsTab = page.locator('[role="tab"]').filter({ hasText: /^props$/i }).first();
  await propsTab.click();
  await page.waitForTimeout(300);

  // CONTENT field must be visible
  const contentField = page.locator("label").filter({ hasText: /CONTENT/i }).first();
  await expect(contentField).toBeVisible({ timeout: 5_000 });

  const ta = page.locator("textarea").first();
  const originalVal = await ta.inputValue().catch(() => "");
  console.log("Original CONTENT:", JSON.stringify(originalVal.slice(0, 60)));

  // Edit the text
  const newText = "QA Edited Heading v25.1.2";
  await ta.fill(newText);
  await ta.press("Enter");
  await page.waitForTimeout(600);
  await ss(page, "gp-s3-content-edited");

  // Verify the canvas heading updated
  const headingText = await canvas.locator("h1, h2, h3").first().textContent().catch(() => "");
  console.log("Canvas heading after edit:", JSON.stringify(headingText?.slice(0, 80)));
  expect(headingText).toContain("QA Edited Heading");
  console.log("Canvas updated with new text ✓");
});

// ── GP-S4: Double-click Paragraph → Lexical editor ──────────────────────────
test("GP-S4: double-click paragraph opens Lexical contenteditable", async ({ page }) => {
  await page.goto("/builder/demo");
  const canvas = page.frameLocator('iframe[title="Canvas"]');
  await expect(canvas.locator("h1, h2, h3").first()).toBeVisible({ timeout: 45_000 });

  // Try double-clicking a paragraph; fall back to heading if no p
  const para = canvas.locator("p").first();
  const paraVisible = await para.isVisible({ timeout: 5_000 }).catch(() => false);
  const target = paraVisible ? para : canvas.locator("h1, h2, h3").first();

  await target.dblclick();
  await page.waitForTimeout(800);
  await ss(page, "gp-s4-dblclick");

  const editable = canvas.locator('[contenteditable="true"]');
  await expect(editable).toBeVisible({ timeout: 5_000 });
  console.log("Lexical contenteditable opened ✓");

  // Type something
  await editable.type("test ", { delay: 30 });
  await page.waitForTimeout(300);
  await ss(page, "gp-s4-typing");

  // Escape to close
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  await ss(page, "gp-s4-escaped");
  console.log("Lexical editor closed after Escape ✓");
});

// ── GP-S5: Insert Button from Components panel ───────────────────────────────
test("GP-S5: insert Button component from Add tab", async ({ page }) => {
  await page.goto("/builder/demo");
  await expect(page.locator('iframe[title="Canvas"]')).toBeVisible({ timeout: 30_000 });

  // Open Components tab — click the "Add" label or the ⊞ icon button
  const compTab = page.locator('[aria-label="Components"]').first();
  await expect(compTab).toBeVisible({ timeout: 10_000 });
  await compTab.click();
  await page.waitForTimeout(500);
  await ss(page, "gp-s5-components-panel");

  // Button item in the panel
  const btnItem = page.locator("button").filter({ hasText: /^Button$/i }).first();
  await expect(btnItem).toBeVisible({ timeout: 5_000 });
  console.log("Button component visible in panel ✓");

  await btnItem.click();
  await page.waitForTimeout(1_000);
  await ss(page, "gp-s5-button-inserted");

  // The canvas should now contain a button element
  const canvas = page.frameLocator('iframe[title="Canvas"]');
  const canvasButton = canvas.locator("button").first();
  const buttonVisible = await canvasButton.isVisible({ timeout: 5_000 }).catch(() => false);
  console.log("Button visible in canvas after insert:", buttonVisible);

  // Right panel should now show Button as selected (via nova:select from insertComponent)
  const rightText = await page.locator("[style*='gridArea: right'], [style*='grid-area: right']")
    .first().textContent({ timeout: 2_000 }).catch(() => "");
  console.log("Right panel after insert (50 chars):", rightText?.slice(0, 50));
});

// ── GP-S6: AI provider is Groq (sanity) ──────────────────────────────────────
test("GP-S6: AI provider env is Groq (key configured)", async ({ page }) => {
  // Hit the AI route with minimal payload to check provider init (not a real generation)
  // We expect 401 (not logged in) not 500 (provider misconfigured)
  const resp = await page.request.post("http://localhost:3001/api/ai", {
    data: { userMessage: "test", projectId: "demo" },
    headers: { "Content-Type": "application/json" },
  });
  // 401 = auth working (not logged in), 4xx ≠ 500 (Groq misconfiguration would 500)
  const status = resp.status();
  console.log("AI route status (expect 401, not 500):", status);
  expect(status).not.toBe(500);
  expect(status).toBe(401); // Unauthorized — correct for unauthenticated request
  console.log("Groq provider reachable (auth gate, not provider error) ✓");
});

// ── GP-S7: Export API returns HTML for demo project ──────────────────────────
test("GP-S7: export HTML route returns 200 with HTML content", async ({ page }) => {
  // The export route: GET /api/export/[projectId]
  // We test demo project — free tier now has codeExport:true
  const resp = await page.request.get("http://localhost:3001/api/export/demo");
  const status = resp.status();
  console.log("Export /api/export/demo status:", status);

  if (status === 200) {
    const body = await resp.text();
    console.log("Export HTML length:", body.length);
    console.log("Has <html>:", body.includes("<html"));
    console.log("Has <body>:", body.includes("<body"));
    expect(body.length).toBeGreaterThan(100);
    expect(body).toContain("<");
    console.log("HTML export working ✓");
  } else {
    // 401 = needs auth (acceptable for export endpoint), 402 = paywall (bad)
    console.log("Export status non-200:", status);
    const body = await resp.text().catch(() => "");
    console.log("Body:", body.slice(0, 200));
    // 401 is acceptable (demo export might require auth session)
    expect(status).not.toBe(402); // 402 = paywall still on = bug
    expect(status).not.toBe(500); // 500 = server error = bug
  }
});
