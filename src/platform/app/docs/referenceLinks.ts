// Repository Markdown links resolve to the reader for their authoritative source.
export function markdownPath(path: string): string {
  const prefix = '/documentation/reference';
  const source = path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path;
  if (/^\/platform\/(?:modules|core)\/.*\.md$/.test(source)) return `${prefix}${source}`;
  return source.replace(/^\/handbook\/docs(?=\/|$)/, '/handbook/context');
}
