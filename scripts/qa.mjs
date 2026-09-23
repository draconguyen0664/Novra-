import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const base = 'http://localhost:3000';
await fs.mkdir('docs/qa', { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe' });
const viewports = [[1920,1080],[1440,900],[1366,768],[1280,800],[1024,768],[834,1194],[768,1024],[430,932],[412,915],[390,844],[375,812],[360,800]];
const report = { viewports: [], routes: {}, errors: [] };

for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('console', (message) => { if (message.type() === 'error') report.errors.push(`${width}: ${message.text()}`); });
  page.on('pageerror', (error) => report.errors.push(`${width}: ${error.message}`));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(async () => document.fonts.ready);
  const state = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    h1: document.querySelectorAll('h1').length,
    jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    sections: [...document.querySelectorAll('main > section, body > section, footer')].map((element) => ({ id: element.id, className: element.className, height: Math.round(element.getBoundingClientRect().height) })),
  }));
  report.viewports.push({ width, height, ...state });
  if ([1440,390].includes(width)) {
    await page.screenshot({ path: `docs/qa/home-${width}-top.png` });
    for (const selector of ['#faq','#blog','#contato','footer']) {
      const target = page.locator(selector).first();
      if (await target.count()) { await target.scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await page.screenshot({ path: `docs/qa/${selector.replace(/[^a-z]/g,'')}-${width}.png` }); }
    }
  }
  if (width === 390) {
    const menu = page.getByRole('button', { name: 'Abrir menu' });
    await menu.click();
    state.mobileMenu = await page.locator('#mobile-menu').isVisible();
    await page.keyboard.press('Escape');
    const question = page.locator('.faq-question').nth(1);
    await question.click();
    state.accordion = await question.getAttribute('aria-expanded');
  }
  await page.close();
}

for (const route of ['/robots.txt','/sitemap.xml']) {
  const response = await fetch(base + route);
  report.routes[route] = { status: response.status, body: (await response.text()).slice(0,500) };
}

await browser.close();
await fs.writeFile('docs/qa/report.json', JSON.stringify(report, null, 2));
const failures = report.errors.length || report.viewports.some((item) => item.horizontalOverflow || item.h1 !== 1 || !item.description || !item.canonical || item.jsonLd < 1) || Object.values(report.routes).some((route) => route.status !== 200);
console.log(JSON.stringify({ errors: report.errors.length, failures: Boolean(failures), viewports: report.viewports.map(({width,horizontalOverflow,h1,jsonLd}) => ({width,horizontalOverflow,h1,jsonLd})), routes: report.routes }, null, 2));
if (failures) process.exitCode = 1;
