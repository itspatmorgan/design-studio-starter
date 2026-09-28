import { linkOptions } from '@tanstack/react-router';
import type { Manifest, Prototype, View } from '@/studio/app/data/types';

// Fetched once, then shared by every route loader.
let manifest: Promise<Manifest> | undefined;
export function loadManifest(): Promise<Manifest> {
  manifest ??= fetch(`${import.meta.env.BASE_URL}prototypes/manifest.json`)
    .then((r) => r.json() as Promise<Manifest>)
    .catch(() => ({ prototypes: [] }));
  return manifest;
}

export const findPrototype = (m: Manifest, contributor: string, prototype: string) =>
  m.prototypes.find((p) => p.contributorKey === contributor && p.id === prototype);

// "main.tsx" → "main": the view's name in the URL.
export const viewSlug = (name: string) => name.replace(/\.[jt]sx$/, '');

// A prototype opens on prototype.tsx (or .jsx), or its first view if there isn't one.
export function firstView(p: Prototype): View | undefined {
  return p.views.find((v) => viewSlug(v.name) === 'prototype' && !v.group) ?? p.views[0];
}

// "session-done.tsx" → "Session Done"
export const viewLabel = (name: string) =>
  viewSlug(name).split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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

export const viewLink = (p: Prototype, v: View) => {
  const params = { contributor: p.contributorKey, prototype: p.id, view: viewSlug(v.name) };
  return v.group
    ? linkOptions({ to: '/$contributor/$prototype/$group/$view', params: { ...params, group: v.group } })
    : linkOptions({ to: '/$contributor/$prototype/$view', params });
};
