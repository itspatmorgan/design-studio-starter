// Gives each file type's loader (src/studio/fileTypes/<type>/loader.ts) the list of files it opens, and
// leaves archived prototypes and views out of the production build (src/studio/core/archive.ts).
//
// Vite needs a glob written out literally, so a loader says studioGlobs() and this puts the patterns in
// its place as the file is read: the type's extensions in every folder that holds items, which come from
// the modules' sections (src/studio/modules/globs.ts). In a production build it adds a negated pattern
// for each archived file or prototype, so those never become chunks. Nothing is left out in dev, where
// everything shows. The deployed manifest leaves the same things out (scripts/build/build-manifest.js --deploy).
import { buildManifest } from './build-manifest.js';
import { FILE_TYPES } from '../lib/file-types.js';
import { ENABLED_MODULES } from '../lib/modules.js';
import { globsFor } from '../../src/studio/modules/globs.ts';

// A path as a literal glob: characters that mean something to a glob are escaped. A trailing /**
// (a whole prototype) is kept.
function literal(glob) {
  const escape = (s) => s.replace(/[\\()[\]{}*?!+@|]/g, '\\$&');
  return glob.endsWith('/**') ? `${escape(glob.slice(0, -3))}/**` : escape(glob);
}

const LOADER = /[\\/]fileTypes[\\/]([^\\/]+)[\\/]loader\.ts$/;
const MACRO = /\bstudioGlobs\(\)/g;

export default function globs() {
  let isBuild = false;
  let negations = [];
  let replaced = 0;
  return {
    name: 'studio-globs',
    enforce: 'pre',
    configResolved(c) { isBuild = c.command === 'build'; },
    buildStart() {
      replaced = 0;
      if (!isBuild) return;
      const { archived } = buildManifest({ deploy: true, write: false, quiet: true });
      negations = archived.map((glob) => `!${literal(glob)}`);
    },
    transform(code, id) {
      const match = LOADER.exec(id.split('?')[0]);
      if (!match || !code.includes('studioGlobs()')) return null;
      const list = JSON.stringify([...globsFor(match[1], FILE_TYPES, ENABLED_MODULES), ...negations]);
      replaced++;
      return { code: code.replace(MACRO, list), map: null };
    },
    // Archived files that no loader was told about would ship in the build, so stop instead.
    buildEnd() {
      if (negations.length && replaced === 0) {
        this.error('Archived views and prototypes could not be left out of the build: no file type loader (src/studio/fileTypes/<type>/loader.ts) lists its files with studioGlobs().');
      }
    },
  };
}
