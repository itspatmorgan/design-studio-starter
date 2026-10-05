// Resolve repository Markdown paths to the owning app surface.
export function markdownPath(path: string): string {
  const source = path.replace(/^\/documentation\/reference(?=\/)/, '');
  const chapter = source.match(/^\/modules\/documentation\/pages\/([a-z0-9-]+)\.md$/);
  if (chapter) return '/documentation/guide' + (chapter[1] === 'index' ? '' : '/' + chapter[1]);
  const content = source.match(/^\/systems\/([^/]+)\/(context|rules|skills)(\/.*)?$/);
  if (content) return '/systems/' + content[1] + '/' + content[2] + (content[3] ?? '').replace(/\.md$/, '');
  if (/^\/(?:platform\/core|modules)\//.test(source) && source.endsWith('.md')) return '/documentation/reference' + source;
  return path;
}
