// Usage: pnpm new "Prototype Name"
// Also used by the app's "New prototype" button in dev (scripts/vite-files-plugin.js).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest } from './build-manifest.js';
import { resolveContributor } from './resolve-contributor.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// "Agent Config" → "agent-config"
export const slugify = (title) => title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Copies scripts/templates/prototype/ into src/prototypes/<key>/<slug>/, fills in meta.json,
// and rebuilds the manifest. Returns { slug, manifest }, or throws a message.
export function createPrototype({ title, description = '', key }) {
  title = (title ?? '').trim();
  if (!title) throw new Error('Give the prototype a title.');
  const slug = slugify(title);
  if (!slug) throw new Error(`Can't make a folder name from "${title}". Use some letters or numbers.`);
  if (!key) throw new Error('You are not in contributors.json. Add yourself first (pnpm join).');
  const dest = path.join(ROOT, 'src', 'prototypes', key, slug);
  if (fs.existsSync(dest)) throw new Error(`src/prototypes/${key}/${slug} already exists. Pick a different title.`);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(path.join(ROOT, 'scripts', 'templates', 'prototype'), dest, { recursive: true });
  const metaPath = path.join(dest, 'meta.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  Object.assign(meta, { title, description: description.trim(), created: today });
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
  return { slug, manifest: buildManifest().manifest };
}

// Run as a script.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const title = process.argv.slice(2).filter((a) => a !== '--').join(' ');
  if (!title.trim()) { console.error('Usage: pnpm new "Prototype Name"'); process.exit(1); }
  const key = resolveContributor();
  try {
    const { slug } = createPrototype({ title, key });
    console.log(`Created src/prototypes/${key}/${slug}/`);
    console.log(`Open it with pnpm dev, at /${key}/${slug}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
