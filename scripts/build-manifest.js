import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const OUT = path.join(ROOT, 'public', 'prototypes', 'manifest.json');

const dirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name).sort()
  : [];
const jsx = (p) => fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isFile() && d.name.endsWith('.jsx')).map((d) => d.name).sort();

const prototypes = [];
let errors = 0;
for (const contributorKey of dirs(PROTOS)) {
  for (const id of dirs(path.join(PROTOS, contributorKey))) {
    const dir = path.join(PROTOS, contributorKey, id);
    let meta;
    try {
      meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
    } catch (e) {
      console.error(`[manifest] ${contributorKey}/${id}: missing or invalid meta.json (${e.message})`); errors++; continue;
    }
    if (typeof meta.title !== 'string' || !meta.title.trim()) {
      console.error(`[manifest] ${contributorKey}/${id}: meta.json needs a "title"`); errors++; continue;
    }
    const views = jsx(dir).map((name) => ({ name, group: null }));
    for (const group of dirs(dir).filter((g) => g !== 'components')) {
      for (const name of jsx(path.join(dir, group))) views.push({ name, group });
    }
    prototypes.push({
      id, contributorKey, title: meta.title, description: meta.description ?? '',
      contributor: meta.contributor ?? '', created: meta.created ?? null, views,
    });
  }
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ prototypes }, null, 2) + '\n');
console.log(`[manifest] ${prototypes.length} prototype(s)${errors ? `, ${errors} skipped` : ''}`);
