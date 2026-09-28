// The kinds of item a prototype can hold. A file's kind comes from its extension, and
// folders are only for organizing, at any depth. The one exception: anything inside a
// components/ folder is a helper, not an item. Every other file (images, meta.json) is a
// plain file: it shows in the file tree while the app runs locally, but isn't an item.
//
// Adding a kind (say, documents) is an entry here, plus how the app opens it.
export const ITEM_KINDS = {
  view: { label: 'View', extensions: ['.tsx', '.jsx'] },
} as const;

export type ItemKind = keyof typeof ITEM_KINDS;

// The kind of a file, by its name, or null for a plain file.
export function kindOf(file: string): ItemKind | null {
  for (const [kind, { extensions }] of Object.entries(ITEM_KINDS)) {
    if ((extensions as readonly string[]).some((ext) => file.endsWith(ext))) return kind as ItemKind;
  }
  return null;
}

// An item's path in URLs and meta.json "start": its file path without the extension
// ("checkout/step-1.tsx" → "checkout/step-1").
export const itemSlug = (path: string) => path.replace(/\.[^./]+$/, '');

// Folder names whose contents are helpers, not items.
export const HELPER_FOLDER = 'components';
