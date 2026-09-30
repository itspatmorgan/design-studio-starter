// File types: the kinds of file a prototype holds that the app can open. A file's type comes
// from its extension, and folders are only for organizing, at any depth. The one exception:
// anything inside a components/ folder is a helper, not an item. Every other file (images,
// meta.json) is a plain file: the nav hides it unless you choose Show all files in the prototype's … menu.
//
// Each type is a self-contained folder, src/studio/fileTypes/<type>/ (view/, document/), and the app
// runs with any of them removed: delete the folder and its files become plain files. A type has
//   type.ts     what the build and the app both need to know (this file's FileTypeSpec)
//   module.tsx  how the app opens it: its icon, how it loads, and its page
// To add a type, see src/studio/fileTypes/README.md. This file has no imports, so Node scripts can
// load it directly.

export type FileTypeSpec = {
  label: string;                        // "View", "Document"
  extensions: readonly string[];        // ".tsx", ".md"
  // The syntax the Source view highlights (src/studio/app/pages/prototype/SourcePane.tsx). Leave it
  // out for a type with no source to show.
  language?: 'tsx' | 'markdown' | 'json' | 'text';
  // True if the type shows itself live where another item includes it (on a canvas), and false or
  // absent for a card. Its module.tsx provides the Embed; this is for code that can't load that
  // (the command line), to size things.
  preview?: boolean;
  // True if the type opens in the Handbook (src/handbook/), where every other file opens as plain
  // text instead of as its own type. (A script in a skill's folder is text there, not a view.)
  inHandbook?: boolean;
  // True for the one type that opens any file no other type claims, where the Handbook allows it.
  // It has no extensions of its own, and prototypes never use it: their other files stay plain.
  fallback?: boolean;
  // True if a file of this type can be archived: a `@status archived` tag in a comment at the top of
  // the file (src/studio/archive.ts) leaves it out of the deployed site. Only for types whose files
  // can hold such a comment.
  archivable?: boolean;
  // The contents of a new file called `name` ("user-settings.tsx"). Without it, the "+" menu
  // doesn't offer to make this type.
  template?: (name: string) => string;
  // Problems in a file, each a sentence that says what to fix. `frontmatter` is the leading
  // --- block as simple key: value pairs, or null when there isn't one.
  check?: (file: { source: string; frontmatter: Record<string, unknown> | null }) => string[];
};

export const defineFileType = (spec: FileTypeSpec) => spec;

// The id of the type that owns a file, by its extension, or null for a plain file.
export function matchFileType(specs: Record<string, FileTypeSpec>, file: string): string | null {
  for (const [id, { extensions }] of Object.entries(specs)) {
    if (extensions.some((ext) => file.endsWith(ext))) return id;
  }
  return null;
}

// The id of the type that opens files no other type claims, or null if none is installed.
export function fallbackType(specs: Record<string, FileTypeSpec>): string | null {
  return Object.entries(specs).find(([, spec]) => spec.fallback)?.[0] ?? null;
}

// The id of the type that opens a file in the Handbook: its own type if that type opens there,
// otherwise the fallback (plain text), otherwise null.
export function handbookType(specs: Record<string, FileTypeSpec>, file: string): string | null {
  const id = matchFileType(specs, file);
  return id && specs[id].inHandbook ? id : fallbackType(specs);
}

// Two types can't own the same extension.
export function assertUniqueExtensions(specs: Record<string, FileTypeSpec>) {
  const owners = new Map<string, string>();
  const fallbacks = Object.entries(specs).filter(([, spec]) => spec.fallback).map(([id]) => id);
  if (fallbacks.length > 1) throw new Error(`File types ${fallbacks.map((id) => `"${id}"`).join(' and ')} are both the fallback. Only one type can open the files no other type claims.`);
  for (const [id, { extensions }] of Object.entries(specs)) {
    for (const ext of extensions) {
      const other = owners.get(ext);
      if (other) throw new Error(`File types "${other}" and "${id}" both use ${ext}. A file's type comes from its extension, so each extension can belong to only one.`);
      owners.set(ext, id);
    }
  }
}

// An item's path in URLs and meta.json "start": its file path without the extension
// ("checkout/step-1.tsx" → "checkout/step-1").
export const itemSlug = (path: string) => path.replace(/\.[^./]+$/, '');

// Folder names whose contents are helpers, not items.
export const HELPER_FOLDER = 'components';
