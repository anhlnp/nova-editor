import { test } from "@playwright/test";

test("debug: inject sync monitor into builder page + canvas", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", m => logs.push(`[BUILDER ${m.type()}] ${m.text().slice(0, 300)}`));

  await page.goto("/builder/demo");
  const canvas = page.frameLocator('iframe[title="Canvas"]');
  await canvas.locator("h1, h2, h3").first().waitFor({ timeout: 45_000 });

  // Inject a monitor into the builder page that watches $selectedInstanceSelector
  await page.evaluate(() => {
    // Monkey-patch the emitter's emit method on the iframe's contentWindow
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[title="Canvas"]');
    if (!iframe?.contentWindow) { console.log("no iframe contentWindow"); return; }

    // The emitter was injected then deleted from contentWindow — it lives inside
    // the canvas module's closure. We can't access it directly.
    // Instead: watch the right panel DOM for changes.
    const rp = document.querySelector('[style*="right"]') as HTMLElement | null;
    if (!rp) { console.log("no right panel found by style"); }

    // Set up a MutationObserver on the whole body to log DOM changes
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList" && m.addedNodes.length) {
          const text = (m.target as HTMLElement).textContent?.slice(0, 100);
          if (text?.includes("Heading") || text?.includes("Paragraph")) {
            console.log("DOM CHANGE — detected Heading/Paragraph text:", text);
          }
        }
      }
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true });
    console.log("MutationObserver installed");
  });

  // Get canvas frame and inject console there too
  const canvasFrame = page.frames().find(f => f.url().includes("/canvas"));
  if (canvasFrame) {
    canvasFrame.on("console", m => logs.push(`[CANVAS ${m.type()}] ${m.text().slice(0, 300)}`));

    // Inject into canvas to log when $selectedInstanceSelector changes
    await canvasFrame.evaluate(() => {
      console.log("canvas frame eval: injecting debug");
    }).catch(e => console.log("canvas eval error:", e));
  }

  console.log("clicking heading now...");
  await canvas.locator("h1, h2, h3").first().click();
  await page.waitForTimeout(4000);

  console.log("=== All logs ===");
  for (const l of logs) console.log(l);
  console.log("=== End logs ===");

  await page.screenshot({ path: "qa-screenshots/sync-debug-4s.png" });

  // Check if right panel instance header changed
  const header = await page.locator("div").filter({ hasText: /^(Body|Heading|Paragraph|Box|Text|Section)$/ }).all();
  for (const h of header) {
    const t = await h.textContent().catch(() => "");
    if (t) console.log("Potential header:", JSON.stringify(t));
  }
});
