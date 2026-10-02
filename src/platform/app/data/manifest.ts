import { linkOptions } from '@tanstack/react-router';
import { itemSlug } from '@/platform/core/fileTypes';
import { isSectionKey } from '@/platform/core/roots';
import type { Item, Manifest, Prototype, PrototypeInfo, PrototypeRef } from '@/platform/app/data/types';

// Fetched once, then shared by every route loader. In dev, replaced whenever it changes.
let manifest: Promise<Manifest> | undefined;
export const setManifest = (m: Manifest) => { manifest = Promise.resolve(m); };
export function loadManifest(): Promise<Manifest> {
  manifest ??= fetch(`${import.meta.env.BASE_URL}prototypes/manifest.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`Couldn't load the studio (${r.status}). Check the connection and try again.`);
      return r.json() as Promise<Manifest>;
    })
    .catch((error: unknown) => { manifest = undefined; throw error; });
  return manifest;
}

// Everything that opens like a prototype: prototypes, the items of the modules' sections (tools), the Handbook's sections.
export const allPrototypes = (m: Manifest): PrototypeRef[] => [...m.prototypes, ...Object.values(m.sections).flat(), ...m.handbook];

export const findPrototype = (m: Manifest, contributor: string, prototype: string): PrototypeRef | undefined =>
  allPrototypes(m).find((p) => p.contributorKey === contributor && p.id === prototype);

// A prototype's items, fetched the first time they're needed (the deployed manifest leaves them out:
// scripts/build/build-manifest.js) and then kept on the manifest's entry for it. One fetch per prototype,
// however many callers ask. The dev server sends items with the manifest, so this returns at once there.
const fetching = new Map<string, Promise<Prototype>>();
export function withItems(ref: PrototypeRef): Promise<Prototype> {
  if (ref.items) return Promise.resolve(ref as Prototype);
  const key = `${ref.contributorKey}/${ref.id}/${ref.itemsHash ?? ''}`;
  let pending = fetching.get(key);
  if (!pending) {
    const url = `${import.meta.env.BASE_URL}prototypes/items/${encodeURIComponent(ref.contributorKey)}/${encodeURIComponent(ref.id)}.json${ref.itemsHash ? `?v=${ref.itemsHash}` : ''}`;
    pending = fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`Couldn't load ${ref.title}'s files (${r.status}).`); return r.json() as Promise<Item[]>; })
      .then((items) => { ref.items = items; return ref as Prototype; })
      .finally(() => fetching.delete(key));
    fetching.set(key, pending);
  }
  return pending;
}

// The prototype at an address, with its items loaded, or undefined.
export async function loadPrototype(contributor: string, prototype: string): Promise<Prototype | undefined> {
  const ref = findPrototype(await loadManifest(), contributor, prototype);
  return ref && withItems(ref);
}

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

export const newestFirst = (a: PrototypeInfo, b: PrototypeInfo) => (b.created ?? '').localeCompare(a.created ?? '');

// Where a prototype's links go. The prototype's own URL opens its default view: /prototypes/<person>/<id>, or
// /tools/<id> for an item of a section.
export const prototypeLink = (p: Pick<PrototypeInfo, 'contributorKey' | 'id'>) => isSectionKey(p.contributorKey)
  ? linkOptions({ to: '/$contributor/$prototype', params: { contributor: p.contributorKey, prototype: p.id } })
  : linkOptions({ to: '/prototypes/$contributor/$prototype', params: { contributor: p.contributorKey, prototype: p.id } });

// An item's URL: the prototype's, plus the item's path without its extension.
export const itemLink = (p: PrototypeInfo, item: Item) => isSectionKey(p.contributorKey)
  ? linkOptions({ to: '/$contributor/$prototype/$', params: { contributor: p.contributorKey, prototype: p.id, _splat: itemSlug(item.path) } })
  : linkOptions({ to: '/prototypes/$contributor/$prototype/$', params: { contributor: p.contributorKey, prototype: p.id, _splat: itemSlug(item.path) } });
