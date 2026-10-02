// Tools on the dev server (scripts/build/vite-files-plugin.js serves these at POST /__studio/tools/<route>):
// Publish moves one of your prototypes into src/tools/<id>/ with you as its maintainer, and Unpublish moves a
// tool you maintain back into your own prototypes. The folder moves, so its address changes from
// /<key>/<id> to /tools/<id>. Links to the old address inside the moved files (a canvas embedding one of
// its views) are rewritten to the new one. Links from other prototypes can't be, so they're returned for a
// warning (src/platform/modules/tools/staleLinks.ts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildManifest } from '../../../../scripts/build/build-manifest.js';
import { parseMaintainers } from '../../core/permissions.ts';
import type { ModuleServer } from '../../core/modules/index.ts';
import { addressPattern, escapeAddress, linkedFiles, moveWithLinks, personAddress } from '../../../../scripts/lib/prototype-links.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const KEY = 'tools';
const NAME = /^[a-z0-9][a-z0-9._-]*$/i;

// An app address as a pattern: a prototype's is "/prototypes/patrick/gradient", and links saved before prototypes
// moved under /prototypes have just "/patrick/gradient", so both match.
const person = personAddress;
const section = (id: string) => escapeAddress(`/${KEY}/${id}`);

// The files outside `dir` that link to `address` (an address pattern), as repo-relative paths.
function linkedFrom(dir: string, address: string): string[] {
  const link = addressPattern(address);
  const roots = [path.join(ROOT, 'src', 'prototypes'), path.join(ROOT, 'src', KEY)].filter((r) => fs.existsSync(r));
  return roots.flatMap((r) => linkedFiles(r))
    .filter((f) => { link.lastIndex = 0; return !f.startsWith(dir + path.sep) && link.test(fs.readFileSync(f, 'utf8')); })
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
    const metaFile = path.join(from, 'meta.json');
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    moveWithLinks(from, to, { ...meta, maintainers: [me] }, person(me, id), `/${KEY}/${id}`);
    const { manifest } = buildManifest();
    return { body: { contributor: KEY, id, linkedFrom: linkedFrom(to, person(me, id)), manifest }, manifest };
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
    moveWithLinks(from, to, meta, section(id), `/prototypes/${me}/${id}`);
    const { manifest } = buildManifest();
    return { body: { contributor: me, id, linkedFrom: linkedFrom(to, section(id)), manifest }, manifest };
  },
} satisfies ModuleServer;
