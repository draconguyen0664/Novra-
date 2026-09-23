import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const reference = JSON.parse(await fs.readFile('docs/experience-motion/reference-detail.json', 'utf8'));
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});
const widths = [1440, 1024, 768, 430, 390];
const labels = ['Experiência', 'Inovação', 'Design', 'Tecnologia'];
const report = {};
const errors = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`${width}: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`${width}: ${error.message}`));
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const section = await page.locator('#experience').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top + scrollY, height: rect.height };
  });
  const frames = [];

  for (let step = 0; step <= 10; step++) {
    const progress = step / 10;
    await page.evaluate((y) => scrollTo(0, y), section.top + (section.height - 900) * progress);
    await page.waitForTimeout(220);
    const values = await page.evaluate((wordLabels) => Object.fromEntries(wordLabels.map((label) => {
      const word = [...document.querySelectorAll('.experience-word')].find((element) => element.textContent?.trim() === label);
      const letters = word ? [...word.querySelectorAll('.word-character')] : [];
      const wordRect = word?.getBoundingClientRect();
      return [label, {
        rect: wordRect && { x: wordRect.x, y: wordRect.y, width: wordRect.width, height: wordRect.height },
        letters: letters.map((letter) => {
          const rect = letter.getBoundingClientRect();
          const style = getComputedStyle(letter);
          return { text: letter.textContent, x: rect.x, y: rect.y, opacity: Number(style.opacity), transform: style.transform };
        }),
      }];
    })), labels);
    const headerHidden = await page.locator('.site-header').evaluate((element) => element.classList.contains('is-hidden'));
    frames.push({ progress, values, headerHidden });
    if (width === 1440 && ![.1].includes(progress)) {
      await page.screenshot({ path: `docs/experience-motion/local-v2-1440-${Math.round(progress * 100)}.png` });
    }
  }
  report[width] = { section, frames };
  await page.close();
}
await browser.close();

const translateY = (transform) => {
  const match = transform?.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)/);
  return match ? Number(match[1]) : 0;
};

let samples = 0;
let opacityError = 0;
let yError = 0;
const checkpoints = {};
for (const width of widths) {
  checkpoints[width] = [];
  for (let frameIndex = 0; frameIndex < report[width].frames.length; frameIndex++) {
    const localFrame = report[width].frames[frameIndex];
    const referenceFrame = reference[width].frames[frameIndex];
    const row = { progress: localFrame.progress, headerHidden: localFrame.headerHidden, words: {} };
    for (const label of labels) {
      const localWord = localFrame.values[label];
      const referenceWord = referenceFrame.values[label];
      const lineHeight = referenceWord.rect.height;
      let wordOpacity = 0;
      for (let index = 0; index < localWord.letters.length; index++) {
        const localLetter = localWord.letters[index];
        const referenceLetter = referenceWord.letters[index];
        opacityError += Math.abs(localLetter.opacity - referenceLetter.opacity);
        yError += Math.abs((translateY(localLetter.transform) - translateY(referenceLetter.transform)) / lineHeight);
        wordOpacity += localLetter.opacity;
        samples++;
      }
      row.words[label] = Number((wordOpacity / localWord.letters.length).toFixed(2));
    }
    checkpoints[width].push(row);
  }
}

const result = {
  errors,
  heightMatches: widths.every((width) => Math.abs(report[width].section.height - reference[width].section.height) < 1),
  meanOpacityError: Number((opacityError / samples).toFixed(4)),
  meanNormalizedYError: Number((yError / samples).toFixed(4)),
  checkpoints,
};
await fs.writeFile('docs/experience-motion/local-v2-detail.json', JSON.stringify({ result, report }, null, 2));
console.log(JSON.stringify(result, null, 2));
if (errors.length || !result.heightMatches || result.meanOpacityError > .12 || result.meanNormalizedYError > .14) process.exitCode = 1;
