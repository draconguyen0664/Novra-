import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'no-preference',
});
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
const geometry = await page.locator('#experience').evaluate((section) => {
  const rect = section.getBoundingClientRect();
  return { top: rect.top + scrollY, height: rect.height };
});
await page.evaluate((top) => scrollTo(0, top), geometry.top);
await page.waitForTimeout(500);

const frames = [];
const readFrame = async () => page.evaluate(({ top, height }) => {
  const progress = (scrollY - top) / (height - innerHeight);
  const words = [...document.querySelectorAll('.experience-word')].map((word) => {
    const letters = [...word.querySelectorAll('.word-character')];
    return Number((letters.reduce(
      (sum, letter) => sum + Number(getComputedStyle(letter).opacity),
      0,
    ) / letters.length).toFixed(3));
  });
  return { scrollY, progress: Number(progress.toFixed(3)), words };
}, geometry);

frames.push(await readFrame());
for (let index = 0; index < 5; index++) {
  await page.mouse.wheel(0, 810);
  await page.waitForTimeout(1400);
  frames.push(await readFrame());
}

await browser.close();

const changed = frames.some((frame) => frame.words[0] < 0.8 && frame.words[1] > 0);
const completed = frames.at(-1).words[3] > 0.95;
console.log(JSON.stringify({ errors, geometry, frames, changed, completed }, null, 2));
if (errors.length || !changed || !completed) process.exitCode = 1;
