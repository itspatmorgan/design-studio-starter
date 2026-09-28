import type { ViewModule } from '@/studio/app/data/types';

// Every view file, .tsx or .jsx. Vite only loads one when it is asked for.
export let views = import.meta.glob<ViewModule>([
  '/prototypes/**/*.{tsx,jsx}',
  '!/prototypes/**/components/**', // skip helpers
]);

type ViewPath = { contributor: string; prototype: string; group?: string | null; view: string };

// The loader for a view, by its URL parts (view name without extension), or undefined.
export function findView({ contributor, prototype, group, view }: ViewPath) {
  const base = `/prototypes/${contributor}/${prototype}/${group ? `${group}/` : ''}${view}`;
  return views[`${base}.tsx`] ?? views[`${base}.jsx`];
}

// One import per view, reused on every later visit.
const loaded = new Map<string, Promise<ViewModule>>();
export function loadView(path: ViewPath): Promise<ViewModule> | undefined {
  const load = findView(path);
  if (!load) return undefined;
  const key = [path.contributor, path.prototype, path.group ?? '', path.view].join('/');
  if (!loaded.has(key)) loaded.set(key, load());
  return loaded.get(key);
}

// In dev, adding or removing a view file changes the list above. Take the new list in place
// instead of letting Vite reload the page.
if (import.meta.hot) {
  import.meta.hot.accept((next) => {
    if (!next) return;
    views = next.views;
    loaded.clear();
  });
}
