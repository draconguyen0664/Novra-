import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const expectedOrder = [4, 3, 5, 2, 6, 1, 7, 0];
const expectedAngles = [-52.75, -40.25, -27.75, -15.25, -2.75, 9.75, 22.25, 34.75];
const results = [];
const errors = [];

for (const width of [1440, 390]) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    hasTouch: width <= 430,
    isMobile: width <= 430,
    reducedMotion: 'no-preference',
  });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${width}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${width}: ${error.message}`));

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.locator('.fan-card-motion').first().waitFor({ state: 'attached' });

  const frames = [];
  const startedAt = Date.now();
  for (let sample = 0; sample < 58; sample++) {
    frames.push({
      time: Date.now() - startedAt,
      opacity: await page.locator('.fan-card-motion').evaluateAll((cards) =>
        cards.map((card) => Number(getComputedStyle(card).opacity)),
      ),
    });
    await page.waitForTimeout(40);
  }

  const firstVisible = expectedAngles.map((_, index) => {
    const frame = frames.find((entry) => entry.opacity[index] > .02);
    return frame?.time ?? Infinity;
  });
  const observedOrder = firstVisible
    .map((time, index) => ({ time, index }))
    .sort((a, b) => a.time - b.time || expectedOrder.indexOf(a.index) - expectedOrder.indexOf(b.index))
    .map(({ index }) => index);

  const final = await page.locator('.fan-card-motion').evaluateAll((cards) => cards.map((card) => {
    const matrix = new DOMMatrix(getComputedStyle(card).transform);
    return {
      opacity: Number(getComputedStyle(card).opacity),
      rotation: Number((Math.atan2(matrix.m12, matrix.m11) * 180 / Math.PI).toFixed(2)),
      scale: Number(Math.hypot(matrix.m11, matrix.m12).toFixed(3)),
      zIndex: Number(getComputedStyle(card).zIndex),
    };
  }));

  const monotonic = expectedAngles.every((_, index) => frames.every((frame, frameIndex) =>
    frameIndex === 0 || frame.opacity[index] + .002 >= frames[frameIndex - 1].opacity[index],
  ));

  results.push({ width, firstVisible, observedOrder, monotonic, initialOpacity: frames[0].opacity, final });
  await page.close();
}

await browser.close();

const failures = results.flatMap((result) => {
  const issues = [];
  if (result.initialOpacity.some((opacity) => opacity > .001)) issues.push('SSR/initial flash');
  if (result.observedOrder.join(',') !== expectedOrder.join(',')) issues.push(`order ${result.observedOrder.join(',')}`);
  if (!result.monotonic) issues.push('opacity flicker');
  result.final.forEach((card, index) => {
    if (card.opacity < .995) issues.push(`card ${index} opacity`);
    if (Math.abs(card.rotation - expectedAngles[index]) > .15) issues.push(`card ${index} rotation`);
    if (Math.abs(card.scale - 1) > .005) issues.push(`card ${index} scale`);
    if (card.zIndex !== 35 + index * 50) issues.push(`card ${index} z-index`);
  });
  return issues.map((issue) => `${result.width}: ${issue}`);
});

console.log(JSON.stringify({ errors, failures, results }, null, 2));
if (errors.length || failures.length) process.exitCode = 1;
