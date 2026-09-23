import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const widths = [1440, 1280, 1024, 768, 430, 390];
const expectedIds = ['ai-consultation', 'services', 'selected-projects', 'why-ximitech', 'pricing', 'kho-giao-dien', 'process', 'faq', 'about-ximitech', 'contato'];
const results = [];

for (const width of widths) {
  const errors = [];
  const page = await browser.newPage({
    viewport: { width, height: width <= 430 ? 844 : 900 },
    hasTouch: width <= 430,
    isMobile: width <= 430,
    reducedMotion: 'no-preference',
  });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 90000 });
  await page.locator('.ximi-ai').waitFor();

  const initial = await page.evaluate((ids) => ({
    missingSections: ids.filter((id) => !document.getElementById(id)),
    sectionCount: document.querySelectorAll('.ximi-section').length,
    headingCount: document.querySelectorAll('.ximi-section h2').length,
    pricePanelCount: document.querySelectorAll('.ximi-price-panel').length,
    projectCount: document.querySelectorAll('.ximi-project').length,
    faqCount: document.querySelectorAll('.ximi-faq-item').length,
    capabilityCount: document.querySelectorAll('.ximi-capability').length,
    faqAnswersInDom: [...document.querySelectorAll('.ximi-faq-answer p')].every((item) => (item.textContent || '').trim().length > 20),
    imagesLoaded: [...document.querySelectorAll('.ximi-project img, .ximi-screen-layer img')].every((image) => image.complete && image.naturalWidth > 0),
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
  }), expectedIds);

  await page.locator('.ximi-ai-interface').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  await page.locator('.ximi-suggestions button').filter({ hasText: 'Website bán hàng' }).click();
  const promptValue = await page.locator('#ximi-ai-prompt').inputValue();

  await page.locator('.ximi-capability-list').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.locator('.ximi-capability h3 button').nth(1).click();
  await page.waitForTimeout(480);
  const capability = await page.locator('.ximi-capability').nth(1).evaluate((item) => ({
    expanded: item.querySelector('button')?.getAttribute('aria-expanded'),
    panelHeight: item.querySelector('.ximi-capability-panel')?.getBoundingClientRect().height || 0,
  }));

  await page.locator('.ximi-faq-list').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.locator('.ximi-faq-item h3 button').nth(1).click();
  await page.waitForTimeout(500);
  const faq = await page.locator('.ximi-faq-item').nth(1).evaluate((item) => ({
    expanded: item.querySelector('button')?.getAttribute('aria-expanded'),
    answerHeight: item.querySelector('.ximi-faq-answer')?.getBoundingClientRect().height || 0,
  }));

  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < pageHeight; y += Math.max(600, Math.round(page.viewportSize().height * .8))) {
    await page.evaluate((top) => scrollTo(0, top), y);
    await page.waitForTimeout(45);
  }
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(650);

  const final = await page.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    processFill: getComputedStyle(document.querySelector('.ximi-process-line span')).transform,
    visibleFinalCta: document.querySelector('.ximi-final-cta').getBoundingClientRect().top < innerHeight,
    recommendedVisible: Number(getComputedStyle(document.querySelector('.ximi-price-panel.is-recommended')).opacity) > .98,
    imagesLoaded: [...document.querySelectorAll('.ximi-project img, .ximi-screen-layer img')].every((image) => image.complete && image.naturalWidth > 0),
  }));

  results.push({ width, errors, initial, promptValue, capability, faq, final });
  await page.close();
}

await browser.close();

const failures = results.flatMap((result) => {
  const issues = [];
  if (result.errors.length) issues.push(`console errors: ${result.errors.join(' | ')}`);
  if (result.initial.missingSections.length) issues.push(`missing sections: ${result.initial.missingSections.join(',')}`);
  if (result.initial.sectionCount !== 10 || result.initial.headingCount !== 10) issues.push('section/headline count');
  if (result.initial.pricePanelCount !== 4 || result.initial.projectCount !== 4 || result.initial.faqCount !== 6 || result.initial.capabilityCount !== 4) issues.push('content count');
  if (!result.initial.faqAnswersInDom || !result.final.imagesLoaded) issues.push('SEO text or images');
  if (result.initial.horizontalOverflow || result.final.horizontalOverflow) issues.push('document horizontal overflow');
  if (result.promptValue !== 'Website bán hàng') issues.push('AI suggestion interaction');
  if (result.capability.expanded !== 'true' || result.capability.panelHeight < 20) issues.push('capability accordion');
  if (result.faq.expanded !== 'true' || result.faq.answerHeight < 20) issues.push('FAQ accordion');
  if (result.final.processFill === 'none' || !result.final.visibleFinalCta || !result.final.recommendedVisible) issues.push('scroll motion completion');
  return issues.map((issue) => `${result.width}: ${issue}`);
});

console.log(JSON.stringify({ failures, results }, null, 2));
if (failures.length) process.exitCode = 1;
