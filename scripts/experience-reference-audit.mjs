import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});

const targets = {
  reference: 'https://wama.com.br/',
  local: 'http://localhost:3000/',
};
const widths = [1440, 1024, 768, 430, 390];
const progressPoints = Array.from({ length: 11 }, (_, index) => index / 10);
const words = ['Experiência', 'Inovação', 'Design', 'Tecnologia'];
const report = {};

await fs.mkdir('docs/experience-motion', { recursive: true });

for (const [targetName, url] of Object.entries(targets)) {
  report[targetName] = {};
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(800);

    const section = await page.evaluate((labels) => {
      const exact = (label) => [...document.querySelectorAll('body *')].filter((element) => element.textContent?.trim() === label && ![...element.children].some((child) => child.textContent?.trim() === label));
      const first = exact(labels[0]).find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (!first) return null;
      let current = first.parentElement;
      while (current && current !== document.body) {
        const text = current.textContent || '';
        const rect = current.getBoundingClientRect();
        if (labels.every((label) => text.includes(label)) && rect.height > innerHeight * 2) {
          const style = getComputedStyle(current);
          return {
            selectorHint: current.id || current.getAttribute('data-framer-name') || current.className,
            top: rect.top + scrollY,
            height: rect.height,
            width: rect.width,
            position: style.position,
            overflow: style.overflow,
            html: current.outerHTML.slice(0, 5000),
          };
        }
        current = current.parentElement;
      }
      return null;
    }, words);

    if (!section) {
      report[targetName][width] = { errors, section: null, frames: [] };
      await page.close();
      continue;
    }

    const frames = [];
    for (const progress of progressPoints) {
      const maxTravel = Math.max(1, section.height - 900);
      await page.evaluate((y) => window.scrollTo(0, y), section.top + maxTravel * progress);
      await page.waitForTimeout(550);
      const frame = await page.evaluate((labels) => {
        const matches = labels.flatMap((label) => [...document.querySelectorAll('body *')]
          .filter((element) => element.textContent?.trim() === label && ![...element.children].some((child) => child.textContent?.trim() === label))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const parentStyle = element.parentElement ? getComputedStyle(element.parentElement) : null;
            return {
              label,
              visible: rect.width > 0 && rect.height > 0 && Number(style.opacity) > 0,
              rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
              opacity: style.opacity,
              transform: style.transform,
              clipPath: style.clipPath,
              overflow: style.overflow,
              parentOverflow: parentStyle?.overflow,
              parentTransform: parentStyle?.transform,
              parentPosition: parentStyle?.position,
              parentRect: element.parentElement ? (() => { const r = element.parentElement.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })() : null,
              children: [...element.querySelectorAll(':scope > span')].map((child) => {
                const r = child.getBoundingClientRect();
                const s = getComputedStyle(child);
                return { text: child.textContent, x: r.x, y: r.y, width: r.width, height: r.height, opacity: s.opacity, transform: s.transform, clipPath: s.clipPath };
              }),
            };
          }));
        return { scrollY, matches };
      }, words);
      frames.push({ progress, ...frame });
      if (width === 1440 || [0, .5, 1].includes(progress)) {
        await page.screenshot({ path: `docs/experience-motion/${targetName}-${width}-${Math.round(progress * 100)}.png` });
      }
    }

    report[targetName][width] = { errors, section, frames };
    await page.close();
  }
}

await browser.close();
await fs.writeFile('docs/experience-motion/report.json', JSON.stringify(report, null, 2));

const summary = Object.fromEntries(Object.entries(report).map(([target, sizes]) => [target,
  Object.fromEntries(Object.entries(sizes).map(([width, value]) => [width, {
    errors: value.errors,
    section: value.section && { top: value.section.top, height: value.section.height, position: value.section.position, overflow: value.section.overflow },
    visible: value.frames.map((frame) => ({
      progress: frame.progress,
      labels: frame.matches.filter((match) => match.visible && match.rect.y < 900 && match.rect.y + match.rect.height > 0).map((match) => match.label),
    })),
  }]))
]));
console.log(JSON.stringify(summary, null, 2));
