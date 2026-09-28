// The file types a prototype can hold: the files the app can open. A file's type comes
// from its extension, and folders are only for organizing, at any depth. The one exception:
// anything inside a components/ folder is a helper, not an item. Every other file (images,
// meta.json) is a plain file: the nav hides it unless you choose Show all files.
//
// Adding a file type (say, documents) is an entry here, plus how the app opens it.
export const FILE_TYPES = {
  view: { label: 'View', extensions: ['.tsx', '.jsx'] },
} as const;

export type FileType = keyof typeof FILE_TYPES;

// The file type of a file, by its name, or null for a plain file.
export function fileTypeOf(file: string): FileType | null {
  for (const [fileType, { extensions }] of Object.entries(FILE_TYPES)) {
    if ((extensions as readonly string[]).some((ext) => file.endsWith(ext))) return fileType as FileType;
  }
  return null;
}

// An item's path in URLs and meta.json "start": its file path without the extension
// ("checkout/step-1.tsx" → "checkout/step-1").
export const itemSlug = (path: string) => path.replace(/\.[^./]+$/, '');

// Folder names whose contents are helpers, not items.
export const HELPER_FOLDER = 'components';
