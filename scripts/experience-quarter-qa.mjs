import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Users/Admin/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe',
});
const labels = ['Experiência', 'Inovação', 'Design', 'Tecnologia'];
const points = [0, .25, .5, .75, 1];
const errors = [];

const reference = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const local = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [name, page] of [['reference', reference], ['local', local]]) {
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`${name}: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`${name}: ${error.message}`));
}
await Promise.all([
  reference.goto('https://wama.com.br/', { waitUntil: 'networkidle', timeout: 90000 }),
  local.goto('http://localhost:3000/', { waitUntil: 'networkidle' }),
]);

const referenceSection = await reference.locator('[data-framer-name="Palavras"]').evaluate((element) => { const rect = element.getBoundingClientRect(); return { top: rect.top + scrollY, height: rect.height }; });
const localSection = await local.locator('#experience').evaluate((element) => { const rect = element.getBoundingClientRect(); return { top: rect.top + scrollY, height: rect.height }; });

const readWords = ({ wordLabels, isLocal }) => {
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
    const words = isLocal ? [...document.querySelectorAll('.experience-word')] : [...document.querySelectorAll('p')];
    const word = words.find((element) => element.textContent?.trim() === label && (isLocal || isActive(element)));
    const selector = isLocal ? '.word-character' : 'span';
    const letters = word ? [...word.querySelectorAll(selector)].filter((element) => element.children.length === 0 && element.textContent?.length === 1) : [];
    const opacity = letters.length ? letters.reduce((sum, letter) => sum + Number(getComputedStyle(letter).opacity), 0) / letters.length : 0;
    return [label, Number(opacity.toFixed(3))];
  }));
};

const forward = {};
for (const progress of points) {
  await Promise.all([
    reference.evaluate((y) => scrollTo(0, y), referenceSection.top + (referenceSection.height - 900) * progress),
    local.evaluate((y) => scrollTo(0, y), localSection.top + (localSection.height - 900) * progress),
  ]);
  await Promise.all([reference.waitForTimeout(350), local.waitForTimeout(350)]);
  forward[progress] = {
    reference: await reference.evaluate(readWords, { wordLabels: labels, isLocal: false }),
    local: await local.evaluate(readWords, { wordLabels: labels, isLocal: true }),
  };
  await Promise.all([
    reference.screenshot({ path: `docs/experience-motion/quarter-reference-${Math.round(progress * 100)}.png` }),
    local.screenshot({ path: `docs/experience-motion/quarter-local-${Math.round(progress * 100)}.png` }),
  ]);
}

const reverse = {};
let maxReverseError = 0;
for (const progress of [...points].reverse()) {
  await local.evaluate((y) => scrollTo(0, y), localSection.top + (localSection.height - 900) * progress);
  await local.waitForTimeout(350);
  reverse[progress] = await local.evaluate(readWords, { wordLabels: labels, isLocal: true });
  for (const label of labels) maxReverseError = Math.max(maxReverseError, Math.abs(reverse[progress][label] - forward[progress].local[label]));
}

const result = { errors, forward, reverse, maxReverseError: Number(maxReverseError.toFixed(4)) };
await fs.writeFile('docs/experience-motion/quarter-comparison.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (errors.length || maxReverseError > .02) process.exitCode = 1;
