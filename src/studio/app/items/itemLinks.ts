// Links between items, the way a canvas stores them: the address of an item's page. A link
// resolves through the manifest to a prototype and an item, so it survives a change of host or
// base path, and one that points at nothing (the file was renamed or deleted) is reported as
// missing rather than breaking the page.
import { itemSlug } from '@/studio/fileTypes';
import type { Item, Manifest, Prototype } from '@/studio/app/data/types';

// The router's first path segments that aren't contributors (see router.tsx).
const APP_PAGES = new Set(['systems', 'guide']);

// The app's address on this origin, without a trailing slash: "" at the root, "/repo" under a base path.
const base = () => import.meta.env.BASE_URL.replace(/\/$/, '');

// An item's path in the app, without the base: "/patrick/hello-world/lofi/main" (or "/handbook/docs/principles").
export const itemPath = (p: Prototype, item: Item) =>
  `/${[p.contributorKey, p.id, ...itemSlug(item.path).split('/')].map(encodeURIComponent).join('/')}`;

// An item's full URL on this origin.
export const itemUrl = (p: Prototype, item: Item) => `${window.location.origin}${base()}${itemPath(p, item)}`;

// Whether an app path ("/patrick/hello-world/lofi/main") is in a prototype. A canvas shows only items
// from its own prototype, so prototypes stay self-contained.
export const isInPrototype = (path: string, p: { contributorKey: string; id: string }) =>
  path.startsWith(`/${encodeURIComponent(p.contributorKey)}/${encodeURIComponent(p.id)}/`);

// The app path a link points at ("/patrick/hello-world/lofi/main"), or null if it isn't a link
// into this app: another origin, another site, or a page that isn't a prototype item.
export function appPathOf(link: string): string | null {
  let url: URL;
  try { url = new URL(link, window.location.origin); } catch { return null; }
  if (url.origin !== window.location.origin) return null;
  const prefix = base();
  if (prefix && url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) return null;
  const path = url.pathname.slice(prefix.length);
  const parts = path.split('/').filter(Boolean);
  return parts.length >= 3 && !APP_PAGES.has(parts[0]) ? path.replace(/\/$/, '') : null;
}

// The prototype and item an app path opens, or null.
export function resolveItemPath(manifest: Manifest, path: string): { proto: Prototype; item: Item } | null {
  let parts: string[];
  try { parts = path.split('/').filter(Boolean).map(decodeURIComponent); } catch { return null; }
  const [contributor, prototype, ...slug] = parts;
  const proto = [...manifest.prototypes, ...manifest.tools, ...manifest.handbook].find((p) => p.contributorKey === contributor && p.id === prototype);
  // A prototype whose items aren't loaded yet (manifest.ts) has no items to find.
  const item = proto?.items?.find((i) => itemSlug(i.path) === slug.join('/'));
  return proto && item ? { proto: proto as Prototype, item } : null;
}
