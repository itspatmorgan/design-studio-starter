// Usage: node scripts/build-manifest.js [--strict]   (--strict exits 1 if any meta.json is invalid)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const GUIDE = path.join(ROOT, 'src', 'guide');
const OUT = path.join(ROOT, 'public', 'prototypes', 'manifest.json');
// App page URLs, so they can't be contributor folders. Keep in sync with setup-contributor.js.
const RESERVED_KEYS = new Set(['systems', 'guide']);
// Folder names inside a prototype that aren't view groups (documents/ is set aside for prototype docs).
const NOT_GROUPS = new Set(['components', 'documents']);

const dirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];
const viewFiles = (p) => fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isFile() && /\.[jt]sx$/.test(d.name)).map((d) => d.name).sort();

const prototypes = [];
let errors = 0;
for (const contributorKey of dirs(PROTOS)) {
  if (RESERVED_KEYS.has(contributorKey)) {
    console.error(`[manifest] Skipped src/prototypes/${contributorKey}/: "${contributorKey}" is an app page URL, so it can't be a contributor folder`);
    errors++; continue;
  }
  for (const id of dirs(path.join(PROTOS, contributorKey))) {
    const dir = path.join(PROTOS, contributorKey, id);
    const metaFile = path.relative(ROOT, path.join(dir, 'meta.json'));
    const skip = (why) => { console.error(`[manifest] Skipped ${contributorKey}/${id}: ${metaFile} ${why}`); errors++; };
    if (!fs.existsSync(path.join(dir, 'meta.json'))) { skip('is missing'); continue; }
    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
    } catch (e) {
      skip(`is not valid JSON (${e.message})`); continue;
    }
    if (typeof meta?.title !== 'string' || !meta.title.trim()) { skip('needs a "title"'); continue; }
    const views = viewFiles(dir).map((name) => ({ name, group: null }));
    for (const group of dirs(dir).filter((g) => !NOT_GROUPS.has(g))) {
      for (const name of viewFiles(path.join(dir, group))) views.push({ name, group });
    }
    prototypes.push({
      id, contributorKey, title: meta.title, description: meta.description ?? '',
      contributor: meta.contributor ?? '', created: meta.created ?? null, updated: meta.updated ?? null, views,
    });
  }
}

// Guide pages: src/guide/*.mdx, ordered by `order` in each page's frontmatter.
// Frontmatter is simple `key: value` lines; strings may be quoted.
function frontmatter(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;
  const data = {};
  for (const line of block[1].split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1);
    else if (v === 'true' || v === 'false') v = v === 'true';
    else if (v !== '' && !Number.isNaN(Number(v))) v = Number(v);
    data[m[1]] = v;
  }
  return data;
}
const guide = [];
const guideFiles = fs.existsSync(GUIDE) ? fs.readdirSync(GUIDE).filter((f) => f.endsWith('.mdx')).sort() : [];
for (const file of guideFiles) {
  const fm = frontmatter(fs.readFileSync(path.join(GUIDE, file), 'utf8'));
  const where = `src/guide/${file}`;
  if (!fm || typeof fm.title !== 'string' || !fm.title) { console.error(`[manifest] Skipped ${where}: needs frontmatter with a "title"`); errors++; continue; }
  if (typeof fm.order !== 'number') { console.error(`[manifest] Skipped ${where}: needs a numeric "order" in its frontmatter`); errors++; continue; }
  guide.push({ slug: file.replace(/\.mdx$/, ''), title: fm.title, description: fm.description ?? '', section: fm.section || null, order: fm.order });
}
guide.sort((a, b) => a.order - b.order);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ prototypes, guide: guide.map(({ order, ...page }) => page) }, null, 2) + '\n');
console.log(`[manifest] ${prototypes.length} prototype(s), ${guide.length} guide page(s)${errors ? `, ${errors} skipped` : ''}`);
// pnpm build passes --strict, so a broken meta.json or Guide page fails the build. In dev it's only a warning.
if (errors && process.argv.includes('--strict')) process.exit(1);
