import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const errors = [];
const results = [];

for (const width of [1440, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${width}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${width}: ${error.message}`));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const links = page.locator('.desktop-nav .nav-link');
  const count = await links.count();
  const items = [];

  for (let index = 0; index < count; index++) {
    const link = links.nth(index);
    const before = await link.boundingBox();
    await link.hover();
    await page.waitForTimeout(520);
    const after = await link.boundingBox();
    const state = await link.evaluate((element) => {
      const track = element.querySelector('.nav-track');
      const primary = element.querySelector('.nav-text-primary');
      const secondary = element.querySelector('.nav-text-secondary');
      const mask = element.querySelector('.nav-mask');
      const trackMatrix = new DOMMatrix(getComputedStyle(track).transform);
      const primaryMatrix = new DOMMatrix(getComputedStyle(primary).transform);
      const secondaryMatrix = new DOMMatrix(getComputedStyle(secondary).transform);
      return {
        label: primary.textContent?.trim(),
        trackY: Number(trackMatrix.m42.toFixed(2)),
        primaryRotation: Number((Math.atan2(primaryMatrix.m12, primaryMatrix.m11) * 180 / Math.PI).toFixed(2)),
        secondaryRotation: Number((Math.atan2(secondaryMatrix.m12, secondaryMatrix.m11) * 180 / Math.PI).toFixed(2)),
        overflow: getComputedStyle(mask).overflow,
        activeIndicator: getComputedStyle(element, '::after').transform,
      };
    });
    items.push({ before, after, ...state });
  }

  results.push({ width, items });
  await page.close();
}

await browser.close();

const failures = results.flatMap(({ width, items }) => items.flatMap((item, index) => {
  const issues = [];
  if (Math.abs(item.trackY + 24) > .2) issues.push('track travel');
  if (Math.abs(item.primaryRotation + 5) > .2 || Math.abs(item.secondaryRotation) > .2) issues.push('rotation');
  if (item.overflow !== 'hidden') issues.push('mask clipping');
  if (!item.before || !item.after || Math.abs(item.before.width - item.after.width) > .1 || Math.abs(item.before.height - item.after.height) > .1) issues.push('layout shift');
  if (index === 0 && item.activeIndicator !== 'matrix(1, 0, 0, 1, 0, 0)') issues.push('active indicator');
  return issues.map((issue) => `${width} ${item.label}: ${issue}`);
}));

console.log(JSON.stringify({ errors, failures, results }, null, 2));
if (errors.length || failures.length) process.exitCode = 1;
