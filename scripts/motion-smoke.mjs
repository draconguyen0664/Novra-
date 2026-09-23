import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

await page.waitForTimeout(320);
const heroEarly = await page.locator('.hero h1').evaluate((element) => Number(getComputedStyle(element).opacity));
await page.waitForTimeout(1100);
const heroLate = await page.locator('.hero h1').evaluate((element) => Number(getComputedStyle(element).opacity));

await page.locator('#clientes').scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
const darkHeader = await page.locator('.site-header').evaluate((element) => element.classList.contains('is-dark'));
const visibleLogos = await page.locator('.client-logo').evaluateAll((elements) => elements.filter((element) => Number(getComputedStyle(element).opacity) > .95).length);

await page.locator('#experience').evaluate((element) => scrollTo(0, element.getBoundingClientRect().top + scrollY + 900));
await page.waitForTimeout(800);
const hiddenHeader = await page.locator('.site-header').evaluate((element) => element.classList.contains('is-hidden'));

await page.locator('#faq').scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
const panels = page.locator('.faq-answer');
const firstBefore = await panels.nth(0).evaluate((element) => element.getBoundingClientRect().height);
await page.locator('.faq-question').nth(1).click();
await page.waitForTimeout(100);
const firstDuring = await panels.nth(0).evaluate((element) => element.getBoundingClientRect().height);
const secondDuring = await panels.nth(1).evaluate((element) => element.getBoundingClientRect().height);
await page.waitForTimeout(420);
const firstAfter = await panels.nth(0).evaluate((element) => element.getBoundingClientRect().height);
const secondAfter = await panels.nth(1).evaluate((element) => element.getBoundingClientRect().height);

await page.locator('.site-footer').scrollIntoViewIfNeeded();
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(900);
const footerOpacity = await page.locator('.footer-wordmark').evaluate((element) => Number(getComputedStyle(element).opacity));

const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const reducedErrors = [];
reduced.on('console', (message) => { if (message.type() === 'error') reducedErrors.push(message.text()); });
reduced.on('pageerror', (error) => reducedErrors.push(error.message));
await reduced.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
const reducedHeroOpacity = await reduced.locator('.hero h1').evaluate((element) => Number(getComputedStyle(element).opacity));
const reducedVisibleWords = await reduced.locator('.experience-word').evaluateAll((elements) => elements.filter((element) => {
  const letters = [...element.querySelectorAll('.word-character')];
  const averageOpacity = letters.reduce((sum, letter) => sum + Number(getComputedStyle(letter).opacity), 0) / letters.length;
  return averageOpacity > .5;
}).length);

const result = {
  errors,
  reducedErrors,
  hero: { earlyOpacity: heroEarly, lateOpacity: heroLate },
  clients: { darkHeader, visibleLogos },
  experience: { hiddenHeader },
  faq: { firstBefore, firstDuring, secondDuring, firstAfter, secondAfter },
  footer: { opacity: footerOpacity },
  reducedMotion: { heroOpacity: reducedHeroOpacity, visibleWords: reducedVisibleWords },
};

console.log(JSON.stringify(result, null, 2));
await browser.close();

if (
  errors.length || reducedErrors.length ||
  !(heroEarly < heroLate && heroLate > .99) ||
  !darkHeader || visibleLogos < 10 || !hiddenHeader ||
  !(firstBefore > firstDuring && firstDuring > firstAfter && secondDuring > 0 && secondAfter > secondDuring) ||
  firstAfter > 1 || secondAfter < 20 || footerOpacity < .99 ||
  reducedHeroOpacity < .99 || reducedVisibleWords !== 1
) process.exitCode = 1;
