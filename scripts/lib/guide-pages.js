// The Guide pages that live with what they describe: the README.md of a module or a file type, when it opens
// with Guide frontmatter (a title, a section, an order). The Guide shows the README down to its "For developers"
// heading (scripts/build/remark-readme-guide.js), so the page goes with the folder when the module is off or deleted.
// Returns the READMEs that exist: { file (absolute), source (as the app's glob names it), folder }.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENABLED_MODULES } from './modules.js';

const PLATFORM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/platform');
const FILE_TYPES = path.join(PLATFORM, 'fileTypes');

export function readmes() {
  const folders = [
    ...ENABLED_MODULES.map((m) => ['modules', m.id]),
    ...(fs.existsSync(FILE_TYPES) ? fs.readdirSync(FILE_TYPES, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => ['fileTypes', d.name]) : []),
  ];
  return folders
    .map(([kind, folder]) => ({ file: path.join(PLATFORM, kind, folder, 'README.md'), source: `/platform/${kind}/${folder}/README.md`, folder }))
    .filter(({ file }) => fs.existsSync(file));
}

export const README_FILES = () => readmes().map(({ file }) => file);
