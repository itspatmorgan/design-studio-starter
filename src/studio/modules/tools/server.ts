// Tools on the dev server (scripts/vite-files-plugin.js serves these at POST /__studio/tools/<route>):
// Publish moves one of your prototypes into src/tools/<id>/ with you as its maintainer, and Unpublish moves a
// tool you maintain back into your own prototypes. The folder moves, so its address changes from
// /<key>/<id> to /tools/<id>. Links to the old address inside the moved files (a canvas embedding one of
// its views) are rewritten to the new one. Links from other prototypes can't be, so they're returned for a
// warning (src/studio/modules/tools/staleLinks.ts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest } from '../../../../scripts/build-manifest.js';
import { parseMaintainers } from '../../permissions.ts';
import type { ModuleServer } from '../index.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const KEY = 'tools';
const NAME = /^[a-z0-9][a-z0-9._-]*$/i;
const LINKED = /\.(excalidraw|md)$/;
const slugChar = '[A-Za-z0-9_%-]';
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function filesIn(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith('.')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? filesIn(p) : e.isFile() && LINKED.test(e.name) ? [p] : [];
  });
}

// Rewrites links to `from` (an app address like "/patrick/gradient") to `to`, in a folder's canvases and documents.
function rewriteLinks(dir: string, from: string, to: string) {
  const link = new RegExp(`${escape(from)}(?!${slugChar})`, 'g');
  for (const file of filesIn(dir)) {
    const text = fs.readFileSync(file, 'utf8');
    const next = text.replace(link, to);
    if (next !== text) fs.writeFileSync(file, next);
  }
}

// The files outside `dir` that link to `address`, as repo-relative paths.
function linkedFrom(dir: string, address: string): string[] {
  const link = new RegExp(`${escape(address)}(?!${slugChar})`);
  const roots = [path.join(ROOT, 'src', 'prototypes'), path.join(ROOT, 'src', KEY)].filter((r) => fs.existsSync(r));
  return roots.flatMap((r) => filesIn(r))
    .filter((f) => !f.startsWith(dir + path.sep) && link.test(fs.readFileSync(f, 'utf8')))
    .map((f) => path.relative(ROOT, f));
}

const idOf = (body: unknown): string => {
  const prototype = (body as { prototype?: unknown })?.prototype;
  if (typeof prototype !== 'string' || !NAME.test(prototype)) throw new Error('Say which prototype.');
  return prototype;
};

export default {
  // Moves your prototype to src/tools/<id>/ with you as its maintainer.
  publish({ me, body }) {
    const id = idOf(body);
    if (!me) throw new Error("You're not set up as a contributor yet. Ask your agent to add you.");
    const from = path.join(ROOT, 'src', 'prototypes', me, id);
    const to = path.join(ROOT, 'src', KEY, id);
    if (!fs.existsSync(path.join(from, 'meta.json'))) throw new Error('That prototype no longer exists.');
    if (fs.existsSync(to)) throw new Error(`There's already a tool called “${id}”. Rename your prototype's folder first, then publish it.`);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
    const metaFile = path.join(to, 'meta.json');
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    fs.writeFileSync(metaFile, JSON.stringify({ ...meta, maintainers: [me] }, null, 2) + '\n');
    rewriteLinks(to, `/${me}/${id}`, `/${KEY}/${id}`);
    const { manifest } = buildManifest();
    return { body: { contributor: KEY, id, linkedFrom: linkedFrom(to, `/${me}/${id}`), manifest }, manifest };
  },

  // Moves a tool you maintain back into your own prototypes.
  unpublish({ me, body }) {
    const id = idOf(body);
    const from = path.join(ROOT, 'src', KEY, id);
    const metaFile = path.join(from, 'meta.json');
    if (!fs.existsSync(metaFile)) throw new Error('That tool no longer exists.');
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    const maintainers = parseMaintainers(meta.maintainers);
    if (!me || !maintainers?.includes(me)) throw new Error('Only a maintainer can unpublish a tool.');
    const to = path.join(ROOT, 'src', 'prototypes', me, id);
    if (fs.existsSync(to)) throw new Error(`You already have a prototype called “${id}”. Rename or move that one first.`);
    delete meta.maintainers;
    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
    rewriteLinks(to, `/${KEY}/${id}`, `/${me}/${id}`);
    const { manifest } = buildManifest();
    return { body: { contributor: me, id, linkedFrom: linkedFrom(to, `/${KEY}/${id}`), manifest }, manifest };
  },
} satisfies ModuleServer;
