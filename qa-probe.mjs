import { chromium } from 'playwright';
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage();
  await p.goto('http://localhost:3001/builder/demo');
  
  // Wait for canvas
  await p.waitForSelector('iframe[title="Canvas"]', { timeout: 30000 });
  await p.waitForTimeout(5000); // let canvas content load
  
  // What iframes exist?
  const iframes = await p.locator('iframe').all();
  console.log('iframe count:', iframes.length);
  for (const f of iframes) {
    const src = await f.getAttribute('src').catch(() => '');
    const title = await f.getAttribute('title').catch(() => '');
    const name = await f.getAttribute('name').catch(() => '');
    const box = await f.boundingBox().catch(() => null);
    console.log('iframe:', { src, title, name, w: box?.width, h: box?.height });
  }

  // Try frameLocator with different selectors
  const fl1 = p.frameLocator('iframe[title="Canvas"]');
  const body1 = fl1.locator('body');
  const vis1 = await body1.isVisible({ timeout: 5000 }).catch(e => 'ERR: ' + e.message);
  console.log('frameLocator title=Canvas body visible:', vis1);

  const fl2 = p.frameLocator('iframe[src*="/canvas"]');
  const body2 = fl2.locator('body');
  const vis2 = await body2.isVisible({ timeout: 3000 }).catch(e => 'ERR: ' + e.message);
  console.log('frameLocator src*/canvas body visible:', vis2);

  // What's the actual src?
  const iframeSrc = await p.locator('iframe').first().getAttribute('src');
  console.log('first iframe src:', iframeSrc);

  // Try h1 inside the frame
  const h1 = fl1.locator('h1, h2, h3').first();
  const h1vis = await h1.isVisible({ timeout: 3000 }).catch(e => 'ERR: ' + e.message);
  console.log('h1 visible in Canvas frame:', h1vis);
  
  // Get text content of body
  const bodyText = await fl1.locator('body').textContent({ timeout: 3000 }).catch(e => 'ERR: ' + e.message);
  console.log('canvas body text (first 200):', String(bodyText).slice(0, 200));

  await p.screenshot({ path: 'qa-screenshots/probe-loaded.png' });
  await b.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
