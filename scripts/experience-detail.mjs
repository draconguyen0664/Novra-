import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});
const widths = [1440, 1024, 768, 430, 390];
const labels = ['Experiência', 'Inovação', 'Design', 'Tecnologia'];
const report = {};

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto('https://wama.com.br/', { waitUntil: 'networkidle', timeout: 90000 });
  const section = await page.locator('[data-framer-name="Palavras"]').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top + scrollY, height: rect.height };
  });
  const frames = [];
  for (let step = 0; step <= 10; step++) {
    const progress = step / 10;
    await page.evaluate((y) => scrollTo(0, y), section.top + (section.height - 900) * progress);
    await page.waitForTimeout(350);
    const values = await page.evaluate((wordLabels) => {
      const isActive = (element) => {
        let current = element;
        while (current && current !== document.body) {
          const style = getComputedStyle(current);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          current = current.parentElement;
        }
        return true;
      };
      return Object.fromEntries(wordLabels.map((label) => {
        const word = [...document.querySelectorAll('p')].find((element) => element.textContent?.trim() === label && isActive(element));
        if (!word) return [label, null];
        const letters = [...word.querySelectorAll('span')].filter((element) => element.children.length === 0 && element.textContent?.length === 1);
        const wordRect = word.getBoundingClientRect();
        return [label, {
          rect: { x: wordRect.x, y: wordRect.y, width: wordRect.width, height: wordRect.height },
          mask: (() => { const r = word.parentElement?.parentElement?.parentElement?.getBoundingClientRect(); const s = word.parentElement?.parentElement?.parentElement ? getComputedStyle(word.parentElement.parentElement.parentElement) : null; return r && s ? { x: r.x, y: r.y, width: r.width, height: r.height, overflow: s.overflow } : null; })(),
          letters: letters.map((letter) => {
            const rect = letter.getBoundingClientRect();
            const style = getComputedStyle(letter);
            return { text: letter.textContent, x: rect.x, y: rect.y, opacity: Number(style.opacity), transform: style.transform };
          }),
        }];
      }));
    }, labels);
    frames.push({ progress, values });
  }
  report[width] = { section, frames };
  await page.close();
}

await browser.close();
await fs.writeFile('docs/experience-motion/reference-detail.json', JSON.stringify(report, null, 2));

const translateY = (transform) => {
  const match = transform?.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)/);
  return match ? Number(match[1]) : 0;
};
for (const width of widths) {
  console.log(`\n${width}px — ${report[width].section.height}px`);
  for (const frame of report[width].frames) {
    const row = { progress: frame.progress };
    for (const label of labels) {
      const word = frame.values[label];
      const ys = word.letters.map((letter) => translateY(letter.transform));
      const opacity = word.letters.reduce((sum, letter) => sum + letter.opacity, 0) / word.letters.length;
      row[label] = { y: [Math.round(Math.min(...ys)), Math.round(Math.max(...ys))], opacity: Number(opacity.toFixed(2)) };
    }
    console.log(JSON.stringify(row));
  }
}
