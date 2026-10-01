// Checks the modules in src/studio/modules/ (src/studio/modules/index.ts):
//   - each module.ts is well formed, and its id is its folder's name
//   - no two modules claim the same section key or folder
//   - a module's section folder exists
//   - studio.config.ts is well formed, and only turns off modules that can be turned off
//   - each design system in src/systems/ has a well formed system.ts, components/, and styles/theme.css
//   - no contributor, and no folder in src/prototypes/, uses a section key, since both are addresses
//   - modules don't import each other, and nothing outside an optional module imports its files other
//     than its module.ts, so deleting its folder leaves nothing broken (a required module is part of the
//     platform, so the platform may import it)
// Usage: node scripts/check/check-modules.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { PLATFORM_VERSION, compatible, listProblems } from '../../src/studio/modules/index.ts';
import { configProblems } from '../../src/studio/core/config.ts';
import { CONFIG, MODULES, SECTION_KEYS, declarationProblems } from '../lib/modules.js';
import { PROTOTYPE_SYSTEMS, SYSTEM_IDS, systemDeclarationProblems } from '../../src/studio/modules/systems/node/systems.js';
import { changesFromLock } from '../lib/lock.js';
import { readContributors } from '../lib/contributors.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const problems = declarationProblems();
const specs = Object.values(MODULES).filter((m) => m && typeof m === 'object');
problems.push(...listProblems(specs), ...configProblems(CONFIG, specs, SYSTEM_IDS), ...systemDeclarationProblems());
if (!SYSTEM_IDS.length) problems.push('There is no design system in src/systems/. Prototypes need one to build with: add one with pnpm studio create-system.');
if (SYSTEM_IDS.length > 1 && !CONFIG.defaultSystem) problems.push(`There are ${SYSTEM_IDS.length} design systems (${SYSTEM_IDS.join(', ')}), so say which one prototypes use when their meta.json names none: add defaultSystem: '${SYSTEM_IDS.includes('product') ? 'product' : SYSTEM_IDS[0]}', to studio.config.ts.`);
for (const id of SYSTEM_IDS) {
  for (const part of ['components', 'styles/theme.css']) {
    if (!fs.existsSync(path.join(ROOT, PROTOTYPE_SYSTEMS[id].dir, part))) problems.push(`src/systems/${id}/${part} is missing. A design system has components/ and styles/theme.css.`);
  }
}

for (const m of specs) {
  if (m.section?.folder && !fs.existsSync(path.join(ROOT, m.section.folder))) {
    problems.push(`The ${m.id} module keeps its files in ${m.section.folder}, which doesn't exist. Create the folder, or remove the module.`);
  }
}

const { contributors: contributorMap, twice, problems: contributorProblems } = readContributors();
const contributors = Object.keys(contributorMap);
problems.push(...contributorProblems, ...twice.map((k) => `"${k}" is in contributors.json and also has its own file, contributors/${k}.json. Keep one.`));
const protoDir = path.join(ROOT, 'src', 'prototypes');
const folders = fs.existsSync(protoDir) ? fs.readdirSync(protoDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
for (const key of SECTION_KEYS) {
  if (contributors.includes(key)) problems.push(`"${key}" is a contributor and also the address of a module. Give the contributor another key.`);
  if (folders.includes(key)) problems.push(`src/prototypes/${key}/ uses "${key}", which is the address of a module. Rename the folder.`);
}

// Imports, as written: from '...', import('...'), import '...'.
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g;
const MODULES_DIR = path.join(ROOT, 'src', 'studio', 'modules');
const ids = Object.keys(MODULES);

function* sources(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (full === protoDir || full === path.join(ROOT, 'src', 'tools')) continue; // prototypes and tools have the import guard
    if (e.isDirectory()) yield* sources(full);
    else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) yield full;
  }
}

for (const file of [...sources(path.join(ROOT, 'src')), ...sources(path.join(ROOT, 'scripts')), path.join(ROOT, 'vite.config.ts')]) {
  const own = path.relative(MODULES_DIR, file).split(path.sep);
  const inside = ids.includes(own[0]) ? own[0] : null;
  const rel = path.relative(ROOT, file);
  for (const [, specifier] of fs.readFileSync(file, 'utf8').matchAll(SPECIFIER)) {
    let resolved;
    if (specifier.startsWith('@/')) resolved = path.join(ROOT, 'src', specifier.slice(2));
    else if (specifier.startsWith('.')) resolved = path.resolve(path.dirname(file), specifier);
    else continue;
    const target = path.relative(MODULES_DIR, resolved).split(path.sep);
    if (target[0].startsWith('..') || !ids.includes(target[0]) || target[0] === inside) continue;
    const isDeclaration = target.length === 2 && /^module(\.ts)?$/.test(target[1]);
    if (inside) problems.push(`${rel} imports the ${target[0]} module. Modules can't depend on each other: ${target[0]}/ has to be removable.`);
    else if (!isDeclaration && MODULES[target[0]].optional) problems.push(`${rel} imports into the ${target[0]} module ("${specifier}"). Code outside a module can read only its module.ts, or the app wouldn't run without it.`);
  }
}

// Each module's own check (check.ts), for the modules that are on.
for (const m of specs) {
  const file = path.join(ROOT, 'src', 'studio', 'modules', m.id, 'check.ts');
  if (!fs.existsSync(file) || !compatible(m) || CONFIG.modules?.[m.id] === false) continue;
  try {
    const run = (await import(pathToFileURL(file).href)).default;
    for (const problem of await run({ root: ROOT })) problems.push(`${m.id}: ${problem}`);
  } catch (e) {
    problems.push(`${m.id}: its check.ts failed to run (${e.message}).`);
  }
}

// What you changed in a module or design system you added from a source (studio.lock.json). Yours to change: this says where.
for (const c of changesFromLock()) {
  const parts = [c.changed.length && `${c.changed.length} file(s) changed from the original (${c.changed[0]}${c.changed.length > 1 ? ', ...' : ''})`, c.missing.length && `${c.missing.length} file(s) deleted`].filter(Boolean);
  console.log(`[modules] The ${c.kind} ${c.id} has ${parts.join(' and ')}.`);
}

// A module that needs a newer platform is turned off, not broken: say so, and carry on.
for (const m of specs) {
  if (!compatible(m)) console.log(`[modules] The ${m.id} module needs platform ${m.requires} or newer, and this is ${PLATFORM_VERSION}, so it is off. Update the platform to use it.`);
}

if (problems.length) {
  console.error(problems.map((p) => `[modules] ${p}`).join('\n'));
  process.exit(1);
}
console.log(`[modules] ${specs.length} module(s) (${Object.keys(MODULES).join(', ')}) and ${SYSTEM_IDS.length} design system(s) (${SYSTEM_IDS.join(', ')}), all well formed`);
