// File types: the kinds of file a prototype holds that the app can open. A file's type comes
// from its extension, and folders are only for organizing, at any depth. The one exception:
// a file or folder whose name starts with an underscore (_components/, _data.ts) is a helper, not an artifact. Every other file (images,
// meta.json) is a plain file: the nav hides it unless you choose Show all files in the prototype's … menu.
//
// Each type belongs to a module folder, src/modules/<type>/ (view/, document/).
// Optional types can be removed: delete the folder and its files become plain files. A type has
//   type.ts     what the build and the app both need to know (this file's FileTypeSpec)
//   open.tsx    how the app opens it: its icon, how it loads, and its page
// To add a type, see src/platform/context/file-types.md. This file has no imports, so Node scripts can
// load it directly.

export type FileTypeSpec = {
  label: string;                        // "View", "Document"
  extensions: readonly string[];        // ".tsx", ".md"
  // The syntax the Source view highlights (src/platform/app/source/ArtifactSource.tsx). Leave it
  // out for a type with no source to show.
  language?: 'tsx' | 'markdown' | 'json' | 'mermaid' | 'text';
  // True if the type shows itself live where another artifact includes it (on a canvas), and false for a card. Its open.tsx provides the Embed; this is for code that can't load that
  // (the command line), to size things.
  preview: boolean;
  // True if the type opens in the system content (src/platform/), where every other file opens as plain
  // text instead of as its own type. (A script in a skill's folder is text there, not a view.)
  inSystemContent: boolean;
  // False for a type owned by a shared section, such as system content Markdown.
  // Declare true to permit files in prototypes, false to exclude them.
  inPrototype: boolean;
  // True for the one type that opens any file no other type claims, where the system content allows it.
  // It has no extensions of its own, and prototypes never use it: their other files stay plain.
  fallback: boolean;
  // Set if a file of this type can be shown in lofi: rough, grayscale, with handwritten type, over the
  // same components. A file says so itself (a view starts with /** @lofi */), so it stays with the file
  // when it is renamed or moved. `isLofi` reads that from the file's text, and `setLofi` returns the text
  // with it switched on or off. Both are plain string functions: Node loads them for the manifest.
  fidelity?: {
    isLofi(source: string): boolean;
    setLofi(source: string, on: boolean): string;
  };
  // The contents of a new file called `name` ("user-settings.tsx"). Without it, the "+" menu
  // doesn't offer to make this type.
  template?: (name: string) => string;
  // Problems in a file, each a sentence that says what to fix. `frontmatter` is the leading
  // --- block as simple key: value pairs, or null when there isn't one. `prototype` is where the file is,
  // for a rule that depends on it (a canvas can't link to another prototype), and is left out in the system content.
  check?: (file: { source: string; frontmatter: Record<string, unknown> | null; prototype?: { contributor: string; id: string } }) => string[];
};

export const defineFileType = (spec: FileTypeSpec) => {
  for (const key of ['preview', 'inSystemContent', 'inPrototype', 'fallback'] as const) {
    if (typeof spec[key] !== 'boolean') throw new Error(`File type ${spec.label}: declare ${key} as true or false.`);
  }
  return spec;
};

// The id of the type that owns a file, by its extension, or null for a plain file.
export function matchFileType(specs: Record<string, FileTypeSpec>, file: string): string | null {
  for (const [id, { extensions, inPrototype }] of Object.entries(specs)) {
    if (inPrototype === true && extensions.some((ext) => file.endsWith(ext))) return id;
  }
  return null;
}

// The id of the type that opens files no other type claims, or null if none is installed.
export function fallbackType(specs: Record<string, FileTypeSpec>): string | null {
  return Object.entries(specs).find(([, spec]) => spec.fallback)?.[0] ?? null;
}

// The id of the type that opens a file in the system content: its own type if that type opens there,
// otherwise the fallback (plain text), otherwise null.
export function systemContentType(specs: Record<string, FileTypeSpec>, file: string): string | null {
  return Object.entries(specs).find(([, spec]) => spec.inSystemContent && spec.extensions.some((ext) => file.endsWith(ext)))?.[0] ?? fallbackType(specs);
}

// Two types cannot own the same extension within the same content scope.
export function assertUniqueExtensions(specs: Record<string, FileTypeSpec>) {
  const owners = new Map<string, string>();
  const fallbacks = Object.entries(specs).filter(([, spec]) => spec.fallback).map(([id]) => id);
  if (fallbacks.length > 1) throw new Error(`File types ${fallbacks.map((id) => `"${id}"`).join(' and ')} are both the fallback. Only one type can open the files no other type claims.`);
  for (const [id, spec] of Object.entries(specs)) {
    for (const scope of ['prototype', 'systemContent'] as const) {
      if (scope === 'prototype' ? spec.inPrototype !== true : !spec.inSystemContent) continue;
      for (const ext of spec.extensions) {
        const key = `${scope}:${ext}`;
        const other = owners.get(key);
        if (other) throw new Error(`File types "${other}" and "${id}" both use ${ext} in ${scope}. Each extension can belong to only one type in a scope.`);
        owners.set(key, id);
      }
    }
  }
}

// An artifact's path in URLs: its file path without the extension
// ("checkout/step-1.tsx" → "checkout/step-1").
export const artifactSlug = (path: string) => path.replace(/\.[^./]+$/, '');

// Helpers, not artifacts: a file or folder named with a leading underscore, at any depth. Everything inside
// a helper folder is a helper too.
export const isHelper = (name: string) => name.startsWith('_');

// Markdown presentation is shared by prototype Documents and the system content.
// "problem-framing.md" → "Problem Framing"
const titleOf = (name: string) => name.replace(/\.md$/, '').split(/[-_]/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

export const markdownFileType: FileTypeSpec = {
  label: 'Document',
  preview: false,
  inPrototype: true,
  inSystemContent: false,
  fallback: false,
  extensions: ['.md'],
  language: 'markdown',

  template: (name) =>
    `---\ntitle: ${titleOf(name) || 'Untitled'}\n---\n\nThis document is empty. Ask your agent to write it: describe what it's for and who will read it.\n`,

  check: ({ source, frontmatter }) => {
    const problems: string[] = [];
    if (/^---\r?\n/.test(source) && !frontmatter) problems.push('its frontmatter (the block at the top between --- lines) is never closed. End it with a second --- line.');
    if (frontmatter && 'toc' in frontmatter && typeof frontmatter.toc !== 'boolean') problems.push('"toc" in the frontmatter must be true or false.');
    return problems;
  },
};
