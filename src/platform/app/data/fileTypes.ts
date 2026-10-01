// The file types installed in src/platform/fileTypes/: one folder each, found with a glob, so the app
// runs with any of them removed. (scripts/lib/file-types.js finds the same folders for the
// build.) Core code reads types here and never imports a type's folder (scripts/check/check-file-types.js).
import { assertUniqueExtensions, matchFileType, type FileTypeSpec } from '@/platform/fileTypes';
import type { FileTypeModule } from '@/platform/app/data/fileTypeModule';

// The folder name is the type's id: /platform/fileTypes/view/type.ts → "view".
const idOf = (path: string) => path.split('/').at(-2)!;

const specs = import.meta.glob<FileTypeSpec>('/platform/fileTypes/*/type.ts', { eager: true, import: 'default' });
const modules = import.meta.glob<FileTypeModule>('/platform/fileTypes/*/module.tsx', { eager: true, import: 'default' });

export const FILE_TYPES: Record<string, FileTypeSpec> = Object.fromEntries(Object.entries(specs).map(([path, spec]) => [idOf(path), spec]));
export const fileTypeModules: Record<string, FileTypeModule> = Object.fromEntries(Object.entries(modules).map(([path, module]) => [idOf(path), module]));
assertUniqueExtensions(FILE_TYPES);

// The id of the type that owns a file, by its extension, or null for a plain file.
export const fileTypeOf = (file: string) => matchFileType(FILE_TYPES, file);

// The types you can make a new file of: those with a template, in the "+" menu.
export const creatableTypes = Object.entries(FILE_TYPES)
  .filter(([id, spec]) => spec.template && fileTypeModules[id])
  .map(([id, spec]) => ({ id, label: spec.label, extension: spec.extensions[0], icon: fileTypeModules[id].icon }));
