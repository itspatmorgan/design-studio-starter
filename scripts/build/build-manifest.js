import { cssProblems } from '../lib/css-scope.js';
// Usage: node scripts/build/build-manifest.js [--strict] [--deploy]
//   --strict  exits 1 if any meta.json is invalid
//   --deploy  leaves archived prototypes and views out (src/platform/core/archive.ts), for the deployed site
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTOTYPE_SYSTEMS, DEFAULT_SYSTEM, SYSTEM_SOURCES } from '../../src/modules/systems/node/systems.js';
import { PLATFORM_ID } from '../../src/modules/systems/node/systems.js';
import { isHelper, artifactSlug } from '../../src/platform/core/fileTypes.ts';
import { SYSTEM_CONTENT_KEY, SYSTEM_CONTENT_SECTIONS, rootOf, contentId, systemRoot } from '../../src/platform/core/roots.ts';
import { STATUSES, forDeploy, linksToArchived, parseStatus } from '../../src/platform/core/archive.ts';
import { byOrder, parseOrder } from '../../src/platform/core/order.ts';
import { parseMaintainers } from '../../src/platform/core/permissions.ts';
import { FILE_TYPES, fileTypeOf, systemContentTypeOf, isTextFile } from '../lib/file-types.js';
import { ENABLED_MODULES, MODULES, PROTOTYPE_SECTIONS, SECTION_KEYS } from '../lib/modules.js';
import { frontmatter } from '../lib/frontmatter.js';
import { readmes } from '../lib/guide-pages.js';
import { contributorsSignature, loadContributors } from '../lib/contributors.js';
import { systemContentProblems } from '../../src/modules/systems/content/node/content-check.js';
import { systemDocs } from '../../src/modules/systems/node/docs.js';
import { themeTokens } from '../../src/modules/systems/themeTokens.ts';
import { platformReferences } from '../lib/platform-references.js';
import { systemContentMap } from '../../src/modules/systems/content/map.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PROTOS = path.join(ROOT, 'src', 'prototypes');

// The Guide's pages, or null when its module is off or not installed.
const documentationModule = ENABLED_MODULES.find((m) => m.id === 'documentation');
const GUIDE = documentationModule?.section?.folder ? path.join(ROOT, documentationModule.section.folder) : null;
const OUT_DIR = path.join(ROOT, 'public', 'prototypes');
const OUT = path.join(OUT_DIR, 'manifest.json');
// Each prototype's artifacts, one file each: artifacts/<contributor>/<prototype>.json. The app fetches a
// prototype's when it opens it, so the manifest every visitor downloads stays small however many
// files prototypes hold.
const ARTIFACTS_DIR = path.join(OUT_DIR, 'artifacts');
// How many component doc gaps the build lists before summarizing the rest.
const DOC_WARNINGS = 5;

const dirs = (p) => fs.existsSync(p)
  ? fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

// A prototype's artifacts (see src/platform/core/fileTypes.md), in the order the file tree shows them: at each
// level, files first, then folders, each alphabetical, unless meta.json "order" says otherwise
// (src/platform/core/order.ts). Hidden files and helpers (names starting with an underscore) are skipped.
// `typeOf` says which type opens a file (or null for a plain file), and `skip` which folders are
// left out. Links are never followed: a symlink is neither a file nor a folder here.
const inPrototype = { typeOf: (name) => (isHelper(name) ? null : fileTypeOf(name)), skip: isHelper };
function artifactsIn(dir, base = '', { typeOf, skip, order } = inPrototype) {
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
  const files = entries.filter((e) => e.isFile()).flatMap((e) => {
    const fileType = typeOf(e.name, path.join(dir, e.name));
    return fileType ? [{ name: e.name, path: base + e.name, dir: false, fileType }] : [];
  });
  const folders = entries.filter((e) => e.isDirectory() && !skip(e.name)).map((e) => ({ name: e.name, path: base + e.name, dir: true }));
  return byOrder([...files, ...folders], order).flatMap((e) => (e.dir
    ? artifactsIn(path.join(dir, e.name), `${e.path}/`, { typeOf, skip, order })
    : [{ path: e.path, fileType: e.fileType }]));
}

// In the system content, a document opens as a document and every other text file opens as text (a
// script in a skill's folder). Binary and very large files are left out.
const inSystemContent = {
  typeOf: (name, file) => { const id = systemContentTypeOf(name); return id && (!FILE_TYPES[id].fallback || isTextFile(file)) ? id : null; },
  skip: (name) => name === 'node_modules',
};

// Problems with a folder's artifacts: two sharing a URL, or a file its type rejects (a view needs a
// default export, and so on: src/modules/<type>/type.ts). Printed; returns how many.
function checkArtifacts(dir, artifacts, out = console, prototype) {
  let errors = 0;
  const seen = new Set();
  for (const item of artifacts) {
    const file = path.relative(ROOT, path.join(dir, item.path));
    if (seen.has(artifactSlug(item.path))) { out.error(`[manifest] ${file}: another file here has the same name. Rename one; they'd share a URL.`); errors++; }
    seen.add(artifactSlug(item.path));
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
    for (const item of proto.artifacts) {
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

// Reads one prototype's folder (a person's in src/prototypes/, or an item of a module's section, with one folder per item
// in src/examples/) into its manifest entry, or null when it can't be used. Problems are printed; `errors` counts
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
  // "order" (optional) lists paths to put first, in sequence (src/platform/core/order.ts).
  let order;
  if (meta.order !== undefined) {
    order = parseOrder(meta.order);
    if (!order) return skip('has an "order" that isn\'t a list of paths');
  }
  const artifacts = artifactsIn(dir, '', { ...inPrototype, order });
  // Two artifacts can't share a URL (main.tsx next to main.jsx or main.md), and each file type checks its own files.
  errors += checkArtifacts(dir, artifacts, out, { contributor: contributorKey, id });
  // "system" (optional) is the design system it builds with, one of the folders in src/systems/.
  const system = meta.system === undefined ? DEFAULT_SYSTEM : meta.system;
  if (system !== null && !(typeof system === 'string' && Object.hasOwn(PROTOTYPE_SYSTEMS, system))) return skip(`has "system": "${system}", which isn't a folder in src/systems/ (${Object.keys(PROTOTYPE_SYSTEMS).join(', ')})`);
  // "status" (optional) is 'active' (the default) or 'archived'.
  let status = null;
  if (meta.status !== undefined) {
    status = parseStatus(meta.status);
    if (!status) return skip(`has "status": ${JSON.stringify(meta.status)}, which isn't one of ${STATUSES.join(', ')}`);
  }
  return {
    errors,
    entry: {
      id, contributorKey, title: meta.title, ...(SECTION_KEYS.has(contributorKey) && { description: meta.description ?? '' }),
      contributor: maintained ? maintainers.map((k) => contributors[k]?.name ?? k).join(', ') : contributors[contributorKey]?.name ?? '',
      created: meta.created ?? null, system, artifacts,
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

// Writes the manifest the app fetches: prototypes without their artifacts (with how many, and a hash
// of them so a changed list is fetched again), and each prototype's artifacts in its own file. The
// system content's sections are few, so theirs stay in the manifest. Files for prototypes that are gone are removed.
function writeManifest(manifest) {
  const wanted = new Set();
  const split = ({ artifacts, ...info }) => {
    const text = JSON.stringify(artifacts);
    const file = path.join(ARTIFACTS_DIR, info.contributorKey, `${info.id}.json`);
    wanted.add(file);
    writeIfChanged(file, text);
    return { ...info, artifactCount: artifacts.length, artifactsHash: crypto.createHash('sha1').update(text).digest('hex').slice(0, 8) };
  };
  const prototypes = manifest.prototypes.map(split);
  const sections = Object.fromEntries(Object.entries(manifest.sections).map(([key, artifacts]) => [key, artifacts.map(split)]));
  for (const dir of fs.existsSync(ARTIFACTS_DIR) ? fs.readdirSync(ARTIFACTS_DIR, { withFileTypes: true }) : []) {
    if (!dir.isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(ARTIFACTS_DIR, dir.name))) {
      if (!wanted.has(path.join(ARTIFACTS_DIR, dir.name, f))) fs.rmSync(path.join(ARTIFACTS_DIR, dir.name, f), { force: true });
    }
    if (!fs.readdirSync(path.join(ARTIFACTS_DIR, dir.name)).length) fs.rmdirSync(path.join(ARTIFACTS_DIR, dir.name));
  }
  writeIfChanged(OUT, JSON.stringify({ ...manifest, prototypes, sections }) + '\n');
}

// Scans src/prototypes/, src/platform/, and src/modules/documentation/pages/, writes public/prototypes/ (manifest.json, and artifacts/), and returns the whole manifest.
// Problems are printed; errors counts them. The dev server calls this on every change
// (vite-manifest-watch-plugin.js), so it's kept fast: one pass, no subprocesses.
// Options: `deploy` leaves archived prototypes and views out (see src/platform/core/archive.ts), `write: false`
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
  // Items of the modules' sections of prototype-shaped folders, by section key.
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
  // A module's section of prototype-shaped folders (src/examples/<id>/, artifacts provided by a module): shaped
  // the same, one folder per id, with maintainers where the section's policy says so.
  for (const section of PROTOTYPE_SECTIONS) {
    for (const id of dirs(section.dir)) {
      const entry = read(path.join(section.dir, id), section.key, id, section.policy);
      if (entry) sections[section.key].push(entry);
    }
  }

  for (const key of cache.keys()) if (!seen.has(key)) cache.delete(key);

  // Context, rules, and skills are owned by their system, including Platform.
  const systemContent = [];
  const maps = {};
  for (const system of Object.keys(SYSTEM_SOURCES)) {
    const base = path.join(ROOT, 'src', systemRoot(system));
    for (const [section, { title, description }] of Object.entries(SYSTEM_CONTENT_SECTIONS)) {
      const dir = path.join(base, section);
      const artifacts = fs.existsSync(dir) ? artifactsIn(dir, '', inSystemContent) : [];
      if (fs.existsSync(dir)) errors += checkArtifacts(dir, artifacts, out);
      systemContent.push({ id: contentId(system, section), contributorKey: SYSTEM_CONTENT_KEY, title, description, contributor: '', created: null, system, artifacts });
    }
    for (const problem of systemContentProblems(base, { scoped: true })) { out.error('[manifest] ' + problem); errors++; }
    const rulesDir = path.join(base, 'rules');
    const rules = {};
    const collect = (dir, prefix = '') => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.')) continue;
        if (e.isDirectory()) collect(path.join(dir, e.name), prefix + e.name + '/');
        else if (e.isFile() && e.name.endsWith('.md')) rules[prefix + e.name] = fs.readFileSync(path.join(dir, e.name), 'utf8');
      }
    };
    if (fs.existsSync(rulesDir)) collect(rulesDir);
    const skillsDir = path.join(base, 'skills');
    const skills = fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.') && fs.existsSync(path.join(skillsDir, e.name, 'SKILL.md'))).map((e) => {
      const fm = frontmatter(fs.readFileSync(path.join(skillsDir, e.name, 'SKILL.md'), 'utf8')) ?? {};
      return { folder: e.name, name: String(fm.name ?? e.name), description: String(fm.description ?? '') };
    }) : [];
    const agentsFile = system === 'platform' ? path.join(ROOT, 'AGENTS.md') : path.join(base, 'AGENTS.md');
    const localAgents = path.join(base, 'AGENTS.md');
    const agents = [agentsFile, ...(localAgents !== agentsFile ? [localAgents] : [])].filter((file) => fs.existsSync(file)).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
    maps[system] = systemContentMap({ agents: agents || null, rules, skills, root: 'src/' + systemRoot(system) });
    for (const file of maps[system].missing) { out.error('[manifest] Agent instructions link to ' + file + ', which is missing.'); errors++; }
  }
  // Each prototype system's theme.css may only set values under its own class, like
  // .product-theme, so it can't leak into the app UI or another system.
  for (const [id, sys] of Object.entries(PROTOTYPE_SYSTEMS)) {
    const file = path.join(ROOT, sys.dir, 'styles', 'theme.css');
    if (!fs.existsSync(file)) { out.error(`[manifest] ${path.relative(ROOT, file)} is missing (the ${id} system's theme)`); errors++; continue; }
    for (const problem of cssProblems(fs.readFileSync(file, 'utf8'), { file, themeClass: sys.themeClass })) { out.error(`[manifest] ${problem}`); errors++; }
  }

  // Each system's components and tokens, for the Systems pages, and what its component pages lack
  // (src/modules/systems/docs.ts, themeTokens.ts). The app's own system (Platform) is one of them. By
  // default a gap is a warning, and the first few are listed; docs: 'strict' fails the build and
  // 'off' says nothing.
  if (PLATFORM_ID in PROTOTYPE_SYSTEMS) { out.error(`[manifest] src/systems/${PLATFORM_ID}/: "${PLATFORM_ID}" is the app's own system, so a prototype system can't use that name`); errors++; }
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

  // Guide pages: src/modules/documentation/pages/*.md, and the README.md of a module or file type that opens with
  // Guide frontmatter (it keeps its page with its folder: `source` says where it is). Ordered by `order` in each page's
  // frontmatter. They share the title, description, and toc fields with prototype documents, and add order and section;
  // a README may also set `slug` (its address, /documentation/guide/<slug>), which is its folder's name otherwise.
  const guide = [];
  const guideFiles = GUIDE && fs.existsSync(GUIDE) ? fs.readdirSync(GUIDE).filter((f) => f.endsWith('.md')).sort() : [];
  const pages = guideFiles.map((file) => ({ file: path.join(GUIDE, file), where: `src/modules/documentation/pages/${file}`, slug: file.replace(/\.md$/, ''), readme: false }));
  // A README without a title is only a README.
  if (GUIDE) for (const r of readmes()) pages.push({ file: r.file, where: path.relative(ROOT, r.file), slug: r.folder, readme: true, source: r.source });
  const taken = new Map();
  for (const page of pages) {
    const fm = frontmatter(fs.readFileSync(page.file, 'utf8'));
    if (page.readme && !fm?.title) continue;
    const { where } = page;
    if (!fm || typeof fm.title !== 'string' || !fm.title) { out.error(`[manifest] Skipped ${where}: needs frontmatter with a "title"`); errors++; continue; }
    if (typeof fm.order !== 'number') { out.error(`[manifest] Skipped ${where}: needs a numeric "order" in its frontmatter`); errors++; continue; }
    const slug = page.readme && typeof fm.slug === 'string' && fm.slug ? fm.slug : page.slug;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) { out.error(`[manifest] Skipped ${where}: its address "${slug}" must be lowercase letters, numbers, and hyphens`); errors++; continue; }
    if (taken.has(slug)) { out.error(`[manifest] Skipped ${where}: ${taken.get(slug)} already has the Guide address /documentation/guide/${slug}`); errors++; continue; }
    taken.set(slug, where);
    guide.push({ slug, title: fm.title, description: fm.description ?? '', section: fm.section || null, order: fm.order, ...(page.source ? { source: page.source } : {}) });
  }
  guide.sort((a, b) => a.order - b.order);

  // What the deployed site leaves out (src/platform/core/archive.ts).
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

  const manifest = { prototypes: deploy ? keptPrototypes : prototypes, sections: deploy ? keptSections : sections, guide: guide.map(({ order, ...page }) => page), systemContent, systemContentMaps: maps, platformReferences: platformReferences({ root: ROOT, modules: Object.values(MODULES).filter(Boolean), enabled: ENABLED_MODULES.map((m) => m.id), systemContent }), systems };
  if (write) writeManifest(manifest);
  out.log(`[manifest] ${manifest.prototypes.length} prototype(s), ${Object.entries(manifest.sections).map(([key, artifacts]) => `${artifacts.length} in ${key}`).join(', ') || 'no sections'}, ${guide.length} guide page(s), ${systemContent.length} systemContent section(s)${errors ? `, ${errors} problem(s) above` : ''}`);
  if (deploy && archived.length) out.log(`[manifest] Left out of the deployed site: ${archived.length} archived prototype(s)`);
  return { manifest, errors, archived: deploy ? archived : [] };
}

// Run as a script: node scripts/build/build-manifest.js [--strict]
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors } = buildManifest({ deploy: process.argv.includes('--deploy') });
  // pnpm build passes --strict, so a broken meta.json or Guide page fails the build. In dev it's only a warning.
  if (errors && process.argv.includes('--strict')) process.exit(1);
}
