// pnpm studio <command>: add, remove, turn on or off, and make modules and design systems. For your agent: designers
// ask in plain words and the agent runs these. Every command that changes files says what it will do first, and
// changes nothing until it is run again with --yes.
//
//   list                              what is installed, and what is on
//   enable <module> / disable <module>   turn an optional module on or off in studio.config.ts (its files stay)
//   add <source> [--path <dir>] [--id <name>] [--yes] [--allow-license]
//                                     add a module or design system from a folder, a git address (https or ssh,
//                                     with an optional #branch, tag or commit), or an https .tar.gz
//   remove <module|system> [--content] [--yes] [--force]
//                                     delete a module (its prototypes' content is kept unless --content) or a system
//   create-module <id> [--label <name>] [--out <folder>]
//   create-system <id> [--label <name>] [--out <folder>]
//                                     start a new one; with --out, as a pack in that folder to publish
//   sync                              rewrite the module lines in AGENTS.md
//   check                             pnpm check, and what has changed from the original of a module you added
// Nothing in a source is ever run: its declaration is read as data, and its files are copied, not executed.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compatible, listProblems, moduleProblems, PLATFORM_VERSION } from '../../src/studio/modules/index.ts';
import {
  agentsBlock, applyAgentsBlock, editModulesFlag, licenseVerdict, packPlan, parseSource, readDeclaration, setDefaultSystem,
} from '../../src/studio/modules/pack.ts';
import { systemProblems } from '../../src/studio/modules/systems/spec.ts';
import { MODULES, ENABLED_MODULES, CONFIG } from '../lib/modules.js';
import { PROTOTYPE_SYSTEMS, DEFAULT_SYSTEM, SYSTEM_IDS } from '../../src/studio/modules/systems/node/systems.js';
import { fetchSource, walk } from '../lib/fetch-source.js';
import { loadContributors } from '../lib/contributors.js';
import { changesFromLock, hashFile, readLock, writeLock } from '../lib/lock.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rel = (...parts) => path.join(ROOT, ...parts);
const say = (line = '') => console.log(line);
const fail = (message) => { console.error(message); process.exit(1); };
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });

// ---- arguments
const [command, ...rest] = process.argv.slice(2);
const flags = {}; const positional = [];
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (a === '--') continue;
  if (['--yes', '--content', '--force', '--allow-license'].includes(a)) flags[a.slice(2)] = true;
  else if (['--path', '--id', '--label', '--out'].includes(a)) { flags[a.slice(2)] = rest[++i]; if (flags[a.slice(2)] === undefined) fail(`${a} needs a value.`); }
  else if (a.startsWith('--')) fail(`Unknown option ${a}.`);
  else positional.push(a);
}
const ID = /^[a-z][a-z0-9-]*$/;
const titleOf = (id) => id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const slug = (text) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/^[^a-z]+/, '');

// ---- places that must never be deleted, whatever a pack or a flag says
const PROTECTED = new Set(['src', 'src/studio', 'src/studio/modules', 'src/prototypes', 'src/lib', 'src/handbook', 'src/handbook/rules', 'src/handbook/docs', 'src/handbook/skills', 'src/systems', 'src/types']);
function removable(relative) {
  const clean = path.posix.normalize(relative.replace(/\/$/, ''));
  if (!relative || clean.startsWith('..') || clean.startsWith('/') || !clean.startsWith('src/') || PROTECTED.has(clean)) throw new Error(`Refusing to delete ${relative}.`);
  const abs = rel(clean);
  if (!abs.startsWith(rel('src') + path.sep)) throw new Error(`Refusing to delete ${relative}.`);
  return abs;
}
function removeEmptyParents(abs) {
  for (let dir = path.dirname(abs); dir.startsWith(rel('src') + path.sep) && !PROTECTED.has(path.relative(ROOT, dir)); dir = path.dirname(dir)) {
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir); else break;
  }
}

// Adding a second design system must not change which one existing prototypes use (they name none, so they get the
// default): write the current default into studio.config.ts first. Returns nothing; throws if it can't.
function pinDefaultSystem(remember) {
  if (SYSTEM_IDS.length < 1 || CONFIG.defaultSystem) return;
  const file = rel('studio.config.ts');
  const next = setDefaultSystem(fs.readFileSync(file, 'utf8'), DEFAULT_SYSTEM);
  if (next === null) throw new Error(`I couldn't set defaultSystem in studio.config.ts. Add defaultSystem: '${DEFAULT_SYSTEM}', to it by hand first, so existing prototypes keep their system.`);
  remember(file);
  fs.writeFileSync(file, next);
}

// ---- AGENTS.md
function syncAgents() {
  const file = rel('AGENTS.md');
  if (!fs.existsSync(file)) return false;
  const text = fs.readFileSync(file, 'utf8');
  const next = applyAgentsBlock(text, agentsBlock(ENABLED_MODULES));
  if (next === text) return false;
  fs.writeFileSync(file, next);
  return true;
}
const syncInFreshProcess = () => run('node', ['scripts/cli/studio.js', 'sync']);
const checkInFreshProcess = () => { try { run('node', ['scripts/check/check-modules.js']); return null; } catch (e) { return `${e.stderr ?? ''}${e.stdout ?? ''}`.trim(); } };

// ---- commands
function list() {
  const lock = readLock();
  say('Modules');
  for (const [id, m] of Object.entries(MODULES)) {
    if (!m || typeof m !== 'object') continue;
    const state = CONFIG.modules?.[id] === false ? 'off' : !compatible(m) ? `off (needs platform ${m.requires})` : 'on';
    const where = lock.modules[id] ? `added from ${lock.modules[id].source}` : 'came with the kit';
    say(`  ${id.padEnd(12)} ${state.padEnd(8)} ${m.optional ? 'can be turned off' : 'required         '}  ${where}`);
    if (m.description) say(`               ${m.description}`);
  }
  say();
  say('Design systems');
  for (const id of SYSTEM_IDS) {
    const where = lock.systems[id] ? `added from ${lock.systems[id].source}` : 'came with the kit';
    say(`  ${id.padEnd(12)} ${id === DEFAULT_SYSTEM ? 'default ' : '        '} ${where}`);
  }
}

function setEnabled(id, on) {
  const spec = MODULES[id];
  if (!id || !spec) fail(`No module has the id "${id ?? ''}". Installed: ${Object.keys(MODULES).join(', ')}.`);
  if (!on && !spec.optional) fail(`The ${id} module can't be turned off yet; other parts of the app still use it.`);
  if (on && !compatible(spec)) fail(`The ${id} module needs platform ${spec.requires} or newer, and this is ${PLATFORM_VERSION}.`);
  const file = rel('studio.config.ts');
  const text = fs.readFileSync(file, 'utf8');
  const next = editModulesFlag(text, id, on);
  if (next === null) fail(`I couldn't edit studio.config.ts. Set it by hand: modules: { ${id}: ${on} }.`);
  if (next === text) { say(`The ${id} module is already ${on ? 'on' : 'off'}.`); return; }
  fs.writeFileSync(file, next);
  syncInFreshProcess();
  say(`${spec.label} is ${on ? 'on' : 'off'}. ${on ? '' : 'Its files are still there; turn it on again any time. '}Restart the dev server for it to take effect.`);
}

async function add() {
  if (positional.length !== 1) fail('Usage: pnpm studio add <source> [--path <folder>] [--id <name>] [--yes]');
  const source = parseSource(positional[0]);
  if ('error' in source) fail(source.error);
  say(`Getting ${positional[0]} ...`);
  let pack;
  try { pack = await fetchSource(source, flags.path); } catch (e) { fail(e.message); }
  const created = [];       // files this run wrote
  const backups = new Map(); // text of files to put back if it goes wrong
  const remember = (file) => { if (!backups.has(file)) backups.set(file, fs.existsSync(file) ? fs.readFileSync(file) : null); };
  try {
    const files = walk(pack.dir);
    const names = files.map((f) => f.rel);
    const hasModule = names.includes('module.ts'), hasSystem = names.includes('system.ts');
    if (hasModule === hasSystem) fail(hasModule ? 'That has both a module.ts and a system.ts. A pack is one or the other.' : 'That isn\'t a module or a design system: it has no module.ts or system.ts at its top.');
    const kind = hasModule ? 'module' : 'system';
    const declared = readDeclaration(fs.readFileSync(path.join(pack.dir, hasModule ? 'module.ts' : 'system.ts'), 'utf8'));
    if ('error' in declared) fail(`${hasModule ? 'module.ts' : 'system.ts'}: ${declared.error}`);
    const spec = declared.value;
    const id = kind === 'module' ? spec.id : (flags.id ?? slug(spec.label ?? ''));
    if (typeof id !== 'string' || !ID.test(id)) fail(kind === 'module' ? 'module.ts needs an id: lowercase letters, numbers, and dashes.' : 'Give the system an id with --id <name>: lowercase letters, numbers, and dashes.');
    const problems = kind === 'module' ? moduleProblems(spec, id) : systemProblems(spec, id);
    if (kind === 'module' && !compatible(spec)) problems.push(`It needs platform ${spec.requires} or newer, and this is ${PLATFORM_VERSION}. Update the platform first.`);
    const installed = kind === 'module' ? fs.existsSync(rel('src', 'studio', 'modules', id)) : fs.existsSync(rel('src', 'systems', id));
    if (installed) problems.push(`There's already a ${kind === 'module' ? 'module' : 'design system'} called "${id}". Remove it first (pnpm studio remove ${id}), or add this one with another id.`);
    if (kind === 'module') problems.push(...listProblems([...Object.values(MODULES).filter((m) => m && typeof m === 'object'), spec]).filter((p) => p.includes(`"${spec.section?.key}"`) || p.includes(` ${id} `)));
    const plan = packPlan(kind, id, spec, names);
    problems.push(...plan.problems);
    const licenseFile = names.some((n) => /^licen[sc]e(\.[a-z]+)?$/i.test(n));
    const verdict = licenseVerdict(spec, licenseFile);
    if (verdict === 'none') problems.push(`It says it is built on ${spec.upstream?.repo}, but has ${licenseFile ? 'no usable license' : 'no LICENSE file'}. Without the library's license you can't use it.`);
    if (verdict === 'not-permissive' && !flags['allow-license']) problems.push(`Its library is under ${spec.upstream.license}, which isn't one of the permissive licenses (MIT, Apache-2.0, BSD, ISC, and similar). If your company says it's fine, add --allow-license.`);
    const taken = plan.moves.filter((m) => fs.existsSync(rel(m.to)) && !m.to.startsWith(`${spec.section?.folder}/`));
    for (const m of taken) problems.push(`${m.to} already exists, and a module never overwrites a file.`);
    const deps = Object.entries(spec.dependencies ?? {});
    const pkg = JSON.parse(fs.readFileSync(rel('package.json'), 'utf8'));
    const needed = deps.filter(([name]) => !(name in (pkg.dependencies ?? {})) && !(name in (pkg.devDependencies ?? {})));

    // The review.
    say();
    say(`${kind === 'module' ? 'Module' : 'Design system'}: ${spec.label} (${id})${spec.version ? ` ${spec.version}` : ''}`);
    if (spec.description) say(spec.description);
    say(`From: ${pack.origin.source}${pack.origin.ref ? ` at ${pack.origin.ref.slice(0, 12)}` : ''}`);
    if (spec.upstream) say(`Built on ${spec.upstream.repo} ${spec.upstream.version}, ${spec.upstream.license}${verdict === 'ok' ? ' (permissive)' : ''}`);
    say();
    say(`It would add ${plan.moves.length} file(s):`);
    const dirs = new Map();
    for (const m of plan.moves) { const d = path.posix.dirname(m.to); dirs.set(d, (dirs.get(d) ?? 0) + 1); }
    for (const [d, n] of dirs) say(`  ${d}/   ${n} file(s)`);
    if (kind === 'module') {
      const provides = [];
      if (spec.section) provides.push(`a page at /${spec.section.key}${spec.section.items ? ` (items in ${spec.section.folder})` : ''}`);
      if (names.includes('app.tsx')) provides.push('a rail button and routes');
      if (names.includes('server.ts')) provides.push('routes on the dev server');
      if (spec.lib) provides.push(`a library prototypes import as @module/${id}`);
      if (names.includes('check.ts')) provides.push('a check in pnpm check');
      if (spec.handbook?.length) provides.push(`${spec.handbook.length} Handbook file(s) for agents`);
      say(`It provides: ${provides.join('; ') || 'nothing yet'}.`);
      say(`${spec.optional ? 'It can be turned off in studio.config.ts.' : 'It cannot be turned off.'}`);
    }
    if (deps.length) say(`It needs npm packages: ${deps.map(([n, v]) => `${n}@${v}${needed.some(([x]) => x === n) ? '' : ' (already installed)'}`).join(', ')}. ${needed.length ? 'They are installed only if you say yes, with install scripts off.' : ''}`);
    if (plan.skipped.length) say(`Left behind: ${plan.skipped.length} hidden or dependency file(s).`);
    say('Everything it adds is code that will run in your app and your dev server, so read it before you say yes.');
    if (problems.length) { say(); for (const p of problems) console.error(`Can't add it: ${p}`); process.exit(1); }
    if (!flags.yes) { say(); say(`Nothing was changed. To add it, run the same command with --yes.`); return; }

    // Add it.
    if (kind === 'system') pinDefaultSystem(remember);
    for (const m of plan.moves) {
      const to = rel(m.to);
      if (fs.existsSync(to)) continue; // content that was already there stays
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(path.join(pack.dir, m.from), to);
      created.push(to);
    }
    const lock = readLock();
    remember(rel('studio.lock.json')); remember(rel('AGENTS.md')); remember(rel('package.json')); remember(rel('pnpm-lock.yaml'));
    const entry = {
      kind, version: spec.version ?? null, source: pack.origin.source, ...(pack.origin.ref && { ref: pack.origin.ref }),
      ...(spec.upstream && { upstream: spec.upstream }),
      files: Object.fromEntries(plan.moves.filter((m) => created.includes(rel(m.to))).map((m) => [m.to, hashFile(rel(m.to))])),
    };
    lock[kind === 'module' ? 'modules' : 'systems'][id] = entry;
    writeLock(lock);
    const problem = checkInFreshProcess();
    if (problem) throw new Error(`It didn't pass the checks:\n${problem}`);
    if (needed.length) {
      say(`Installing ${needed.map(([n]) => n).join(', ')} ...`);
      run('pnpm', ['add', '--ignore-scripts', ...needed.map(([n, v]) => `${n}@${v}`)]);
    }
    syncInFreshProcess();
    say(`Added ${spec.label}. Restart the dev server to see it.`);
  } catch (e) {
    for (const file of created.reverse()) { fs.rmSync(file, { force: true }); removeEmptyParents(file); }
    for (const [file, content] of backups) { if (content === null) fs.rmSync(file, { force: true }); else fs.writeFileSync(file, content); }
    console.error(`Nothing was added. ${e.message}`);
    process.exitCode = 1;
  } finally {
    pack.cleanup();
  }
}

function usesLib(id) {
  const pattern = `@module/${id}`;
  const hits = [];
  const visit = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules') visit(p); }
      else if (/\.(tsx?|jsx?)$/.test(e.name) && fs.readFileSync(p, 'utf8').includes(pattern)) hits.push(path.relative(ROOT, p));
    }
  };
  visit(rel('src', 'prototypes'));
  for (const m of Object.values(MODULES)) if (m?.section?.items === 'prototypes' && m.section.folder) visit(rel(m.section.folder));
  return hits;
}

function remove() {
  const [id] = positional;
  if (!id) fail('Usage: pnpm studio remove <module|system> [--content] [--yes] [--force]');
  const isModule = Object.hasOwn(MODULES, id) && MODULES[id];
  const isSystem = !isModule && Object.hasOwn(PROTOTYPE_SYSTEMS, id);
  if (!isModule && !isSystem) fail(`Nothing is called "${id}". Modules: ${Object.keys(MODULES).join(', ')}. Design systems: ${SYSTEM_IDS.join(', ')}.`);
  const paths = [];
  const notes = [];
  if (isModule) {
    const spec = MODULES[id];
    if (!spec.optional) fail(`The ${id} module can't be removed yet; other parts of the app still use it.`);
    paths.push(`src/studio/modules/${id}`);
    for (const h of spec.handbook ?? []) paths.push(`src/handbook/${h.path}`);
    if (spec.section?.folder && !spec.section.folder.startsWith(`src/studio/modules/${id}`)) {
      if (flags.content) paths.push(spec.section.folder);
      else if (fs.existsSync(rel(spec.section.folder))) notes.push(`Its content in ${spec.section.folder} stays. Add --content to delete that too.`);
    }
    const users = spec.lib ? usesLib(id) : [];
    if (users.length && !flags.force) fail(`${users.length} file(s) import @module/${id}, like ${users[0]}, and would stop working. Change them first, or add --force.`);
    if (Object.keys(spec.dependencies ?? {}).length) notes.push(`Its npm packages stay installed: ${Object.keys(spec.dependencies).join(', ')}. Remove them with pnpm remove if nothing else uses them.`);
  } else {
    paths.push(`src/systems/${id}`);
    if (SYSTEM_IDS.length === 1) fail(`${id} is the only design system, and prototypes need one. Add another first.`);
    if (id === DEFAULT_SYSTEM) fail(`${id} is the default design system. Set defaultSystem in studio.config.ts to another one first.`);
    const users = [];
    const protoRoot = rel('src', 'prototypes');
    for (const who of fs.existsSync(protoRoot) ? fs.readdirSync(protoRoot) : []) {
      for (const proto of fs.existsSync(path.join(protoRoot, who)) ? fs.readdirSync(path.join(protoRoot, who)) : []) {
        try { if (JSON.parse(fs.readFileSync(path.join(protoRoot, who, proto, 'meta.json'), 'utf8')).system === id) users.push(`${who}/${proto}`); } catch { /* not a prototype */ }
      }
    }
    if (users.length && !flags.force) fail(`${users.length} prototype(s) use ${id}, like ${users[0]}. Change their "system" first, or add --force.`);
  }
  const abs = paths.map((p) => removable(p)).filter((a) => fs.existsSync(a));
  say(`This would delete:`);
  for (const a of abs) say(`  ${path.relative(ROOT, a)}`);
  for (const n of notes) say(n);
  if (!flags.yes) { say(); say('Nothing was changed. To remove it, run the same command with --yes.'); return; }
  for (const a of abs) { fs.rmSync(a, { recursive: true, force: true }); removeEmptyParents(a); }
  const lock = readLock();
  delete lock[isModule ? 'modules' : 'systems'][id];
  writeLock(lock);
  if (isModule) {
    const file = rel('studio.config.ts');
    const text = fs.readFileSync(file, 'utf8');
    const next = editModulesFlag(text, id, true);
    if (next && next !== text) fs.writeFileSync(file, next);
  }
  syncInFreshProcess();
  say(`Removed ${id}. Restart the dev server.`);
}

function create(kind) {
  const [id] = positional;
  if (!id || !ID.test(id)) fail(`Usage: pnpm studio create-${kind} <id> [--label <name>] [--out <folder>]. The id is lowercase letters, numbers, and dashes.`);
  const label = flags.label ?? titleOf(id);
  if (/[\n\r<>`$\\]/.test(label)) fail('The label should be plain text.');
  const template = rel('scripts', 'templates', kind);
  const fill = (text) => text.replaceAll('__ID__', id).replaceAll('__LABEL__', label);
  const files = walk(template).map((f) => f.rel);
  if (flags.out) {
    // A pack in its own folder, to publish.
    const out = path.resolve(flags.out);
    if (fs.existsSync(out) && fs.readdirSync(out).length) fail(`${out} isn't empty.`);
    for (const f of files) {
      const to = path.join(out, fill(f)); fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.writeFileSync(to, fill(fs.readFileSync(path.join(template, f), 'utf8')));
    }
    say(`Made the ${kind} in ${out}. Publish it as a git repository, then anyone can run: pnpm studio add <its address>`);
    return;
  }
  const spec = readDeclaration(fill(fs.readFileSync(path.join(template, kind === 'module' ? 'module.ts' : 'system.ts'), 'utf8'))).value;
  if (kind === 'module' ? fs.existsSync(rel('src', 'studio', 'modules', id)) : fs.existsSync(rel('src', 'systems', id))) fail(`There's already a ${kind} called "${id}".`);
  if (kind === 'module' && SECTION_TAKEN(id)) fail(`"${id}" is already the address of another module, or a contributor's folder. Choose another id.`);
  const plan = packPlan(kind, id, spec, files);
  if (plan.problems.length) fail(plan.problems.join('\n'));
  const written = [];
  const backups = new Map();
  try {
    if (kind === 'system') pinDefaultSystem((file) => backups.set(file, fs.readFileSync(file)));
    for (const m of plan.moves) {
      const to = rel(m.to);
      if (fs.existsSync(to)) throw new Error(`${m.to} already exists.`);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.writeFileSync(to, fill(fs.readFileSync(path.join(template, m.from), 'utf8')));
      written.push(to);
    }
    const problem = checkInFreshProcess();
    if (problem) throw new Error(problem);
  } catch (e) {
    for (const f of written.reverse()) { fs.rmSync(f, { force: true }); removeEmptyParents(f); }
    for (const [file, content] of backups) fs.writeFileSync(file, content);
    fail(`Nothing was made. ${e.message}`);
  }
  syncInFreshProcess();
  say(`Made the ${kind} "${id}" in ${kind === 'module' ? `src/studio/modules/${id}/` : `src/systems/${id}/`}. Restart the dev server to see it.`);
}

function SECTION_TAKEN(id) {
  const keys = new Set(Object.values(MODULES).flatMap((m) => (m?.section ? [m.section.key] : [])));
  const contributors = Object.keys(loadContributors());
  const folders = fs.existsSync(rel('src', 'prototypes')) ? fs.readdirSync(rel('src', 'prototypes')) : [];
  return keys.has(id) || contributors.includes(id) || folders.includes(id);
}

function check() {
  const problem = checkInFreshProcess();
  say(problem ?? run('node', ['scripts/check/check-modules.js']).trim());
  const changes = changesFromLock();
  for (const c of changes) {
    say(`${c.kind} ${c.id}: ${c.changed.length ? `${c.changed.length} file(s) changed from the original (${c.changed[0]}${c.changed.length > 1 ? ', ...' : ''})` : ''}${c.changed.length && c.missing.length ? '; ' : ''}${c.missing.length ? `${c.missing.length} file(s) deleted` : ''}. That's yours to change; this just says where it differs.`);
  }
  if (problem) process.exit(1);
}

const commands = {
  list, check, sync: () => { say(syncAgents() ? 'Updated AGENTS.md.' : 'AGENTS.md is up to date.'); },
  enable: () => setEnabled(positional[0], true), disable: () => setEnabled(positional[0], false),
  add, remove, 'create-module': () => create('module'), 'create-system': () => create('system'),
};
if (!command || !Object.hasOwn(commands, command)) {
  console.error(`Usage: pnpm studio <command>\n  ${Object.keys(commands).join(', ')}\nSee the top of scripts/cli/studio.js for what each does.`);
  process.exit(command ? 1 : 0);
}
await commands[command]();
