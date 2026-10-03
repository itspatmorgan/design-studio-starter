// Repository Markdown links keep working in Git and in the app's reference reader.
export function markdownPath(path: string): string {
  const source = path.startsWith('/reference/') ? path.slice('/reference'.length) : path;
  if (/^\/platform\/(?:modules|core)\/.*\.md$/.test(source)) return `/reference${source}`;
  return source;
}
