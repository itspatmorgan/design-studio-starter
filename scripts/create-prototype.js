// Usage: pnpm new "Prototype Name" [--tool]   (--tool starts a tool prototype: see src/handbook/rules/tools.md)
// Also used by the app's "New prototype" button in dev (scripts/vite-files-plugin.js).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest } from './build-manifest.js';
import { TOOLS_KEY } from '../src/studio/roots.ts';
import { parseMaintainers } from '../src/studio/tools.ts';
import { resolveContributor } from './resolve-contributor.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// "Agent Config" → "agent-config"
export const slugify = (title) => title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Copies scripts/templates/prototype/ (or tool/, for a tool prototype) into src/prototypes/<key>/<slug>/,
// fills in meta.json, and rebuilds the manifest. Returns { slug, manifest }, or throws a message.
export function createPrototype({ title, description = '', key, tool = false }) {
  title = (title ?? '').trim();
  if (!title) throw new Error('Add a title.');
  const slug = slugify(title);
  if (!slug) throw new Error('Use at least one letter or number in the title.');
  if (!key) throw new Error("You're not set up as a contributor yet. Ask your agent to add you.");
  const dest = path.join(ROOT, 'src', 'prototypes', key, slug);
  if (fs.existsSync(dest)) throw new Error(`You already have a prototype named “${title}”. Choose a different title.`);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(path.join(ROOT, 'scripts', 'templates', tool ? 'tool' : 'prototype'), dest, { recursive: true });
  const metaPath = path.join(dest, 'meta.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  Object.assign(meta, { title, description: description.trim(), created: today });
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
  return { slug, manifest: buildManifest().manifest };
}

// Changes a prototype's title (and description), and renames its folder to match when the title
// changed ("Checkout Flow" → checkout-flow), so its link follows. Nothing changes if that folder
// name is taken. Returns { id, manifest }, where id is the folder name now, or throws a message.
export function renamePrototype({ key, id, title, description }) {
  title = (title ?? '').trim();
  if (!title) throw new Error('Add a title.');
  const slug = slugify(title);
  if (!slug) throw new Error('Use at least one letter or number in the title.');
  // A tool's folder name is its address (/tools/<id>), which people rely on, so it keeps its name.
  const tool = key === TOOLS_KEY;
  const from = tool ? path.join(ROOT, 'src', 'tools', id) : path.join(ROOT, 'src', 'prototypes', key, id);
  const metaFile = path.join(from, 'meta.json');
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  // Only a new title renames the folder: a description edit leaves it alone, and so does a folder
  // that was named on purpose to be different from its title.
  const rename = !tool && title !== meta.title && slug !== id;
  const to = path.join(ROOT, 'src', 'prototypes', key, slug);
  if (rename && fs.existsSync(to)) throw new Error(`You already have a prototype in a folder called “${slug}”. Choose a different title.`);
  meta.title = title;
  if (description !== undefined) meta.description = String(description).trim();
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
  if (rename) fs.renameSync(from, to);
  return { id: rename ? slug : id, manifest: buildManifest().manifest };
}

// Publishing: a prototype becomes a tool, a team asset in src/tools/<id>/ that its maintainers keep
// (src/studio/tools.ts). The folder moves, so its address changes from /<key>/<id> to /tools/<id>.
// Links to the old address inside the moved files (a canvas embedding one of its views) are
// rewritten to the new one. Links from other prototypes can't be, so they're returned for a
// warning. Unpublishing is the same move back, into the maintainer's own folder.
const LINKED = /\.(excalidraw|md)$/;
const slugChar = '[A-Za-z0-9_%-]';

function filesIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? filesIn(p) : e.isFile() && LINKED.test(e.name) ? [p] : [];
  });
}

// Rewrites links to `from` (an app address like "/patrick/gradient") to `to`, in a folder's canvases and documents.
function rewriteLinks(dir, from, to) {
  const link = new RegExp(`${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!${slugChar})`, 'g');
  for (const file of filesIn(dir)) {
    const text = fs.readFileSync(file, 'utf8');
    const next = text.replace(link, to);
    if (next !== text) fs.writeFileSync(file, next);
  }
}

// The files outside `dir` that link to `address`, as repo-relative paths.
function linkedFrom(dir, address) {
  const link = new RegExp(`${address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!${slugChar})`);
  const roots = [path.join(ROOT, 'src', 'prototypes'), path.join(ROOT, 'src', 'tools')].filter((r) => fs.existsSync(r));
  return roots.flatMap((r) => filesIn(r))
    .filter((f) => !f.startsWith(dir + path.sep) && link.test(fs.readFileSync(f, 'utf8')))
    .map((f) => path.relative(ROOT, f));
}

// Moves your prototype to src/tools/<id>/ with you as its maintainer. Returns { id, linkedFrom, manifest }.
export function publishTool({ key, id }) {
  if (!key) throw new Error("You're not set up as a contributor yet. Ask your agent to add you.");
  const from = path.join(ROOT, 'src', 'prototypes', key, id);
  const to = path.join(ROOT, 'src', 'tools', id);
  if (!fs.existsSync(path.join(from, 'meta.json'))) throw new Error('That prototype no longer exists.');
  if (fs.existsSync(to)) throw new Error(`There's already a tool called “${id}”. Rename your prototype's folder first, then publish it.`);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
  const metaFile = path.join(to, 'meta.json');
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  fs.writeFileSync(metaFile, JSON.stringify({ ...meta, maintainers: [key] }, null, 2) + '\n');
  rewriteLinks(to, `/${key}/${id}`, `/${TOOLS_KEY}/${id}`);
  return { id, linkedFrom: linkedFrom(to, `/${key}/${id}`), manifest: buildManifest().manifest };
}

// Moves a tool you maintain back into your own prototypes. Returns { id, linkedFrom, manifest }.
export function unpublishTool({ key, id }) {
  const from = path.join(ROOT, 'src', 'tools', id);
  const metaFile = path.join(from, 'meta.json');
  if (!fs.existsSync(metaFile)) throw new Error('That tool no longer exists.');
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  const maintainers = parseMaintainers(meta.maintainers);
  if (!key || !maintainers?.includes(key)) throw new Error('Only a maintainer can unpublish a tool.');
  const to = path.join(ROOT, 'src', 'prototypes', key, id);
  if (fs.existsSync(to)) throw new Error(`You already have a prototype called “${id}”. Rename or move that one first.`);
  delete meta.maintainers;
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
  rewriteLinks(to, `/${TOOLS_KEY}/${id}`, `/${key}/${id}`);
  return { id, linkedFrom: linkedFrom(to, `/${TOOLS_KEY}/${id}`), manifest: buildManifest().manifest };
}

// Run as a script.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const tool = args.includes('--tool');
  const title = args.filter((a) => a !== '--tool').join(' ');
  if (!title.trim()) { console.error('Usage: pnpm new "Prototype Name" [--tool]'); process.exit(1); }
  const key = resolveContributor();
  try {
    const { slug } = createPrototype({ title, key, tool });
    console.log(`Created src/prototypes/${key}/${slug}/`);
    console.log(`Open it with pnpm dev, at /${key}/${slug}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
