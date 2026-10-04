import fs from 'node:fs';
import postcss from 'postcss';
import { tailwindThemeProblems, themeInventory, themeAdapter, scopeThemeUtilities } from '../lib/tailwind-theme.js';
import { SYSTEM_SPECS } from '../../src/platform/modules/systems/node/systems.js';
import { cssProblems } from '../lib/css-scope.js';
// Fills in the two lists in the app's stylesheet (src/platform/app/styles.css) that depend on what is installed,
// so adding a design system or a module needs no edit to it. CSS can't be given a list at run time, so the stylesheet
// has a marker where each goes and this puts the lines in as the file is read:
//   /* @studio:system-themes */   an @import of each design system's styles/theme.css (src/systems/<id>/)
//   /* @studio:data-files */      an @source not for each folder of prototype-shaped folders' meta.json files, which
//                                  Tailwind would otherwise scan for class names and reload the page when they change
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG, PROTOTYPE_DIRS } from '../lib/modules.js';
import { PROTOTYPE_SYSTEMS } from '../../src/platform/modules/systems/node/systems.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const STYLESHEET = path.join(ROOT, 'src', 'platform', 'app', 'styles.css');
export function inventories() {
  return Object.entries(SYSTEM_SPECS).filter(([id]) => CONFIG.systems.includes(id)).map(([id, spec]) => ({ ...spec, inventory: themeInventory(fs.readFileSync(path.join(ROOT, 'src/systems', id, 'styles/theme.css'), 'utf8'), spec.themeClass) }));
}

const rel = (target) => path.relative(path.dirname(STYLESHEET), target).split(path.sep).join('/');

function validateThemes() {
  const problems = Object.keys(SYSTEM_SPECS).flatMap((id) => {
    const file = path.join(ROOT, 'src/systems', id, 'styles/theme.css');
    const code = fs.readFileSync(file, 'utf8');
    return [...(id === 'platform' ? [] : cssProblems(code, { file, themeClass: SYSTEM_SPECS[id].themeClass })), ...tailwindThemeProblems(code, { file, ...SYSTEM_SPECS[id] })];
  });
  if (problems.length) return problems.join('\n');
}

export default function css() {
  return {
    name: 'studio-css',
    enforce: 'pre',
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.css')) {
        const problem = validateThemes();
        if (problem) this.error(problem);
      }
    },
    transform(code, id) {
      if (path.resolve(id.split('?')[0]) !== STYLESHEET) return null;
      const problem = validateThemes();
      if (problem) this.error(problem);
      for (const system of Object.values(SYSTEM_SPECS)) this.addWatchFile(path.join(ROOT, system.dir, 'styles/theme.css'));
      const themes = Object.keys(PROTOTYPE_SYSTEMS).map((id) => `@import "${rel(path.join(ROOT, 'src', 'systems', id, 'styles', 'theme.css'))}";`).join('\n');
      const sources = ['prototypes', ...PROTOTYPE_DIRS.map((dir) => path.basename(dir))]
        .map((name) => `@source not "${rel(path.join(ROOT, 'src', name))}/**/meta.json";`).join('\n');
      return { code: code.replace('/* @studio:tailwind-theme */', themeAdapter(inventories())).replace('/* @studio:system-themes */', themes).replace('/* @studio:data-files */', sources), map: null };
    },
  };
}

export function scopedUtilities() {
  return { postcssPlugin: 'studio-system-utilities', Once(root) {
    let utilities = false;
    root.walkAtRules('layer', layer => { if (layer.params === 'utilities' && layer.nodes) utilities = true; });
    if (!utilities) return;
    const scoped = postcss.parse(scopeThemeUtilities(root.toString(), inventories()), { from: root.source?.input.file });
    root.removeAll();
    root.append(scoped.nodes);
  } };
}
