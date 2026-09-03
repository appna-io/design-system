import { chromium } from '@playwright/test';
const [out, url, selector] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await page.evaluate(async () => { const s=window.innerHeight; for (let y=0;y<document.body.scrollHeight;y+=s){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,200));} window.scrollTo(0,0); });
await page.waitForTimeout(1200);
await page.locator(selector).first().screenshot({ path: out });
await browser.close();
