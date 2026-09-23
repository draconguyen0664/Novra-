import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});
const outputDir = 'docs/qa/ximitech-home';
const sectionIds = ['ai-consultation', 'services', 'selected-projects', 'why-ximitech', 'pricing', 'kho-giao-dien', 'process', 'faq', 'about-ximitech', 'contato'];
await fs.mkdir(outputDir, { recursive: true });

for (const width of [1440, 390]) {
  const height = width === 390 ? 844 : 900;
  const page = await browser.newPage({ viewport: { width, height }, hasTouch: width === 390, isMobile: width === 390 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 90000 });
  const cells = [];
  for (const id of sectionIds) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const screenshot = path.join(outputDir, `${width}-${id}.png`);
    await page.screenshot({ path: screenshot });
    const cell = await sharp(screenshot).resize({ width: 360, height: 225, fit: 'cover', position: 'top' }).jpeg({ quality: 80 }).toBuffer();
    cells.push(cell);
  }
  const columns = 2;
  const rows = Math.ceil(cells.length / columns);
  await sharp({ create: { width: columns * 360, height: rows * 225, channels: 3, background: '#dedede' } })
    .composite(cells.map((input, index) => ({ input, left: (index % columns) * 360, top: Math.floor(index / columns) * 225 })))
    .jpeg({ quality: 84 })
    .toFile(path.join(outputDir, `montage-${width}.jpg`));
  await page.close();
}

await browser.close();
console.log('Created desktop and mobile visual audit montages.');
