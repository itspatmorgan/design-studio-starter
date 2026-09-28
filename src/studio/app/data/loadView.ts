import type { ViewModule } from '@/studio/app/data/types';

// Every view file, .tsx or .jsx. Vite only loads one when it is asked for.
export let views = import.meta.glob<ViewModule>([
  '/prototypes/**/*.{tsx,jsx}',
  '!/prototypes/**/components/**', // skip helpers
]);

type ViewPath = { contributor: string; prototype: string; group?: string | null; view: string };

// The browser keeps every module it imports, by URL, until the page reloads. In dev, files
// get moved and renamed, so a path can hold different code over time. Importing with a stamp
// that changes whenever the list of views changes makes the browser load the current file.
// (Vite's hot reload does the same, and it treats the stamped URL as the same module.)
let stamp = Date.now();

// The loader for a view, by its URL parts (view name without extension), or undefined.
export function findView({ contributor, prototype, group, view }: ViewPath) {
  const base = `/prototypes/${contributor}/${prototype}/${group ? `${group}/` : ''}${view}`;
  const key = views[`${base}.tsx`] ? `${base}.tsx` : views[`${base}.jsx`] ? `${base}.jsx` : null;
  if (!key) return undefined;
  if (import.meta.hot) return () => import(/* @vite-ignore */ `${key}?t=${stamp}`) as Promise<ViewModule>;
  return views[key];
}

// In dev, resolves when Vite next updates the list above (or after a timeout).
let waiting: (() => void)[] = [];
const nextViews = (ms: number) => new Promise<void>((resolve) => {
  waiting.push(resolve);
  setTimeout(resolve, ms);
});

// One import per view, reused on every later visit. In dev, a view the app just created or
// renamed can be in the manifest a moment before Vite adds it here: pass inManifest to wait
// for it briefly. An unknown address doesn't wait.
const loaded = new Map<string, Promise<ViewModule>>();
export async function loadView(path: ViewPath, { inManifest = false } = {}): Promise<ViewModule | undefined> {
  let load = findView(path);
  if (!load && inManifest && import.meta.hot) {
    await nextViews(2000);
    load = findView(path);
  }
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
    stamp = Date.now();
    loaded.clear();
    waiting.forEach((resolve) => resolve());
    waiting = [];
    // Tell the router to reload the open view (router.tsx): a view that had no component
    // yet, like a new empty file, reaches here once you write one.
    window.dispatchEvent(new Event('studio:views'));
  });
}
