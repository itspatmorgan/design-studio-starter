// Usage: node scripts/build-manifest.js [--strict]   (--strict exits 1 if any meta.json is invalid)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const OUT = path.join(ROOT, 'public', 'prototypes', 'manifest.json');

const dirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name).sort()
  : [];
const viewFiles = (p) => fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isFile() && /\.[jt]sx$/.test(d.name)).map((d) => d.name).sort();

const prototypes = [];
let errors = 0;
for (const contributorKey of dirs(PROTOS)) {
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
    for (const group of dirs(dir).filter((g) => g !== 'components')) {
      for (const name of viewFiles(path.join(dir, group))) views.push({ name, group });
    }
    prototypes.push({
      id, contributorKey, title: meta.title, description: meta.description ?? '',
      contributor: meta.contributor ?? '', created: meta.created ?? null, updated: meta.updated ?? null, views,
    });
  }
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ prototypes }, null, 2) + '\n');
console.log(`[manifest] ${prototypes.length} prototype(s)${errors ? `, ${errors} skipped` : ''}`);
// pnpm build passes --strict, so a broken meta.json fails the build. In dev it's only a warning.
if (errors && process.argv.includes('--strict')) process.exit(1);
