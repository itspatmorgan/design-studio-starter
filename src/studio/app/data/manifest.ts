import { linkOptions } from '@tanstack/react-router';
import { itemSlug } from '@/studio/fileTypes';
import type { Item, Manifest, Prototype } from '@/studio/app/data/types';

// Fetched once, then shared by every route loader. In dev, replaced whenever it changes.
let manifest: Promise<Manifest> | undefined;
export const setManifest = (m: Manifest) => { manifest = Promise.resolve(m); };
export function loadManifest(): Promise<Manifest> {
  manifest ??= fetch(`${import.meta.env.BASE_URL}prototypes/manifest.json`)
    .then((r) => r.json() as Promise<Manifest>)
    .catch(() => ({ prototypes: [], guide: [], handbook: [], handbookMap: null, systems: {} }));
  return manifest;
}

export const findPrototype = (m: Manifest, contributor: string, prototype: string) =>
  [...m.prototypes, ...m.handbook].find((p) => p.contributorKey === contributor && p.id === prototype);

export { itemSlug };

// A prototype opens on its meta.json "start" item, or else its first item (the top of its
// file tree).
export function firstItem(p: Prototype): Item | undefined {
  return (p.start && p.items.find((i) => i.path === p.start)) || p.items[0];
}

// The item at a URL path ("lofi/main"), or undefined.
export const findItem = (p: Prototype, slug: string) => p.items.find((i) => itemSlug(i.path) === slug);

// "checkout/session-done.tsx" → "Session Done": an item's name, without its folder.
export const itemLabel = (path: string) =>
  itemSlug(path).split('/').pop()!.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// "checkout/steps/done.tsx" → "checkout/steps": the folder it's in, or "".
export const itemFolder = (path: string) => (path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '');

// "2026-09-27" → "Sep 27, 2026"
export function formatDate(date: string | null) {
  if (!date) return '';
  const d = new Date(`${date}T00:00:00`);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const newestFirst = (a: Prototype, b: Prototype) => (b.created ?? '').localeCompare(a.created ?? '');

// Where a prototype's links go. The prototype's own URL opens its default view.
export const prototypeLink = (p: Prototype) =>
  linkOptions({ to: '/$contributor/$prototype', params: { contributor: p.contributorKey, prototype: p.id } });

// An item's URL: the prototype's, plus the item's path without its extension.
export const itemLink = (p: Prototype, item: Item) =>
  linkOptions({ to: '/$contributor/$prototype/$', params: { contributor: p.contributorKey, prototype: p.id, _splat: itemSlug(item.path) } });
