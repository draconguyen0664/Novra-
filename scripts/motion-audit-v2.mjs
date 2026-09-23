import { chromium } from 'playwright';
import fs from 'node:fs/promises';

await fs.mkdir('docs/motion-v2', { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe' });
const targets = {
  reference: 'https://wama.com.br/',
  local: 'http://localhost:3000/',
};
const report = {};

const snapshot = () => {
  const selectors = 'header, h1, #hero p, #hero img, h2, .project-card, #cases a, #services article, #services [data-framer-name^="Item"], .stat-card, #big-numbers [data-framer-name^="Stat Card"], .faq-item, [data-framer-name="FAQs"] > *, .blog-card, [data-framer-name="Blog mini"], .contact-intro, [data-framer-name="Header"], .site-footer';
  return [...document.querySelectorAll(selectors)].slice(0, 100).map((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      tag: element.tagName,
      id: element.id,
      className: typeof element.className === 'string' ? element.className : '',
      name: element.getAttribute('data-framer-name'),
      text: element.textContent?.trim().slice(0, 55),
      x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height),
      opacity: style.opacity, transform: style.transform, clipPath: style.clipPath,
      transition: style.transition, animation: style.animationName,
    };
  });
};

for (const [name, url] of Object.entries(targets)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const started = Date.now();
  const load = [];
  for (const delay of [0, 120, 280, 520, 900, 1500]) {
    const wait = Math.max(0, started + delay - Date.now());
    if (wait) await page.waitForTimeout(wait);
    load.push({ delay, elements: await page.evaluate(snapshot), animations: await page.evaluate(() => document.getAnimations().map((a) => ({ playState: a.playState, currentTime: a.currentTime, target: a.effect?.target?.className || a.effect?.target?.tagName })).slice(0, 100)) });
    if ([280, 900].includes(delay)) await page.screenshot({ path: `docs/motion-v2/${name}-load-${delay}.png` });
  }
  await page.waitForLoadState('networkidle').catch(() => {});
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const scroll = [];
  for (const percent of [0,.1,.25,.5,.75,1,.75,.5,.25,0]) {
    await page.evaluate((y) => scrollTo(0,y), total * percent);
    await page.waitForTimeout(700);
    scroll.push({ percent, y: await page.evaluate(() => scrollY), elements: await page.evaluate(snapshot) });
    if ([.1,.25,.5,.75,1].includes(percent)) await page.screenshot({ path: `docs/motion-v2/${name}-scroll-${Math.round(percent*100)}.png` });
  }
  await page.evaluate(() => scrollTo(0,0));
  const hovers = [];
  for (const selector of ['nav a:nth-of-type(2)', '#cases a', '.blog-card a, [data-framer-name="Blog mini"]', 'footer a, .site-footer a']) {
    const locator = page.locator(selector).first();
    if (!await locator.count()) continue;
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const before = await locator.evaluate((element) => ({ html: element.innerHTML.slice(0,500), values: [...element.querySelectorAll('*')].slice(0,10).map((child) => ({ tag: child.tagName, transform: getComputedStyle(child).transform, opacity: getComputedStyle(child).opacity, color: getComputedStyle(child).color, background: getComputedStyle(child).backgroundColor })) }));
    await locator.hover({ force: true });
    await page.waitForTimeout(450);
    const after = await locator.evaluate((element) => ({ values: [...element.querySelectorAll('*')].slice(0,10).map((child) => ({ tag: child.tagName, transform: getComputedStyle(child).transform, opacity: getComputedStyle(child).opacity, color: getComputedStyle(child).color, background: getComputedStyle(child).backgroundColor })) }));
    hovers.push({ selector, before, after });
  }
  report[name] = { errors, load, scroll, hovers, totalHeight: total + 900 };
  await page.close();
}
await browser.close();
await fs.writeFile('docs/motion-v2/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ reference: { errors: report.reference.errors, height: report.reference.totalHeight }, local: { errors: report.local.errors, height: report.local.totalHeight }, loadAnimations: { reference: report.reference.load.map((x) => x.animations.length), local: report.local.load.map((x) => x.animations.length) }, hovers: { reference: report.reference.hovers.length, local: report.local.hovers.length } }, null, 2));
