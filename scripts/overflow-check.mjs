import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
const result = await page.evaluate(() => [...document.querySelectorAll('body *')].map((element) => {
  const rect = element.getBoundingClientRect();
  return { tag: element.tagName, id: element.id, className: element.className, left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
}).filter((item) => item.left < -1 || item.right > innerWidth + 1).slice(0, 50));
console.log(JSON.stringify({ scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth), result }, null, 2));
await browser.close();
