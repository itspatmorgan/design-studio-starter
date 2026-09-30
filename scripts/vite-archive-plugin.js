// Leaves archived prototypes and views out of the production build (src/studio/archive.ts).
//
// Each file type finds its files with a Vite glob (src/studio/fileTypes/<type>/loader.ts), and every
// file it matches becomes a chunk. Globs have to be written out literally, so this adds a negated
// pattern for each archived file or prototype to the source of those loaders as they're read.
// Nothing changes in dev, where everything shows. The deployed manifest leaves the same things
// out (scripts/build-manifest.js --deploy).
import { buildManifest } from './build-manifest.js';

// A path as a literal glob: characters that mean something to a glob are escaped. A trailing /**
// (a whole prototype) is kept.
function literal(glob) {
  const escape = (s) => s.replace(/[\\()[\]{}*?!+@|]/g, '\\$&');
  return glob.endsWith('/**') ? `${escape(glob.slice(0, -3))}/**` : escape(glob);
}

// The start of a loader's glob list: import.meta.glob(['...', ...]) or import.meta.glob<Type>([...]).
const GLOB_LIST = /(import\.meta\.glob(?:<[^(]*>)?\(\s*\[)/;
const LOADER = /[\\/]fileTypes[\\/][^\\/]+[\\/]loader\.ts$/;

export default function archive() {
  let negations = [];
  let patched = 0;
  return {
    name: 'archive',
    apply: 'build',
    enforce: 'pre',
    buildStart() {
      const { archived } = buildManifest({ deploy: true, write: false, quiet: true });
      negations = archived.map((glob) => JSON.stringify(`!${literal(glob)}`));
      patched = 0;
    },
    transform(code, id) {
      if (!negations.length || !LOADER.test(id.split('?')[0]) || !GLOB_LIST.test(code)) return null;
      patched++;
      return { code: code.replace(GLOB_LIST, `$1 ${negations.join(', ')},`), map: null };
    },
    // Archived files that no loader was told about would ship in the build, so stop instead.
    buildEnd() {
      if (negations.length && patched === 0) {
        this.error('Archived views and prototypes could not be left out of the build: no file type loader (src/studio/fileTypes/<type>/loader.ts) has a glob written as import.meta.glob([...]).');
      }
    },
  };
}
