import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const modes = ['no-preference', 'reduce'];
const results = {};
const errors = [];

for (const reducedMotion of modes) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion,
  });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${reducedMotion}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${reducedMotion}: ${error.message}`));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  const geometry = await page.locator('#experience').evaluate((section) => {
    const rect = section.getBoundingClientRect();
    const stage = section.querySelector('.experience-stage');
    const spacer = stage?.parentElement;
    return {
      top: rect.top + scrollY,
      height: rect.height,
      hasPinSpacer: Boolean(spacer?.classList.contains('pin-spacer')),
      spacerHeight: spacer?.getBoundingClientRect().height ?? 0,
    };
  });

  const frames = [];
  for (const progress of [0, 0.2, 0.5, 0.8, 1]) {
    await page.evaluate(
      ({ top, height, progress }) => scrollTo(0, top + (height - innerHeight) * progress),
      { ...geometry, progress },
    );
    await page.waitForTimeout(260);
    frames.push(await page.evaluate((progress) => {
      const stage = document.querySelector('.experience-stage');
      const service = document.querySelector('#services');
      const words = [...document.querySelectorAll('.experience-word')].map((word) => {
        const letters = [...word.querySelectorAll('.word-character')];
        const averageOpacity = letters.reduce(
          (sum, letter) => sum + Number(getComputedStyle(letter).opacity),
          0,
        ) / letters.length;
        return Number(averageOpacity.toFixed(2));
      });
      const stageStyle = stage ? getComputedStyle(stage) : null;
      return {
        progress,
        scrollY,
        stageTop: stage?.getBoundingClientRect().top ?? null,
        stagePosition: stageStyle?.position ?? null,
        stageTransform: stageStyle?.transform ?? null,
        serviceTop: service?.getBoundingClientRect().top ?? null,
        words,
      };
    }, progress));
  }

  results[reducedMotion] = { geometry, frames };
  await page.close();
}

await browser.close();

const validates = (entry) => {
  const { geometry, frames } = entry;
  return (
    geometry.hasPinSpacer &&
    Math.abs(geometry.height - 4950) < 2 &&
    Math.abs(geometry.spacerHeight - 4950) < 2 &&
    frames.slice(0, -1).every((frame) => Math.abs(frame.stageTop) < 2) &&
    frames[1].words[0] < 0.8 && frames[1].words[1] > 0.01 &&
    frames[2].words[1] < 0.8 && frames[2].words[2] > 0.01 &&
    frames[3].words[2] < 0.8 && frames[3].words[3] > 0.01 &&
    frames[4].words[3] > 0.95
  );
};

const result = {
  errors,
  modes: results,
  passed: modes.every((mode) => validates(results[mode])),
};

console.log(JSON.stringify(result, null, 2));
if (errors.length || !result.passed) process.exitCode = 1;
