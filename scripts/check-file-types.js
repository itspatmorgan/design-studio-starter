// Checks that file types stay removable (src/studio/fileTypes/README.md):
//   - nothing outside a type's folder imports from it, and types don't import each other, so
//     deleting a folder leaves nothing broken. Core reads types through the registries
//     (src/studio/app/data/fileTypes.ts, scripts/lib/file-types.js).
//   - a type's type.ts imports only ../index.ts, because the build loads it in Node.
//   - a type's loader.ts lists its files with studioGlobs(), so a new section and archived files reach it
//     (scripts/vite-globs-plugin.js).
// Usage: node scripts/check-file-types.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = path.join(ROOT, 'src', 'studio', 'fileTypes');
const ids = fs.readdirSync(TYPES, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

// Source files, not prototypes (those are checked by the import guard) or dependencies.
function* files(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (full === path.join(ROOT, 'src', 'prototypes') || full === path.join(ROOT, 'src', 'tools')) continue;
    if (e.isDirectory()) yield* files(full);
    else if (/\.(ts|tsx|js|jsx|md)$/.test(e.name)) yield full;
  }
}

const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g;

// The type folder an import points into, or null.
function targetType(importer, specifier) {
  let resolved;
  if (specifier.startsWith('@/')) resolved = path.join(ROOT, 'src', specifier.slice(2));
  else if (specifier.startsWith('.')) resolved = path.resolve(path.dirname(importer), specifier);
  else return null;
  const rel = path.relative(TYPES, resolved).split(path.sep);
  return rel[0] && !rel[0].startsWith('..') && ids.includes(rel[0]) ? rel[0] : null;
}

const problems = [];
for (const file of [...files(path.join(ROOT, 'src')), ...files(path.join(ROOT, 'scripts')), path.join(ROOT, 'vite.config.ts')]) {
  const rel = path.relative(ROOT, file);
  const own = path.relative(TYPES, file).split(path.sep)[0];
  const code = fs.readFileSync(file, 'utf8');
  for (const [, specifier] of code.matchAll(SPECIFIER)) {
    const target = targetType(file, specifier);
    if (target && target !== own) {
      problems.push(own && ids.includes(own)
        ? `${rel} imports the ${target} file type. File types can't depend on each other: ${target}/ has to be removable.`
        : `${rel} imports the ${target} file type ("${specifier}"). Core code can't depend on a file type, or the app wouldn't run without it. Read types through src/studio/app/data/fileTypes.ts instead.`);
    }
  }
  // Real import lines only: a type.ts can hold import text inside a template, like a new view's.
  if (path.basename(file) === 'type.ts' && ids.includes(own)) {
    for (const [, specifier] of code.matchAll(/^import\b[^\n]*?\bfrom\s*['"]([^'"]+)['"]/gm)) {
      if (specifier !== '../index.ts') problems.push(`${rel} imports "${specifier}". A type.ts can import only ../index.ts, because the build loads it directly in Node.`);
    }
  }
}

for (const id of ids) {
  const loader = path.join(TYPES, id, 'loader.ts');
  if (fs.existsSync(loader) && !fs.readFileSync(loader, 'utf8').includes('studioGlobs()')) {
    problems.push(`${path.relative(ROOT, loader)} should list its files with studioGlobs(), not a glob written out by hand: a new section and archived files would never reach it.`);
  }
}

if (problems.length) {
  console.error(problems.map((p) => `[file-types] ${p}`).join('\n'));
  process.exit(1);
}
console.log(`[file-types] ${ids.length} file type(s) (${ids.join(', ')}), all removable`);
