// File types: the kinds of file a prototype holds that the app can open. A file's type comes
// from its extension, and folders are only for organizing, at any depth. The one exception:
// anything inside a components/ folder is a helper, not an item. Every other file (images,
// meta.json) is a plain file: the nav hides it unless you choose Show all files in the prototype's … menu.
//
// Each type is a self-contained folder, src/fileTypes/<type>/ (view/, document/), and the app
// runs with any of them removed: delete the folder and its files become plain files. A type has
//   type.ts     what the build and the app both need to know (this file's FileTypeSpec)
//   module.tsx  how the app opens it: its icon, how it loads, and its page
// To add a type, see src/fileTypes/README.md. This file has no imports, so Node scripts can
// load it directly.

export type FileTypeSpec = {
  label: string;                        // "View", "Document"
  extensions: readonly string[];        // ".tsx", ".mdx"
  // The syntax the Source view highlights (src/studio/app/pages/prototype/SourcePane.tsx). Leave it
  // out for a type with no source to show.
  language?: 'tsx' | 'markdown';
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

// Two types can't own the same extension.
export function assertUniqueExtensions(specs: Record<string, FileTypeSpec>) {
  const owners = new Map<string, string>();
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
