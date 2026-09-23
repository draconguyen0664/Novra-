import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const widths = [1440, 1280, 1024, 768, 430, 390];
const results = [];
const errors = [];

const readLayers = (page) => page.evaluate(() => {
  const readTransform = (element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return {
      x: Number(matrix.m41.toFixed(2)),
      y: Number(matrix.m42.toFixed(2)),
      scale: Number(Math.hypot(matrix.m11, matrix.m12).toFixed(3)),
      rotation: Number((Math.atan2(matrix.m12, matrix.m11) * 180 / Math.PI).toFixed(2)),
    };
  };
  return [...document.querySelectorAll('.fan-card-motion')].map((card) => {
    const rect = card.getBoundingClientRect();
    return {
      opacity: Number(getComputedStyle(card).opacity),
      zIndex: getComputedStyle(card).zIndex,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      entrance: readTransform(card),
      scroll: readTransform(card.querySelector('.fan-card-parallax')),
      pointer: readTransform(card.querySelector('.fan-card-pointer')),
      hover: readTransform(card.querySelector('.fan-card-hover')),
    };
  });
});

for (const width of widths) {
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
  await page.locator('.fan-card-motion').first().waitFor();
  await page.waitForTimeout(180);
  const early = await readLayers(page);
  await page.waitForTimeout(2200);
  const settled = await readLayers(page);

  const geometry = await page.evaluate(() => ({
    cardCount: document.querySelectorAll('.fan-card-motion').length,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    heroHeight: document.querySelector('.hero')?.getBoundingClientRect().height ?? 0,
  }));

  let hover = null;
  let pointer = null;
  if (width >= 1200) {
    const card = page.locator('.fan-card-motion').nth(2);
    const outerBefore = settled[2].entrance;
    await card.hover({ position: { x: settled[2].rect.width / 2, y: settled[2].rect.height / 2 } });
    await page.waitForTimeout(430);
    const hovered = (await readLayers(page))[2];
    await page.mouse.move(2, 2);
    await page.waitForTimeout(430);
    const restored = (await readLayers(page))[2];
    hover = { outerBefore, hovered, restored };

    const visual = await page.locator('.hero-visual').boundingBox();
    if (visual) {
      await page.mouse.move(visual.x + visual.width * .82, visual.y + visual.height * .28);
      await page.waitForTimeout(650);
      const moved = await readLayers(page);
      await page.mouse.move(2, 2);
      await page.waitForTimeout(650);
      const reset = await readLayers(page);
      pointer = { moved: moved.map((cardState) => cardState.pointer), reset: reset.map((cardState) => cardState.pointer) };
    }
  }

  await page.evaluate(() => scrollTo(0, (document.querySelector('.hero')?.getBoundingClientRect().height ?? 900) * .62));
  await page.waitForTimeout(850);
  const scrolled = await readLayers(page);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(850);
  const reversed = await readLayers(page);

  results.push({ width, geometry, early, settled, hover, pointer, scrolled, reversed });
  await page.close();
}

const failures = results.flatMap((result) => {
  const issues = [];
  const { width, geometry, early, settled, hover, pointer, scrolled, reversed } = result;
  if (geometry.cardCount !== 8) issues.push('card count');
  if (geometry.horizontalOverflow) issues.push('horizontal overflow');
  if (!early.some((card) => card.opacity < .9)) issues.push('missing entrance state');
  if (!settled.every((card) => card.opacity > .99)) issues.push('entrance did not settle');
  if (!scrolled.some((card, index) => Math.abs(card.scroll.x - settled[index].scroll.x) > 2 || Math.abs(card.scroll.y - settled[index].scroll.y) > 2)) issues.push('scroll parallax');
  if (!reversed.every((card) => Math.abs(card.scroll.x) < 1 && Math.abs(card.scroll.y) < 1)) issues.push('scroll reverse');
  if (width >= 1200 && hover) {
    if (!(hover.hovered.hover.y < -10 && hover.hovered.hover.scale > 1.02 && hover.hovered.zIndex === '1000')) issues.push('hover response');
    if (Math.abs(hover.hovered.entrance.x - hover.outerBefore.x) > .5 || Math.abs(hover.hovered.entrance.rotation - hover.outerBefore.rotation) > .5) issues.push('hover overwrote entrance');
    if (Math.abs(hover.restored.hover.y) > .5 || Math.abs(hover.restored.hover.scale - 1) > .01) issues.push('hover restore');
  }
  if (width >= 1200 && pointer) {
    if (!pointer.moved.some((state) => Math.abs(state.x) > 1 || Math.abs(state.y) > 1)) issues.push('mouse parallax');
    if (!pointer.reset.every((state) => Math.abs(state.x) < .5 && Math.abs(state.y) < .5)) issues.push('mouse reset');
  }
  return issues.map((issue) => `${width}: ${issue}`);
});

const summary = results.map((result) => ({
  width: result.width,
  earlyOpacity: result.early.map((card) => card.opacity),
  finalOpacity: result.settled.map((card) => card.opacity),
  scrollY: result.scrolled.map((card) => card.scroll.y),
  reverseMaxError: Math.max(...result.reversed.map((card) => Math.max(Math.abs(card.scroll.x), Math.abs(card.scroll.y)))),
  hover: result.hover && {
    y: result.hover.hovered.hover.y,
    scale: result.hover.hovered.hover.scale,
    zIndex: result.hover.hovered.zIndex,
  },
  pointerMax: result.pointer && Math.max(...result.pointer.moved.map((state) => Math.max(Math.abs(state.x), Math.abs(state.y)))),
  horizontalOverflow: result.geometry.horizontalOverflow,
}));

await browser.close();
console.log(JSON.stringify({ errors, failures, summary }, null, 2));
if (errors.length || failures.length) process.exitCode = 1;
