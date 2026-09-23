import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('a')].map((element) => {
  const rect = element.getBoundingClientRect();
  return { text: element.textContent, href: element.getAttribute('href'), className: element.className, left: rect.left, right: rect.right, width: rect.width, wrap: getComputedStyle(element).overflowWrap };
}).filter((item) => item.right > innerWidth + 1)), null, 2));
await browser.close();
