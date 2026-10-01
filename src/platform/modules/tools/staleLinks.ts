// The sentence a tool's Publish or Unpublish shows when files still link to the address the prototype left
// (src/platform/modules/tools/server.ts). Has no imports, so Node scripts and the app can both load it.

// The sentence for files that still link to an address a prototype has left (after Publish or Unpublish):
// one file by name, or the count and the first two.
export function staleLinksMessage(files: readonly string[]): string {
  if (files.length === 1) return `Update the link to the old address in ${files[0]}.`;
  return `${files.length} files still link to the old address: ${files.slice(0, 2).join(', ')}${files.length > 2 ? ', and more' : ''}.`;
}
