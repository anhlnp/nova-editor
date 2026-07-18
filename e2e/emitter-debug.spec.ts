/**
 * Debug: does the canvas SyncClient(follower) actually connect to the emitter?
 * Inject a spy into the canvas window to track emitter activity.
 */
import { test } from "@playwright/test";
try { require("fs").mkdirSync("qa-screenshots", { recursive: true }); } catch {}

test("debug: canvas emitter connection", async ({ page }) => {
  const msgs: string[] = [];
  const canvasLogs: string[] = [];

  page.on("console", m => msgs.push(`[B] ${m.text().slice(0, 200)}`));

  await page.goto("/builder/demo");

  // Inject spy BEFORE canvas loads to track emitter injection
  await page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[title="Canvas"]');
    if (!iframe?.contentWindow) { console.log("[SPY] no iframe yet"); return; }

    // Watch for __webstudioSharedSyncEmitter__ being set
    let _val: unknown;
    Object.defineProperty(iframe.contentWindow, "__webstudioSharedSyncEmitter__", {
      get() { return _val; },
      set(v) {
        _val = v;
        console.log("[SPY] __webstudioSharedSyncEmitter__ SET on canvas window, value:", typeof v);
        if (v && typeof (v as any).on === "function") {
          // Monkey-patch the emitter's on() to log what subscribes
          const origOn = (v as any).on.bind(v);
          (v as any).on = (...args: unknown[]) => {
            console.log("[SPY] emitter.on() called by canvas follower");
            return origOn(...args);
          };
          const origEmit = (v as any).emit.bind(v);
          (v as any).emit = (msg: unknown) => {
            console.log("[SPY] emitter.emit()", JSON.stringify(msg).slice(0, 100));
            return origEmit(msg);
          };
        }
      },
      configurable: true,
    });
    console.log("[SPY] property spy installed on iframe.contentWindow");
  });

  // Wait for canvas to load
  const canvas = page.frameLocator('iframe[title="Canvas"]');
  await canvas.locator("h1, h2, h3").first().waitFor({ timeout: 45_000 });

  // Wait a bit more for the emitter injection from loadState:ready
  await page.waitForTimeout(3000);

  // Check if canvas's waitForEmitter ever found the emitter
  const canvasWindow = await page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe[title="Canvas"]');
    return {
      hasEmitter: !!(iframe?.contentWindow as any)?.__webstudioSharedSyncEmitter__,
      iframeLoaded: !!(iframe?.contentWindow),
    };
  });
  console.log("canvas iframe state:", JSON.stringify(canvasWindow));

  // Check canvas frame for its own logs
  for (const f of page.frames()) {
    f.on("console", m => canvasLogs.push(`[C] ${m.text().slice(0, 200)}`));
  }

  // Attach frame logs after initial load
  await page.waitForTimeout(500);

  console.log("\n=== Builder logs ===");
  msgs.forEach(m => console.log(m));
  console.log("\n=== Canvas logs ===");
  canvasLogs.forEach(m => console.log(m));

  await page.screenshot({ path: "qa-screenshots/debug-emitter.png" });
});
