import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const widths = [1440, 1280, 1024, 768, 430, 390];
const results = [];
const errors = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${width}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${width}: ${error.message}`));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  const base = await page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        display: style.display,
        visibility: style.visibility,
      };
    };
    return {
      logo: rect('.brand'),
      nav: rect('.desktop-nav'),
      language: rect('.desktop-language'),
      cta: rect('.animated-button'),
      toggle: rect('.menu-toggle'),
      activeLinks: document.querySelectorAll('.desktop-nav .nav-link[aria-current="location"]').length,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  });

  if (width >= 1200) {
    const firstLink = page.locator('.desktop-nav .nav-link').first();
    await firstLink.hover();
    await page.waitForTimeout(480);
    const roll = await firstLink.evaluate((element) => ({
      track: getComputedStyle(element.querySelector('.nav-track')).transform,
      primary: getComputedStyle(element.querySelector('.nav-text-primary')).transform,
      secondary: getComputedStyle(element.querySelector('.nav-text-secondary')).transform,
      linkSize: { width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height },
    }));

    const trigger = page.locator('.language-trigger');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(240);
    const dropdown = await page.locator('.language-options').evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        opacity: Number(style.opacity),
        visible: style.visibility === 'visible',
        insideViewport: rect.left >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
      };
    });
    await page.keyboard.press('Escape');
    const keyboard = {
      closed: await trigger.getAttribute('aria-expanded') === 'false',
      focusReturned: await trigger.evaluate((element) => document.activeElement === element),
    };

    results.push({ width, mode: 'desktop', base, roll, dropdown, keyboard });
  } else {
    await page.locator('.menu-toggle').click();
    await page.waitForTimeout(80);
    const mobile = await page.evaluate(() => {
      const menu = document.querySelector('.mobile-menu');
      const language = document.querySelector('.mobile-language');
      return {
        menuVisible: Boolean(menu && getComputedStyle(menu).display !== 'none'),
        languageVisible: Boolean(language && getComputedStyle(language).display !== 'none'),
        languageLabels: [...document.querySelectorAll('.mobile-language-options button')].map((button) => button.textContent?.trim()),
        navLinks: document.querySelectorAll('.mobile-navigation .nav-link').length,
      };
    });
    await page.locator('.mobile-language-options button').filter({ hasText: 'EN' }).click();
    const selectedLanguage = await page.locator('.mobile-language-options button[aria-pressed="true"]').textContent();
    await page.keyboard.press('Escape');
    const escapeClosed = await page.locator('.menu-toggle').getAttribute('aria-expanded') === 'false';
    results.push({ width, mode: 'mobile', base, mobile, selectedLanguage: selectedLanguage?.trim(), escapeClosed });
  }

  await page.close();
}

await browser.close();

const failures = results.flatMap((result) => {
  const issues = [];
  const { base } = result;
  if (base.horizontalOverflow) issues.push('horizontal overflow');
  if (!base.logo || !base.cta) issues.push('missing logo or CTA');
  if (base.activeLinks !== 1) issues.push('active nav count');
  if (result.mode === 'desktop') {
    if (base.nav?.display === 'none' || base.language?.display === 'none' || base.toggle?.display !== 'none') issues.push('desktop visibility');
    if (result.roll.track !== 'matrix(1, 0, 0, 1, 0, -24)' || result.roll.primary === 'none' || result.roll.primary === 'matrix(1, 0, 0, 1, 0, 0)' || result.roll.secondary !== 'matrix(1, 0, 0, 1, 0, 0)') issues.push('text roll');
    if (!result.dropdown.visible || result.dropdown.opacity < .99 || !result.dropdown.insideViewport) issues.push('dropdown');
    if (!result.keyboard.closed || !result.keyboard.focusReturned) issues.push('keyboard close');
  } else {
    if (base.nav?.display !== 'none' || base.language?.display !== 'none' || base.toggle?.display === 'none') issues.push('mobile visibility');
    if (!result.mobile.menuVisible || !result.mobile.languageVisible) issues.push('mobile menu language');
    if (result.mobile.languageLabels.join(',') !== 'VI,EN,PT' || result.mobile.navLinks !== 6) issues.push('mobile content');
    if (result.selectedLanguage !== 'EN' || !result.escapeClosed) issues.push('mobile interaction');
  }
  return issues.map((issue) => `${result.width}: ${issue}`);
});

console.log(JSON.stringify({ errors, failures, results }, null, 2));
if (errors.length || failures.length) process.exitCode = 1;
