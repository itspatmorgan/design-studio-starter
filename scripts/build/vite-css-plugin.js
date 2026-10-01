// Fills in the two lists in the app's stylesheet (src/studio/styles/index.css) that depend on what is installed,
// so adding a design system or a module needs no edit to it. CSS can't be given a list at run time, so the stylesheet
// has a marker where each goes and this puts the lines in as the file is read:
//   /* @studio:system-themes */   an @import of each design system's styles/theme.css (src/systems/<id>/)
//   /* @studio:data-files */      an @source not for each folder of prototype-shaped folders' meta.json files, which
//                                  Tailwind would otherwise scan for class names and reload the page when they change
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROTOTYPE_DIRS } from '../lib/modules.js';
import { SYSTEM_IDS } from '../lib/systems.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const STYLESHEET = path.join(ROOT, 'src', 'studio', 'styles', 'index.css');
const rel = (target) => path.relative(path.dirname(STYLESHEET), target).split(path.sep).join('/');

export default function css() {
  return {
    name: 'studio-css',
    enforce: 'pre',
    transform(code, id) {
      if (path.resolve(id.split('?')[0]) !== STYLESHEET) return null;
      const themes = SYSTEM_IDS.map((id) => `@import "${rel(path.join(ROOT, 'src', 'systems', id, 'styles', 'theme.css'))}";`).join('\n');
      const sources = ['prototypes', ...PROTOTYPE_DIRS.map((dir) => path.basename(dir))]
        .map((name) => `@source not "${rel(path.join(ROOT, 'src', name))}/**/meta.json";`).join('\n');
      return { code: code.replace('/* @studio:system-themes */', themes).replace('/* @studio:data-files */', sources), map: null };
    },
  };
}
