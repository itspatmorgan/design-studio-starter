// The file types installed in src/studio/fileTypes/ (one folder each, with a type.ts), for the build
// and the dev server. Delete a folder and its type is gone from here too. The app finds the
// same folders with a glob (src/studio/app/fileTypes.ts).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertUniqueExtensions, matchFileType } from '../../src/studio/fileTypes/index.ts';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/studio/fileTypes');

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
