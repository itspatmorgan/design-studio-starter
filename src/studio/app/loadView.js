const views = import.meta.glob([
  '/prototypes/**/*.jsx',
  '!/prototypes/_*/**',            // skip _templates
  '!/prototypes/**/components/**', // skip helpers
]);

export function loadView({ contributor, prototype, group, view }) {
  const folder = group ? `${prototype}/${group}` : prototype;
  const path = `/prototypes/${contributor}/${folder}/${view}`;
  const load = views[path];
  if (!load) throw new Error(`View not found: ${path}`);
  return load();
}
