// Usage: node scripts/build-manifest.js [--strict]   (--strict exits 1 if any meta.json is invalid)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTOTYPE_SYSTEMS, DEFAULT_SYSTEM } from '../src/systems/index.ts';
import { HELPER_FOLDER, itemSlug } from '../src/studio/fileTypes/index.ts';
import { HANDBOOK_KEY, HANDBOOK_SECTIONS } from '../src/studio/roots.ts';
import { FILE_TYPES, fileTypeOf, handbookTypeOf, isTextFile } from './lib/file-types.js';
import { frontmatter } from './lib/frontmatter.js';
import { handbookProblems } from './lib/handbook-check.js';
import { handbookMap } from '../src/studio/handbookMap.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const HANDBOOK = path.join(ROOT, 'src', 'handbook');
const GUIDE = path.join(ROOT, 'src', 'studio', 'guide');
const OUT = path.join(ROOT, 'public', 'prototypes', 'manifest.json');
// App page URLs, so they can't be contributor folders. Keep in sync with setup-contributor.js.
const RESERVED_KEYS = new Set(['systems', 'guide', HANDBOOK_KEY]);

const dirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

// A prototype's items (see src/studio/fileTypes/), in the order the file tree shows them: at each
// level, files first, then folders, each alphabetical. Hidden files and components/ are skipped.
// `typeOf` says which type opens a file (or null for a plain file), and `skip` which folders are
// left out. Links are never followed: a symlink is neither a file nor a folder here.
const inPrototype = { typeOf: (name) => fileTypeOf(name), skip: (name) => name === HELPER_FOLDER };
function itemsIn(dir, base = '', { typeOf, skip } = inPrototype) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
  const byName = (a, b) => a.name.localeCompare(b.name);
  const files = entries.filter((e) => e.isFile()).sort(byName)
    .flatMap((e) => { const fileType = typeOf(e.name, path.join(dir, e.name)); return fileType ? [{ path: base + e.name, fileType }] : []; });
  const folders = entries.filter((e) => e.isDirectory() && !skip(e.name)).sort(byName)
    .flatMap((e) => itemsIn(path.join(dir, e.name), `${base}${e.name}/`, { typeOf, skip }));
  return [...files, ...folders];
}

// In the Handbook, a document opens as a document and every other text file opens as text (a
// script in a skill's folder). Binary and very large files are left out.
const inHandbook = {
  typeOf: (name, file) => { const id = handbookTypeOf(name); return id && (!FILE_TYPES[id].fallback || isTextFile(file)) ? id : null; },
  skip: (name) => name === 'node_modules',
};

// Problems with a folder's items: two sharing a URL, or a file its type rejects (a view needs a
// default export, and so on: src/studio/fileTypes/<type>/type.ts). Printed; returns how many.
function checkItems(dir, items) {
  let errors = 0;
  const seen = new Set();
  for (const item of items) {
    const file = path.relative(ROOT, path.join(dir, item.path));
    if (seen.has(itemSlug(item.path))) { console.error(`[manifest] ${file}: another file here has the same name. Rename one; they'd share a URL.`); errors++; }
    seen.add(itemSlug(item.path));
    const check = FILE_TYPES[item.fileType].check;
    if (check) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      for (const problem of check({ source, frontmatter: frontmatter(source) })) { console.error(`[manifest] ${file}: ${problem}`); errors++; }
    }
  }
  return errors;
}

// Scans src/prototypes/, src/handbook/, and src/studio/guide/, writes public/prototypes/manifest.json, and returns it.
// Problems are printed; errors counts them. The dev server calls this on every change
// (vite-manifest-watch-plugin.js), so it's kept fast: one pass, no subprocesses.
export function buildManifest() {
  // Display names come from contributors.json, so they live in one place.
  const contributorsFile = path.join(ROOT, 'contributors.json');
  const contributors = fs.existsSync(contributorsFile) ? JSON.parse(fs.readFileSync(contributorsFile, 'utf8')) : {};

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
      const items = itemsIn(dir);
      // Two items can't share a URL (main.tsx next to main.jsx or main.md), and each file type checks its own files.
      errors += checkItems(dir, items);
      // "start" (optional) is the item the prototype opens on, as in its URL: "checkout/step-1".
      // Without it, the prototype opens on its first item.
      let start = null;
      if (meta.start !== undefined) {
        start = items.find((i) => itemSlug(i.path) === meta.start)?.path ?? null;
        if (!start) { skip(`has "start": "${meta.start}", which isn't an item in this prototype`); continue; }
      }
      // "system" (optional) is the design system it builds with, from src/systems/index.ts.
      const system = meta.system ?? DEFAULT_SYSTEM;
      if (!(system in PROTOTYPE_SYSTEMS)) { skip(`has "system": "${system}", which isn't in src/systems/index.ts (${Object.keys(PROTOTYPE_SYSTEMS).join(', ')})`); continue; }
      prototypes.push({
        id, contributorKey, title: meta.title, description: meta.description ?? '',
        contributor: contributors[contributorKey]?.name ?? '', created: meta.created ?? null, system, start, items,
      });
    }
  }

  // The Handbook (src/handbook/): a prototype-shaped entry for each section, so the same file tree
  // and item pages open it. Nobody owns it: the app only reads it. Its shape is fixed
  // (scripts/lib/handbook-check.js), and a file or folder out of place is a problem.
  const handbook = [];
  if (fs.existsSync(HANDBOOK)) {
    for (const problem of handbookProblems(HANDBOOK)) { console.error(`[manifest] ${problem}`); errors++; }
    for (const [id, { title, description }] of Object.entries(HANDBOOK_SECTIONS)) {
      const dir = path.join(HANDBOOK, id);
      if (!fs.existsSync(dir)) continue;
      const items = itemsIn(dir, '', inHandbook);
      errors += checkItems(dir, items);
      handbook.push({ id, contributorKey: HANDBOOK_KEY, title, description, contributor: '', created: null, system: DEFAULT_SYSTEM, start: null, items });
    }
  }

  // The Handbook's map: what an agent reads, in order, from AGENTS.md, the rules, and the skills
  // (src/studio/handbookMap.ts). A link to a file that isn't there is a problem; a rule nothing
  // links to is a warning, since no agent will ever read it.
  let map = null;
  if (handbook.length) {
    const rulesDir = path.join(HANDBOOK, 'rules');
    const rules = {};
    const collect = (dir, base = '') => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.')) continue;
        if (e.isDirectory()) collect(path.join(dir, e.name), `${base}${e.name}/`);
        else if (e.isFile() && e.name.endsWith('.md')) rules[base + e.name] = fs.readFileSync(path.join(dir, e.name), 'utf8');
      }
    };
    if (fs.existsSync(rulesDir)) collect(rulesDir);
    const skillsDir = path.join(HANDBOOK, 'skills');
    const skills = fs.existsSync(skillsDir)
      ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.') && fs.existsSync(path.join(skillsDir, e.name, 'SKILL.md')))
        .map((e) => {
          const fm = frontmatter(fs.readFileSync(path.join(skillsDir, e.name, 'SKILL.md'), 'utf8')) ?? {};
          return { folder: e.name, name: String(fm.name ?? e.name), description: String(fm.description ?? '') };
        })
      : [];
    const agentsFile = path.join(ROOT, 'AGENTS.md');
    map = handbookMap({ agents: fs.existsSync(agentsFile) ? fs.readFileSync(agentsFile, 'utf8') : null, rules, skills });
    for (const file of map.missing) { console.error(`[manifest] AGENTS.md links to ${file}, which isn't there. Fix the link, or add the file.`); errors++; }
    for (const rule of map.unrouted) console.warn(`[manifest] src/handbook/rules/${rule}: nothing links to this rule, so no agent will read it. Add a line for it to AGENTS.md.`);
  }

  // Each prototype system's theme.css may only set values under its own class, like
  // .product-theme, so it can't leak into the app UI or another system.
  for (const [id, sys] of Object.entries(PROTOTYPE_SYSTEMS)) {
    const file = path.join(ROOT, sys.dir, 'styles', 'theme.css');
    if (!fs.existsSync(file)) { console.error(`[manifest] ${path.relative(ROOT, file)} is missing (the ${id} system's theme)`); errors++; continue; }
    const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    // Every selector: the text before each "{", skipping at-rules (@media, @layer, ...) and keyframe steps.
    for (const m of css.matchAll(/([^{};]+)\{/g)) {
      const selector = m[1].trim();
      if (selector.startsWith('@') || /^(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*$/.test(selector)) continue;
      const leaks = selector.split(',').map((s) => s.trim()).filter((s) => !s.includes(`.${sys.themeClass}`));
      if (leaks.length) { console.error(`[manifest] ${path.relative(ROOT, file)}: "${leaks.join(', ')}" isn't under .${sys.themeClass}, so it would style the whole app. Put it inside .${sys.themeClass} (or .dark .${sys.themeClass}).`); errors++; }
    }
  }

  // Guide pages: src/studio/guide/*.md, ordered by `order` in each page's frontmatter. They share
  // the title, description, and toc fields with prototype documents, and add order and section.
  const guide = [];
  const guideFiles = fs.existsSync(GUIDE) ? fs.readdirSync(GUIDE).filter((f) => f.endsWith('.md')).sort() : [];
  for (const file of guideFiles) {
    const fm = frontmatter(fs.readFileSync(path.join(GUIDE, file), 'utf8'));
    const where = `src/studio/guide/${file}`;
    if (!fm || typeof fm.title !== 'string' || !fm.title) { console.error(`[manifest] Skipped ${where}: needs frontmatter with a "title"`); errors++; continue; }
    if (typeof fm.order !== 'number') { console.error(`[manifest] Skipped ${where}: needs a numeric "order" in its frontmatter`); errors++; continue; }
    guide.push({ slug: file.replace(/\.md$/, ''), title: fm.title, description: fm.description ?? '', section: fm.section || null, order: fm.order });
  }
  guide.sort((a, b) => a.order - b.order);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const manifest = { prototypes, guide: guide.map(({ order, ...page }) => page), handbook, handbookMap: map };
  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[manifest] ${prototypes.length} prototype(s), ${guide.length} guide page(s), ${handbook.length} handbook section(s)${errors ? `, ${errors} problem(s) above` : ''}`);
  return { manifest, errors };
}

// Run as a script: node scripts/build-manifest.js [--strict]
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors } = buildManifest();
  // pnpm build passes --strict, so a broken meta.json or Guide page fails the build. In dev it's only a warning.
  if (errors && process.argv.includes('--strict')) process.exit(1);
}
