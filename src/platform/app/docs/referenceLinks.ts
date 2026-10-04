// Resolve repository Markdown paths to the owning app surface.
export function markdownPath(path: string): string {
  const source = path.replace(/^\/documentation\/reference(?=\/)/, '');
  const content = source.match(/^\/systems\/([^/]+)\/(context|rules|skills)(\/.*)?$/);
  if (content) return '/systems/' + content[1] + '/' + content[2] + (content[3] ?? '').replace(/\.md$/, '');
  if (/^\/(?:platform\/core|modules)\//.test(source) && source.endsWith('.md')) return '/documentation/reference' + source;
  return path;
}
