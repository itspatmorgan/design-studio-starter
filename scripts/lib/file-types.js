// The file types installed in src/platform/modules/ (the modules that have a type.ts), for the build
// and the dev server. Delete a folder and its type is gone from here too. The app finds the
// same folders with a glob (src/platform/app/data/fileTypes.ts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertUniqueExtensions, handbookType, matchFileType } from '../../src/platform/core/fileTypes.ts';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/platform/modules');

const ids = fs.readdirSync(DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(DIR, d.name, 'type.ts')))
  .map((d) => d.name)
  .sort();

export const FILE_TYPES = Object.fromEntries(await Promise.all(
  ids.map(async (id) => [id, (await import(pathToFileURL(path.join(DIR, id, 'type.ts')).href)).default]),
));
assertUniqueExtensions(FILE_TYPES);

// The id of the type that owns a file, by its extension, or null for a plain file.
export const fileTypeOf = (file) => matchFileType(FILE_TYPES, file);
// Whether a file can open as text: under the size limit every committed file has
// (check-asset-size.js) and with no NUL bytes in its start, which binary files have.
const MAX_TEXT_BYTES = 750 * 1024;
export function isTextFile(file) {
  if (fs.statSync(file).size > MAX_TEXT_BYTES) return false;
  const fd = fs.openSync(file, 'r');
  try {
    const head = Buffer.alloc(8000);
    return !head.subarray(0, fs.readSync(fd, head, 0, head.length, 0)).includes(0);
  } finally { fs.closeSync(fd); }
}

// The id of the type that opens a file in the Handbook (src/handbook/): a document, or else plain text.
export const handbookTypeOf = (file) => handbookType(FILE_TYPES, file);
