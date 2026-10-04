// Usage: pnpm new "Prototype Name"
// Also used by the app's "New prototype" button in dev (scripts/build/vite-files-plugin.js).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest } from '../../../../scripts/build/build-manifest.js';
import { rootOf } from '../../../platform/core/roots.ts';
import { PROTOTYPE_SECTIONS } from '../../../../scripts/lib/modules.js';
import { resolveContributor } from '../../../../scripts/cli/resolve-contributor.js';
import { moveWithLinks, personAddress } from '../../../../scripts/lib/prototype-links.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

// "Agent Config" → "agent-config"
export const slugify = (title) => title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Copies scripts/templates/prototype/ into src/prototypes/<key>/<slug>/,
// fills in meta.json, and rebuilds the manifest. Returns { slug, manifest }, or throws a message.
export function createPrototype({ title, key }) {
  title = (title ?? '').trim();
  if (!title) throw new Error('Add a title.');
  const slug = slugify(title);
  if (!slug) throw new Error('Use at least one letter or number in the title.');
  if (!key) throw new Error("You're not set up as a contributor yet. Ask your agent to add you.");
  const dest = path.join(ROOT, 'src', 'prototypes', key, slug);
  if (fs.existsSync(dest)) throw new Error(`You already have a prototype named “${title}”. Choose a different title.`);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(path.join(ROOT, 'scripts', 'templates', 'prototype'), dest, { recursive: true });
  const metaPath = path.join(dest, 'meta.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  Object.assign(meta, { title, created: today });
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
  return { slug, manifest: buildManifest().manifest };
}

// Changes a prototype's title, and renames its folder to match when the title
// changed ("Checkout Flow" → checkout-flow), so its link follows. Nothing changes if that folder
// name is taken. Returns { id, manifest }, where id is the folder name now, or throws a message.
export function renamePrototype({ key, id, title }) {
  title = (title ?? '').trim();
  if (!title) throw new Error('Add a title.');
  const slug = slugify(title);
  if (!slug) throw new Error('Use at least one letter or number in the title.');
  // An item of a module's section (a section item) has its folder name as its address (/examples/<id>), which people rely on, so it keeps its name.
  const sectionItem = PROTOTYPE_SECTIONS.some((s) => s.key === key);
  const from = path.join(ROOT, 'src', rootOf(key, id));
  const metaFile = path.join(from, 'meta.json');
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  // Only a new title renames a folder named differently from its title.
  const rename = !sectionItem && title !== meta.title && slug !== id;
  const to = path.join(ROOT, 'src', 'prototypes', key, slug);
  if (rename && fs.existsSync(to)) throw new Error(`You already have a prototype in a folder called “${slug}”. Choose a different title.`);
  meta.title = title;
  if (rename) moveWithLinks(from, to, meta, personAddress(key, id), `/prototypes/${key}/${slug}`);
  else fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
  return { id: rename ? slug : id, manifest: buildManifest().manifest };
}

// Run as a script.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const title = process.argv.slice(2).filter((a) => a !== '--').join(' ');
  if (!title.trim()) { console.error('Usage: pnpm new "Prototype Name"'); process.exit(1); }
  const key = resolveContributor();
  try {
    const { slug } = createPrototype({ title, key });
    console.log(`Created src/prototypes/${key}/${slug}/`);
    console.log(`Open it with pnpm dev, at /prototypes/${key}/${slug}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
