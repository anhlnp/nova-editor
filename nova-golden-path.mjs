import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:3001';
const TEST_EMAIL = `qa_${Date.now()}@testqa.dev`;
const TEST_PASS = 'Test1234!';
const SCREENSHOTS = 'C:/Users/Administrator/Downloads/Github Clone/nova-nocode-editor/qa-screenshots';

import { mkdirSync } from 'fs';
try { mkdirSync(SCREENSHOTS, { recursive: true }); } catch(e) {}

const log = (msg) => { console.log(msg); };
const ss = async (page, name) => page.screenshot({ path: `${SCREENSHOTS}/${name}.png` }).catch(() => {});

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  page.on('console', m => {
    if (m.type() === 'error') log(`[PAGE_ERR] ${m.text().slice(0, 200)}`);
  });

  // ── STEP 1: Signup ──────────────────────────────────────────────────────────
  log('=== STEP 1: Signup ===');
  await page.goto(`${BASE}/signup`);
  await page.waitForLoadState('networkidle');
  log('signup page title: ' + await page.title());
  await ss(page, '01-signup-form');

  const pwFields = await page.locator('input[type="password"]').all();
  await page.fill('input[type="email"]', TEST_EMAIL);
  await pwFields[0].fill(TEST_PASS);
  if (pwFields.length >= 2) await pwFields[1].fill(TEST_PASS);

  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(url => url.includes('/projects') || url.includes('/builder'), { timeout: 15000 });
  } catch(e) { log('signup redirect timeout: ' + e.message); }
  log('after signup URL: ' + page.url());
  await ss(page, '01-after-signup');

  // ── STEP 2: Navigate to builder ─────────────────────────────────────────────
  log('=== STEP 2: Builder ===');
  const urlAfterSignup = page.url();
  if (!urlAfterSignup.includes('/projects') && !urlAfterSignup.includes('/builder')) {
    await page.goto(`${BASE}/projects`);
    await page.waitForLoadState('networkidle');
  }
  await ss(page, '02-projects');
  log('projects URL: ' + page.url());

  const newBtn = page.locator('button, a').filter({ hasText: /new project|create|start/i }).first();
  const hasNewBtn = await newBtn.isVisible({ timeout: 5000 }).catch(() => false);
  log('new project button visible: ' + hasNewBtn);
  if (hasNewBtn) {
    await newBtn.click();
    try { await page.waitForURL(url => url.includes('/builder/'), { timeout: 10000 }); } catch(e) {}
    log('after create: ' + page.url());
  }

  if (!page.url().includes('/builder/')) {
    await page.goto(`${BASE}/builder/demo`);
    await page.waitForLoadState('networkidle');
    log('falling back to demo builder');
  }

  try {
    await page.waitForSelector('iframe[title="Canvas"]', { timeout: 25000 });
    log('canvas iframe appeared');
  } catch(e) { log('WARNING: canvas iframe not found: ' + e.message); }
  await ss(page, '02-builder-loaded');
  log('builder URL: ' + page.url());

  // ── STEP 3: AI panel ────────────────────────────────────────────────────────
  log('=== STEP 3: AI Panel ===');
  const aiBtn = page.locator('button').filter({ hasText: /^AI$|✨/i }).first();
  const hasAI = await aiBtn.isVisible({ timeout: 5000 }).catch(() => false);
  log('AI button visible: ' + hasAI);

  if (hasAI) {
    await aiBtn.click();
    await page.waitForTimeout(800);
    await ss(page, '03-ai-panel-open');

    const textarea = page.locator('textarea').first();
    const hasTA = await textarea.isVisible({ timeout: 5000 }).catch(() => false);
    if (hasTA) {
      await textarea.fill('portfolio with hero section, about me, and contact');
      await ss(page, '03-ai-prompt-filled');

      const genBtn = page.locator('button').filter({ hasText: /generate|create|build/i }).first();
      await genBtn.click();
      log('AI generation started, waiting up to 40s...');

      try {
        await page.waitForSelector('button:has-text("Apply")', { timeout: 40000 });
        log('Apply button appeared');
        await ss(page, '03-ai-result');
        await page.locator('button').filter({ hasText: /apply/i }).first().click();
        await page.waitForTimeout(2000);
        log('AI result applied');
      } catch(e) {
        log('Apply not found: ' + e.message);
        await ss(page, '03-ai-timeout');
      }
    }
  } else {
    log('SKIP: AI button not visible (demo mode hides it?)');
  }
  await ss(page, '03-after-ai');

  // ── STEP 4: Canvas render ───────────────────────────────────────────────────
  log('=== STEP 4: Canvas Render ===');
  const iframe = page.locator('iframe[title="Canvas"]');
  const iframeBox = await iframe.boundingBox().catch(() => null);
  log('canvas iframe bounds: ' + JSON.stringify(iframeBox));
  log('canvas has area: ' + !!(iframeBox && iframeBox.width > 100 && iframeBox.height > 100));
  await ss(page, '04-canvas');

  // ── STEP 5: Props panel CONTENT field ──────────────────────────────────────
  log('=== STEP 5: Props Panel Text Edit ===');
  if (iframeBox) {
    await page.mouse.click(iframeBox.x + iframeBox.width / 2, iframeBox.y + 120);
    await page.waitForTimeout(800);
    log('clicked canvas center');
  }

  const propsTab = page.locator('[role="tab"]').filter({ hasText: /props/i }).first();
  const hasPropsTab = await propsTab.isVisible({ timeout: 5000 }).catch(() => false);
  log('Props tab visible: ' + hasPropsTab);

  if (hasPropsTab) {
    await propsTab.click();
    await page.waitForTimeout(500);
    await ss(page, '05-props-tab');

    const contentLabel = page.locator('label').filter({ hasText: /CONTENT/i }).first();
    const hasContent = await contentLabel.isVisible({ timeout: 3000 }).catch(() => false);
    log('CONTENT field visible: ' + hasContent);

    if (hasContent) {
      const ta = page.locator('textarea').first();
      const initVal = await ta.inputValue().catch(() => '');
      log('CONTENT initial value: "' + initVal + '"');
      await ta.fill('My Portfolio — Edited via Props Panel');
      await ta.press('Enter');
      await page.waitForTimeout(600);
      log('CONTENT edited and committed');
      await ss(page, '05-content-edited');
    }
  }

  // ── STEP 5b: Double-click Lexical on canvas ─────────────────────────────────
  log('=== STEP 5b: Double-click Lexical ===');
  if (iframeBox) {
    await page.mouse.dblclick(iframeBox.x + iframeBox.width / 2, iframeBox.y + 120);
    await page.waitForTimeout(1000);
    log('double-clicked canvas');
    await ss(page, '05b-dblclick-lexical');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // ── STEP 6: Component insert ────────────────────────────────────────────────
  log('=== STEP 6: Component Insert ===');
  const compTab = page.locator('button, [role="tab"]').filter({ hasText: /^components?$/i }).first();
  const hasCompTab = await compTab.isVisible({ timeout: 5000 }).catch(() => false);
  log('Components tab visible: ' + hasCompTab);

  if (hasCompTab) {
    await compTab.click();
    await page.waitForTimeout(500);
    await ss(page, '06-components-panel');

    const btnItem = page.locator('button').filter({ hasText: /^Button$/i }).first();
    const hasBtnItem = await btnItem.isVisible({ timeout: 5000 }).catch(() => false);
    log('Button component item visible: ' + hasBtnItem);

    if (hasBtnItem) {
      await btnItem.click();
      await page.waitForTimeout(1000);
      log('Button component inserted');
      await ss(page, '06-after-insert');
    }
  }

  // ── STEP 7: Export HTML ─────────────────────────────────────────────────────
  log('=== STEP 7: Export HTML ===');
  const exportBtn = page.locator('button').filter({ hasText: /^export$/i }).first();
  const hasExport = await exportBtn.isVisible({ timeout: 5000 }).catch(() => false);
  log('Export button visible: ' + hasExport);

  if (hasExport) {
    await exportBtn.click();
    await page.waitForTimeout(500);
    await ss(page, '07-export-menu');

    const htmlLink = page.locator('a').filter({ hasText: /html/i }).first();
    const hasHtml = await htmlLink.isVisible({ timeout: 3000 }).catch(() => false);
    log('HTML export link visible: ' + hasHtml);

    if (hasHtml) {
      const href = await htmlLink.getAttribute('href').catch(() => '');
      log('Export href: ' + href);

      const cookies = await ctx.cookies();
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const exportUrl = `${BASE}${href}`;
      log('Hitting export URL: ' + exportUrl);

      try {
        const resp = await fetch(exportUrl, { headers: { Cookie: cookieHeader } });
        log('Export API status: ' + resp.status);
        if (resp.status === 200) {
          const html = await resp.text();
          log('Export HTML length: ' + html.length + ' chars');
          log('Has <body>: ' + html.includes('<body'));
          log('Has <head>: ' + html.includes('<head'));
          writeFileSync(`${SCREENSHOTS}/exported-portfolio.html`, html);
          log('Saved exported HTML');
        } else {
          const body = await resp.text();
          log('Export error body: ' + body.slice(0, 300));
        }
      } catch(e) {
        log('Export fetch error: ' + e.message);
      }
    }
  } else {
    const demoMode = await page.locator('text=/sign up free/i').first().isVisible({ timeout: 2000 }).catch(() => false);
    log('Export not shown — demo mode: ' + demoMode);
  }

  await ss(page, '07-final');
  await browser.close();
  log('=== GOLDEN PATH QA COMPLETE ===');
})().catch(e => {
  console.error('FATAL:', e.message, e.stack);
  process.exit(1);
});
