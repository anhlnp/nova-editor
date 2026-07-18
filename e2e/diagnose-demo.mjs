// One-off diagnostic: open /builder/demo, dump HTTP status, console, page errors.
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning")
    console.log(`[console.${msg.type()}]`, msg.text().slice(0, 500));
});
page.on("pageerror", (err) => console.log("[pageerror]", String(err).slice(0, 1000)));
page.on("requestfailed", (req) =>
  console.log("[requestfailed]", req.url(), req.failure()?.errorText)
);

const resp = await page.goto("http://localhost:3001/builder/demo", { waitUntil: "domcontentloaded", timeout: 60000 });
console.log("[http]", resp?.status(), resp?.url());

await page.waitForTimeout(15000);
console.log("[body text]", (await page.locator("body").innerText().catch(() => "<empty>")).slice(0, 300));
console.log("[html len]", (await page.content()).length);

await browser.close();
