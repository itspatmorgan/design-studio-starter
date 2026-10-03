// Repository Markdown links keep working in Git and in the app's reference reader.
export function markdownPath(path: string): string {
  const prefix = path.startsWith('/handbook/platform/') ? '/handbook/platform' : '/reference';
  const source = path.startsWith(`${prefix}/`) ? path.slice(prefix.length) : path;
  if (/^\/platform\/(?:modules|core)\/.*\.md$/.test(source)) return `/reference${source}`;
  return source;
}
