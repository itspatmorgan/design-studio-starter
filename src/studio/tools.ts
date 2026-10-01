// Tools: prototypes the team has published. A tool lives in src/tools/<id>/ (the reserved key "tools",
// roots.ts), not under a person, and meta.json "maintainers" lists the contributors.json keys of the
// people who may change it (src/studio/permissions.ts). Anyone can use a tool and read its files.
// Has no imports, so Node scripts and the app can both load it.

// The sentence for files that still link to an address a prototype has left (after Publish or Unpublish):
// one file by name, or the count and the first two.
export function staleLinksMessage(files: readonly string[]): string {
  if (files.length === 1) return `Update the link to the old address in ${files[0]}.`;
  return `${files.length} files still link to the old address: ${files.slice(0, 2).join(', ')}${files.length > 2 ? ', and more' : ''}.`;
}
