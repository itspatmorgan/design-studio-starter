import type { ViewModule } from '@/studio/app/data/types';

// Every view file, .tsx or .jsx, at any depth (src/fileTypes.ts). Vite only loads one when it
// is asked for.
const glob = import.meta.glob<ViewModule>([
  '/prototypes/**/*.{tsx,jsx}',
  '!/prototypes/**/components/**', // skip helpers
]);

// In dev, adding or removing a view file makes Vite run this file again with a new list.
// The app keeps calling the functions from the first run, so everything they read lives
// in one state object that Vite keeps across runs (import.meta.hot.data).
type State = {
  views: typeof glob;
  // The browser keeps every module it imports, by URL, until the page reloads. Files get
  // moved and renamed in dev, so a path can hold different code over time. Importing with
  // a stamp that changes with the list makes the browser load the current file. (Vite's
  // hot reload does the same, and treats the stamped URL as the same module.)
  stamp: number;
  loaded: Map<string, Promise<ViewModule>>;
  waiting: (() => void)[];
  withoutComponent: Set<string>;
};
const state: State = import.meta.hot?.data.state ?? {
  views: glob, stamp: Date.now(), loaded: new Map(), waiting: [], withoutComponent: new Set(),
};

// A view file in a prototype: its path in the prototype, like "checkout/step-1.tsx".
type ViewFile = { contributor: string; prototype: string; path: string };

// The loader for a view file, or undefined.
export function findView({ contributor, prototype, path }: ViewFile) {
  const key = `/prototypes/${contributor}/${prototype}/${path}`;
  if (!state.views[key]) return undefined;
  if (import.meta.hot) return () => import(/* @vite-ignore */ `${key}?t=${state.stamp}`) as Promise<ViewModule>;
  return state.views[key];
}

// Views loaded without a default export, so the router reloads them once the file changes.
export const viewsWithoutComponent = state.withoutComponent;

// In dev, resolves when the list next changes (or after a timeout).
const nextViews = (ms: number) => new Promise<void>((resolve) => {
  state.waiting.push(resolve);
  setTimeout(resolve, ms);
});

// One import per view, reused on every later visit. In dev, a view the app just created or
// moved can be in the manifest a moment before Vite adds it here: pass inManifest to wait
// for it briefly. An unknown address doesn't wait.
export async function loadView(file: ViewFile, { inManifest = false } = {}): Promise<ViewModule | undefined> {
  let load = findView(file);
  if (!load && inManifest && import.meta.hot) {
    await nextViews(2000);
    load = findView(file);
  }
  if (!load) return undefined;
  const key = [file.contributor, file.prototype, file.path].join('/');
  if (!state.loaded.has(key)) state.loaded.set(key, load());
  return state.loaded.get(key);
}

if (import.meta.hot) {
  import.meta.hot.data.state = state;
  // A later run, with a new list: take it, and wake anything waiting for it.
  if (state.views !== glob) {
    state.views = glob;
    state.stamp = Date.now();
    state.loaded.clear();
    state.waiting.splice(0).forEach((resolve) => resolve());
    // A view that had no component yet, like a new empty file, reaches here once you write
    // one: tell the router to reload it (router.tsx).
    if (state.withoutComponent.size) {
      state.withoutComponent.clear();
      window.dispatchEvent(new Event('studio:views'));
    }
  }
  import.meta.hot.accept();
}
