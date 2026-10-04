// The Guide pages that live with what they describe: the README.md of a module (a file type is one), when it opens
// with Guide frontmatter (a title, a section, an order). The Guide shows the README down to its "For developers"
// heading (scripts/build/remark-readme-guide.js), so the page goes with the folder when the module is off or deleted.
// Returns the READMEs that exist: { file (absolute), source (as the app's glob names it), folder }.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENABLED_MODULES } from './modules.js';

const MODULES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/modules');

export function readmes() {
  return ENABLED_MODULES
    .map((m) => ({ file: path.join(MODULES, m.id, 'README.md'), source: `/modules/${m.id}/README.md`, folder: m.id }))
    .filter(({ file }) => fs.existsSync(file));
}

export const README_FILES = () => readmes().map(({ file }) => file);
