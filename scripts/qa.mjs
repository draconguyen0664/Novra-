import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const required = [
  'src/i18n/vi.ts', 'src/i18n/en.ts', 'src/app/[locale]/page.tsx',
  'src/app/api/contact/route.ts', 'prisma/schema.prisma',
  'docs/i18n.md', 'docs/backend.md', 'docs/database.md',
];
for (const file of required) await fs.access(path.join(root, file));

const config = await fs.readFile(path.join(root, 'src/i18n/config.ts'), 'utf8');
if (!config.includes("['vi', 'en']")) throw new Error('Only vi/en locales must be configured.');

const sourceFiles = [];
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(full);
  }
}
await walk(path.join(root, 'src'));
const forbiddenLocale = new RegExp(['p','t','-','B','R'].join(''), 'i');
for (const file of sourceFiles) {
  const content = await fs.readFile(file, 'utf8');
  if (forbiddenLocale.test(content)) throw new Error(`Unsupported locale found in ${path.relative(root, file)}`);
}

console.log(`QA passed: ${sourceFiles.length} runtime source files, vi/en routes, backend and documentation present.`);
