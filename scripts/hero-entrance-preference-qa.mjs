import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const expectedOrder = [4, 3, 5, 2, 6, 1, 7, 0];
const results = [];
const errors = [];

for (const reducedMotion of ['no-preference', 'reduce']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${reducedMotion}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${reducedMotion}: ${error.message}`));
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.locator('.fan-card-motion').first().waitFor({ state: 'attached' });

  const frames = [];
  const start = Date.now();
  for (let sample = 0; sample < 56; sample++) {
    frames.push({
      time: Date.now() - start,
      opacity: await page.locator('.fan-card-motion').evaluateAll((cards) =>
        cards.map((card) => Number(getComputedStyle(card).opacity)),
      ),
    });
    await page.waitForTimeout(42);
  }

  const firstVisible = frames[0].opacity.map((_, index) =>
    frames.find((frame) => frame.opacity[index] > .02)?.time ?? Infinity,
  );
  const order = firstVisible
    .map((time, index) => ({ time, index }))
    .sort((a, b) => a.time - b.time || expectedOrder.indexOf(a.index) - expectedOrder.indexOf(b.index))
    .map(({ index }) => index);
  results.push({
    reducedMotion,
    initial: frames[0].opacity,
    hasIntermediateFrame: frames.some((frame) => frame.opacity.some((opacity) => opacity > .05 && opacity < .95)),
    final: frames.at(-1).opacity,
    order,
  });
  await page.close();
}

await browser.close();

const failures = results.flatMap((result) => {
  const issues = [];
  if (result.initial.some((opacity) => opacity > .001)) issues.push('initial flash');
  if (!result.hasIntermediateFrame) issues.push('static entrance');
  if (result.final.some((opacity) => opacity < .995)) issues.push('incomplete entrance');
  if (result.order.join(',') !== expectedOrder.join(',')) issues.push(`order ${result.order.join(',')}`);
  return issues.map((issue) => `${result.reducedMotion}: ${issue}`);
});

console.log(JSON.stringify({ errors, failures, results }, null, 2));
if (errors.length || failures.length) process.exitCode = 1;
