// Usage: node scripts/build/build-manifest.js [--strict] [--deploy]
//   --strict  exits 1 if any meta.json is invalid
//   --deploy  leaves archived prototypes and views out (src/studio/core/archive.ts), for the deployed site
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTOTYPE_SYSTEMS, DEFAULT_SYSTEM, SYSTEM_SOURCES } from '../../src/studio/modules/systems/node/systems.js';
import { STUDIO_ID } from '../../src/studio/modules/systems/sources.ts';
import { isHelper, itemSlug } from '../../src/studio/fileTypes/index.ts';
import { HANDBOOK_KEY, HANDBOOK_SECTIONS, rootOf } from '../../src/studio/core/roots.ts';
import { STATUSES, forDeploy, linksToArchived, parseStatus } from '../../src/studio/core/archive.ts';
import { byOrder, parseOrder } from '../../src/studio/core/order.ts';
import { parseMaintainers } from '../../src/studio/core/permissions.ts';
import { FILE_TYPES, fileTypeOf, handbookTypeOf, isTextFile } from '../lib/file-types.js';
import { ENABLED_MODULES, MODULES, PROTOTYPE_SECTIONS, SECTION_KEYS } from '../lib/modules.js';
import { frontmatter } from '../lib/frontmatter.js';
import { contributorsSignature, loadContributors } from '../lib/contributors.js';
import { handbookProblems } from '../lib/handbook-check.js';
import { systemDocs } from '../../src/studio/modules/systems/node/docs.js';
import { themeTokens } from '../../src/studio/modules/systems/themeTokens.ts';
import { handbookMap } from '../../src/studio/handbookMap.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');
const HANDBOOK = path.join(ROOT, 'src', 'handbook');
// The Guide's pages, or null when its module is off or not installed.
const guideModule = ENABLED_MODULES.find((m) => m.id === 'guide');
const GUIDE = guideModule?.section?.folder ? path.join(ROOT, guideModule.section.folder) : null;
const OUT_DIR = path.join(ROOT, 'public', 'prototypes');
const OUT = path.join(OUT_DIR, 'manifest.json');
// Each prototype's items, one file each: items/<contributor>/<prototype>.json. The app fetches a
// prototype's when it opens it, so the manifest every visitor downloads stays small however many
// files prototypes hold.
const ITEMS_DIR = path.join(OUT_DIR, 'items');
// How many component doc gaps the build lists before summarizing the rest.
const DOC_WARNINGS = 5;

const dirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

// A prototype's items (see src/studio/fileTypes/), in the order the file tree shows them: at each
// level, files first, then folders, each alphabetical, unless meta.json "order" says otherwise
// (src/studio/core/order.ts). Hidden files and helpers (names starting with an underscore) are skipped.
// `typeOf` says which type opens a file (or null for a plain file), and `skip` which folders are
// left out. Links are never followed: a symlink is neither a file nor a folder here.
const inPrototype = { typeOf: (name) => (isHelper(name) ? null : fileTypeOf(name)), skip: isHelper };
function itemsIn(dir, base = '', { typeOf, skip, order } = inPrototype) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
  const files = entries.filter((e) => e.isFile()).flatMap((e) => {
    const fileType = typeOf(e.name, path.join(dir, e.name));
    return fileType ? [{ name: e.name, path: base + e.name, dir: false, fileType }] : [];
  });
  const folders = entries.filter((e) => e.isDirectory() && !skip(e.name)).map((e) => ({ name: e.name, path: base + e.name, dir: true }));
  return byOrder([...files, ...folders], order).flatMap((e) => (e.dir
    ? itemsIn(path.join(dir, e.name), `${e.path}/`, { typeOf, skip, order })
    : [{ path: e.path, fileType: e.fileType }]));
}

// In the Handbook, a document opens as a document and every other text file opens as text (a
// script in a skill's folder). Binary and very large files are left out.
const inHandbook = {
  typeOf: (name, file) => { const id = handbookTypeOf(name); return id && (!FILE_TYPES[id].fallback || isTextFile(file)) ? id : null; },
  skip: (name) => name === 'node_modules',
};

// Problems with a folder's items: two sharing a URL, or a file its type rejects (a view needs a
// default export, and so on: src/studio/fileTypes/<type>/type.ts). Printed; returns how many.
function checkItems(dir, items, out = console, prototype) {
  let errors = 0;
  const seen = new Set();
  for (const item of items) {
    const file = path.relative(ROOT, path.join(dir, item.path));
    if (seen.has(itemSlug(item.path))) { out.error(`[manifest] ${file}: another file here has the same name. Rename one; they'd share a URL.`); errors++; }
    seen.add(itemSlug(item.path));
    const { check, fidelity } = FILE_TYPES[item.fileType];
    if (!check && !fidelity) continue;
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
    if (check) {
      for (const problem of check({ source, frontmatter: frontmatter(source), prototype })) { out.error(`[manifest] ${file}: ${problem}`); errors++; }
    }
    if (fidelity?.isLofi(source)) item.lofi = true;
  }
  return errors;
}

// Canvases and documents that stay on the deployed site but link to an archived prototype, which
// isn't there. `archived` is forDeploy's list of what it left out (paths in the app's file globs).
// Returns a sentence for each such file.
function archivedLinkWarnings(kept, archived) {
  const prototypes = archived.map((g) => g.replace(/^\/prototypes/, '').slice(0, -3).split('/').map(encodeURIComponent).join('/'));
  const warnings = [];
  for (const proto of kept) {
    for (const item of proto.items) {
      // Views are code: a link in one is the author's own business.
      if (FILE_TYPES[item.fileType].language === 'tsx') continue;
      const file = path.join(ROOT, 'src', rootOf(proto.contributorKey, proto.id), item.path);
      let text;
      try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
      const linked = linksToArchived(text, prototypes);
      if (linked.length) warnings.push(`[manifest] ${path.relative(ROOT, file)} links to an archived prototype (${linked.map((p) => decodeURIComponent(p).replace(/^\//, '')).join(', ')}). The deployed site shows a placeholder there.`);
    }
  }
  return warnings;
}

// Reads one prototype's folder (a person's in src/prototypes/, or an item of a module's section, like a tool
// in src/tools/) into its manifest entry, or null when it can't be used. Problems are printed; `errors` counts
// them. A section whose policy is "maintainers" lists them in each item's meta.json.
function readPrototype(dir, contributorKey, id, out, contributors, policy = 'owner') {
  const maintained = policy === 'maintainers';
  let errors = 0;
  const metaFile = path.relative(ROOT, path.join(dir, 'meta.json'));
  const skip = (why) => { out.error(`[manifest] Skipped ${contributorKey}/${id}: ${metaFile} ${why}`); errors++; return { entry: null, errors }; };
  if (!fs.existsSync(path.join(dir, 'meta.json'))) return skip('is missing');
  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  } catch (e) {
    return skip(`is not valid JSON (${e.message})`);
  }
  if (typeof meta?.title !== 'string' || !meta.title.trim()) return skip('needs a "title"');
  // "maintainers" (required where the section's policy is maintainers): the contributors.json keys of the people who may change it.
  let maintainers;
  if (maintained) {
    maintainers = parseMaintainers(meta.maintainers);
    if (!maintainers) return skip('needs "maintainers": a list with at least one contributor key, like ["patrick"]');
    for (const key of maintainers) if (!(key in contributors)) out.warn(`[manifest] ${metaFile}: maintainer "${key}" isn't in contributors.json`);
  }
  // "order" (optional) lists paths to put first, in sequence (src/studio/core/order.ts).
  let order;
  if (meta.order !== undefined) {
    order = parseOrder(meta.order);
    if (!order) return skip('has an "order" that isn\'t a list of paths');
  }
  const items = itemsIn(dir, '', { ...inPrototype, order });
  // Two items can't share a URL (main.tsx next to main.jsx or main.md), and each file type checks its own files.
  errors += checkItems(dir, items, out, { contributor: contributorKey, id });
  // "start" (optional) is the item the prototype opens on, as in its URL: "checkout/step-1".
  // Without it, the prototype opens on its first item.
  let start = null;
  if (meta.start !== undefined) {
    start = items.find((i) => itemSlug(i.path) === meta.start)?.path ?? null;
    if (!start) return skip(`has "start": "${meta.start}", which isn't an item in this prototype`);
  }
  // "system" (optional) is the design system it builds with, one of the folders in src/systems/.
  const system = meta.system ?? DEFAULT_SYSTEM;
  if (!(system in PROTOTYPE_SYSTEMS)) return skip(`has "system": "${system}", which isn't a folder in src/systems/ (${Object.keys(PROTOTYPE_SYSTEMS).join(', ')})`);
  // "status" (optional) is 'active' (the default) or 'archived'.
  let status = null;
  if (meta.status !== undefined) {
    status = parseStatus(meta.status);
    if (!status) return skip(`has "status": ${JSON.stringify(meta.status)}, which isn't one of ${STATUSES.join(', ')}`);
  }
  return {
    errors,
    entry: {
      id, contributorKey, title: meta.title, description: meta.description ?? '',
      contributor: maintained ? maintainers.map((k) => contributors[k]?.name ?? k).join(', ') : contributors[contributorKey]?.name ?? '',
      created: meta.created ?? null, system, start, items,
      ...(maintained && { maintainers }),
      ...(status === 'archived' && { status }),
    },
  };
}

// Writes a file only when its text changes, so a dev server doesn't see files it already has as new. What was last
// written is remembered, so a rebuild with thousands of unchanged files checks that each exists and reads none of them.
const written = new Map();
function writeIfChanged(file, text) {
  const exists = fs.existsSync(file);
  if (exists && (written.get(file) === text || fs.readFileSync(file, 'utf8') === text)) { written.set(file, text); return; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  written.set(file, text);
}

// The dev server rebuilds the manifest on every change, and nearly all of it is unchanged prototypes. So a prototype's
// entry is kept between builds, along with what reading it printed, and reused while nothing in its folder has changed
// (each file's name, modified time and size) or any contributor has (their names are in the entries).
const cache = new Map();
let cachedFor = '';
function signatureOf(dir) {
  const parts = [];
  const visit = (abs, base) => {
    let entries;
    try { entries = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name === 'node_modules') continue;
      if (e.isDirectory()) { parts.push(`${base}${e.name}/`); visit(path.join(abs, e.name), `${base}${e.name}/`); }
      else if (e.isFile()) { const s = fs.statSync(path.join(abs, e.name)); parts.push(`${base}${e.name}:${s.mtimeMs}:${s.size}`); }
    }
  };
  visit(dir, '');
  return parts.join('\n');
}

// Writes the manifest the app fetches: prototypes without their items (with how many, and a hash
// of them so a changed list is fetched again), and each prototype's items in its own file. The
// Handbook's sections are few, so theirs stay in the manifest. Files for prototypes that are gone are removed.
function writeManifest(manifest) {
  const wanted = new Set();
  const split = ({ items, ...info }) => {
    const text = JSON.stringify(items);
    const file = path.join(ITEMS_DIR, info.contributorKey, `${info.id}.json`);
    wanted.add(file);
    writeIfChanged(file, text);
    return { ...info, itemCount: items.length, itemsHash: crypto.createHash('sha1').update(text).digest('hex').slice(0, 8) };
  };
  const prototypes = manifest.prototypes.map(split);
  const sections = Object.fromEntries(Object.entries(manifest.sections).map(([key, items]) => [key, items.map(split)]));
  for (const dir of fs.existsSync(ITEMS_DIR) ? fs.readdirSync(ITEMS_DIR, { withFileTypes: true }) : []) {
    if (!dir.isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(ITEMS_DIR, dir.name))) {
      if (!wanted.has(path.join(ITEMS_DIR, dir.name, f))) fs.rmSync(path.join(ITEMS_DIR, dir.name, f), { force: true });
    }
    if (!fs.readdirSync(path.join(ITEMS_DIR, dir.name)).length) fs.rmdirSync(path.join(ITEMS_DIR, dir.name));
  }
  writeIfChanged(OUT, JSON.stringify({ ...manifest, prototypes, sections }) + '\n');
}

// Scans src/prototypes/, src/handbook/, and src/studio/guide/, writes public/prototypes/ (manifest.json, and items/), and returns the whole manifest.
// Problems are printed; errors counts them. The dev server calls this on every change
// (vite-manifest-watch-plugin.js), so it's kept fast: one pass, no subprocesses.
// Options: `deploy` leaves archived prototypes and views out (see src/studio/core/archive.ts), `write: false`
// skips writing the file, and `quiet` prints nothing. `touched` is the files the dev server saw change since the last
// build: a prototype with none of them is reused without a look at its files, so a rebuild costs what changed, not
// how many prototypes there are. `archived` in the result lists what deploy
// leaves out, as paths in the app's file globs (scripts/build/vite-globs-plugin.js).
export function buildManifest({ deploy = false, write = true, quiet = false, touched: touchedPaths } = {}) {
  // Only trusted if every path is inside this repo as this script sees it. A path spelled another way (a linked folder)
  // could look unrelated to a prototype that did change, so then nothing is assumed unchanged.
  const touched = touchedPaths?.every((f) => path.resolve(f).startsWith(ROOT + path.sep)) ? touchedPaths.map((f) => path.resolve(f)) : undefined;
  const out = quiet ? { log() {}, warn() {}, error() {} } : console;
  // Display names come from the contributors (contributors.json, and contributors/<key>.json), so they live in one place.
  const contributors = loadContributors();

  const prototypes = [];
  // Items of the modules' sections of prototype-shaped folders, by section key (tools).
  const sections = Object.fromEntries(PROTOTYPE_SECTIONS.map((s) => [s.key, []]));
  let errors = 0;
  const people = contributorsSignature();
  if (people !== cachedFor) { cache.clear(); cachedFor = people; }
  const seen = new Set();
  const read = (dir, contributorKey, id, policy) => {
    const key = `${contributorKey}/${id}`;
    seen.add(key);
    let hit = cache.get(key);
    const unchanged = hit && hit.policy === policy && touched && !touched.some((f) => f === dir || f.startsWith(dir + path.sep));
    const signature = unchanged ? hit.signature : signatureOf(dir);
    if (!hit || hit.signature !== signature || hit.policy !== policy) {
      const messages = [];
      const sink = Object.fromEntries(['log', 'warn', 'error'].map((level) => [level, (text) => messages.push([level, text])]));
      hit = { signature, policy, messages, ...readPrototype(dir, contributorKey, id, sink, contributors, policy) };
      cache.set(key, hit);
    }
    for (const [level, text] of hit.messages) out[level](text);
    errors += hit.errors;
    return hit.entry;
  };
  for (const contributorKey of dirs(PROTOS)) {
    if (SECTION_KEYS.has(contributorKey)) {
      out.error(`[manifest] Skipped src/prototypes/${contributorKey}/: "${contributorKey}" is an app page URL, so it can't be a contributor folder`);
      errors++; continue;
    }
    for (const id of dirs(path.join(PROTOS, contributorKey))) {
      const entry = read(path.join(PROTOS, contributorKey, id), contributorKey, id);
      if (entry) prototypes.push(entry);
    }
  }
  // A module's section of prototype-shaped folders (src/tools/<id>/, the tools the team has published): shaped
  // the same, one folder per id, with maintainers where the section's policy says so.
  for (const section of PROTOTYPE_SECTIONS) {
    for (const id of dirs(section.dir)) {
      const entry = read(path.join(section.dir, id), section.key, id, section.policy);
      if (entry) sections[section.key].push(entry);
    }
  }

  for (const key of cache.keys()) if (!seen.has(key)) cache.delete(key);

  // The Handbook (src/handbook/): a prototype-shaped entry for each section, so the same file tree
  // and item pages open it. Nobody owns it: the app only reads it. Its shape is fixed
  // (scripts/lib/handbook-check.js), and a file or folder out of place is a problem.
  const handbook = [];
  if (fs.existsSync(HANDBOOK)) {
    for (const problem of handbookProblems(HANDBOOK)) { out.error(`[manifest] ${problem}`); errors++; }
    for (const [id, { title, description }] of Object.entries(HANDBOOK_SECTIONS)) {
      const dir = path.join(HANDBOOK, id);
      if (!fs.existsSync(dir)) continue;
      const items = itemsIn(dir, '', inHandbook);
      errors += checkItems(dir, items, out);
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
    for (const file of map.missing) { out.error(`[manifest] AGENTS.md links to ${file}, which isn't there. Fix the link, or add the file.`); errors++; }
    // A rule that belongs to a module that is off is meant to be unrouted: AGENTS.md leaves it out (pnpm studio sync).
    const offRules = new Set(Object.values(MODULES).filter((m) => m && !ENABLED_MODULES.includes(m)).flatMap((m) => (m.handbook ?? []).map((h) => h.path)));
    for (const rule of map.unrouted.filter((r) => !offRules.has(`rules/${r}`))) out.warn(`[manifest] src/handbook/rules/${rule}: nothing links to this rule, so no agent will read it. Add a line for it to AGENTS.md.`);
  }

  // Each prototype system's theme.css may only set values under its own class, like
  // .product-theme, so it can't leak into the app UI or another system.
  for (const [id, sys] of Object.entries(PROTOTYPE_SYSTEMS)) {
    const file = path.join(ROOT, sys.dir, 'styles', 'theme.css');
    if (!fs.existsSync(file)) { out.error(`[manifest] ${path.relative(ROOT, file)} is missing (the ${id} system's theme)`); errors++; continue; }
    const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    // Every selector: the text before each "{", skipping at-rules (@media, @layer, ...) and keyframe steps.
    for (const m of css.matchAll(/([^{};]+)\{/g)) {
      const selector = m[1].trim();
      if (selector.startsWith('@') || /^(from|to|[\d.]+%)(\s*,\s*(from|to|[\d.]+%))*$/.test(selector)) continue;
      const leaks = selector.split(',').map((s) => s.trim()).filter((s) => !s.includes(`.${sys.themeClass}`));
      if (leaks.length) { out.error(`[manifest] ${path.relative(ROOT, file)}: "${leaks.join(', ')}" isn't under .${sys.themeClass}, so it would style the whole app. Put it inside .${sys.themeClass} (or .dark .${sys.themeClass}).`); errors++; }
    }
  }

  // Each system's components and tokens, for the Systems pages, and what its component pages lack
  // (src/studio/modules/systems/docs.ts, themeTokens.ts). The app's own system (Studio) is one of them. By
  // default a gap is a warning, and the first few are listed; docs: 'strict' fails the build and
  // 'off' says nothing.
  if (STUDIO_ID in PROTOTYPE_SYSTEMS) { out.error(`[manifest] src/systems/${STUDIO_ID}/: "${STUDIO_ID}" is the app's own system, so a prototype system can't use that name`); errors++; }
  const systems = {};
  for (const [id, sys] of Object.entries(SYSTEM_SOURCES)) {
    const dir = path.join(ROOT, sys.components);
    const { components, problems } = systemDocs(dir);
    const themeFile = path.join(ROOT, sys.theme);
    const tokens = fs.existsSync(themeFile) ? themeTokens(fs.readFileSync(themeFile, 'utf8'), sys.scope) : [];
    systems[id] = { docs: sys.docs, origin: sys.origin, components, tokens };
    if (sys.docs === 'off') continue;
    const lines = problems.map((p) => `${path.relative(ROOT, path.join(dir, p.file))}: ${p.message}`);
    if (sys.docs === 'strict') { for (const line of lines) out.error(`[manifest] ${line}`); errors += lines.length; }
    else {
      for (const line of lines.slice(0, DOC_WARNINGS)) out.warn(`[manifest] ${line}`);
      if (lines.length > DOC_WARNINGS) out.warn(`[manifest] ${id}: and ${lines.length - DOC_WARNINGS} more component doc gap(s). Set docs: 'strict' in the system's system.ts to fail the build on them.`);
    }
  }

  // Guide pages: src/studio/guide/*.md, ordered by `order` in each page's frontmatter. They share
  // the title, description, and toc fields with prototype documents, and add order and section.
  const guide = [];
  const guideFiles = GUIDE && fs.existsSync(GUIDE) ? fs.readdirSync(GUIDE).filter((f) => f.endsWith('.md')).sort() : [];
  for (const file of guideFiles) {
    const fm = frontmatter(fs.readFileSync(path.join(GUIDE, file), 'utf8'));
    const where = `src/studio/guide/${file}`;
    if (!fm || typeof fm.title !== 'string' || !fm.title) { out.error(`[manifest] Skipped ${where}: needs frontmatter with a "title"`); errors++; continue; }
    if (typeof fm.order !== 'number') { out.error(`[manifest] Skipped ${where}: needs a numeric "order" in its frontmatter`); errors++; continue; }
    guide.push({ slug: file.replace(/\.md$/, ''), title: fm.title, description: fm.description ?? '', section: fm.section || null, order: fm.order });
  }
  guide.sort((a, b) => a.order - b.order);

  // What the deployed site leaves out (src/studio/core/archive.ts).
  const { kept, archived } = forDeploy([...prototypes, ...Object.values(sections).flat()]);
  const keptPrototypes = kept.filter((p) => !(p.contributorKey in sections));
  const keptSections = Object.fromEntries(Object.keys(sections).map((key) => [key, kept.filter((p) => p.contributorKey === key)]));

  // A canvas or document that stays on the deployed site but links to an archived prototype would show
  // a placeholder there: say which, so the link can be fixed or the prototype unarchived. Never an error.
  if (deploy && archived.length) {
    const links = archivedLinkWarnings(kept, archived);
    for (const line of links.slice(0, DOC_WARNINGS)) out.warn(line);
    if (links.length > DOC_WARNINGS) out.warn(`[manifest] and ${links.length - DOC_WARNINGS} more file(s) that link to an archived prototype.`);
  }

  const manifest = { prototypes: deploy ? keptPrototypes : prototypes, sections: deploy ? keptSections : sections, guide: guide.map(({ order, ...page }) => page), handbook, handbookMap: map, systems };
  if (write) writeManifest(manifest);
  out.log(`[manifest] ${manifest.prototypes.length} prototype(s), ${Object.entries(manifest.sections).map(([key, items]) => `${items.length} in ${key}`).join(', ') || 'no sections'}, ${guide.length} guide page(s), ${handbook.length} handbook section(s)${errors ? `, ${errors} problem(s) above` : ''}`);
  if (deploy && archived.length) out.log(`[manifest] Left out of the deployed site: ${archived.length} archived prototype(s)`);
  return { manifest, errors, archived: deploy ? archived : [] };
}

// Run as a script: node scripts/build/build-manifest.js [--strict]
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors } = buildManifest({ deploy: process.argv.includes('--deploy') });
  // pnpm build passes --strict, so a broken meta.json or Guide page fails the build. In dev it's only a warning.
  if (errors && process.argv.includes('--strict')) process.exit(1);
}
