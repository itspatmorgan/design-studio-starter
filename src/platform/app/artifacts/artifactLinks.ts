// Links between items, the way a canvas stores them: the address of an item's page. A link
// resolves through the manifest to a prototype and an item, so it survives a change of host or
// base path, and one that points at nothing (the file was renamed or deleted) is reported as
// missing rather than breaking the page.
import { artifactSlug } from '@/platform/core/fileTypes';
import { addressOf, canonicalPath, parseAddress } from '@/platform/core/roots';
import type { Artifact, Manifest, Prototype } from '@/platform/app/data/types';
import { allPrototypes } from '@/platform/app/data/manifest';
import { MODULES } from '@/platform/app/data/modules';

// The router's first path segments that are pages of a module (/systems/…, /documentation/guide/…) and not items: the sections
// with no items of their own. The Handbook's and the module sections' addresses are item paths (/examples/<id>/<item>).
const APP_PAGES = new Set(MODULES.flatMap((m) => (m.section && !m.section?.items ? [m.section.key] : [])));

// The app's address on this origin, without a trailing slash: "" at the root, "/repo" under a base path.
const base = () => import.meta.env.BASE_URL.replace(/\/$/, '');

// An item's path in the app, without the base: "/prototypes/patrick/hello-world/lofi/main" (or "/handbook/context/principles").
export const artifactPath = (p: Prototype, item: Artifact) =>
  `${addressOf(p.contributorKey, p.id)}/${artifactSlug(item.path).split('/').map(encodeURIComponent).join('/')}`;

// An item's full URL on this origin.
export const artifactUrl = (p: Prototype, item: Artifact) => `${window.location.origin}${base()}${artifactPath(p, item)}`;

// Whether an app path ("/prototypes/patrick/hello-world/lofi/main", or the older "/patrick/hello-world/lofi/main")
// is in a prototype. A canvas shows only items from its own prototype, so prototypes stay self-contained.
export const isInPrototype = (path: string, p: { contributorKey: string; id: string }) => {
  const address = parseAddress(path);
  return Boolean(address && address.rest.length && address.contributor === p.contributorKey && address.id === p.id);
};

// The app path a link points at ("/prototypes/patrick/hello-world/lofi/main"), or null if it isn't a link
// into this app: another origin, another site, or a page that isn't a prototype item. A link saved in the older
// form, "/patrick/hello-world/lofi/main", comes back in today's.
export function appPathOf(link: string): string | null {
  let url: URL;
  try { url = new URL(link, window.location.origin); } catch { return null; }
  if (url.origin !== window.location.origin) return null;
  const prefix = base();
  if (prefix && url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) return null;
  const path = url.pathname.slice(prefix.length);
  const address = parseAddress(path);
  return address && address.rest.length && !APP_PAGES.has(path.split('/').filter(Boolean)[0]) ? canonicalPath(path.replace(/\/$/, '')) : null;
}

// The prototype and item an app path opens, or null.
export function resolveArtifactPath(manifest: Manifest, path: string): { proto: Prototype; item: Artifact } | null {
  let address: ReturnType<typeof parseAddress>;
  try { address = parseAddress(path.split('/').map(decodeURIComponent).join('/')); } catch { return null; }
  if (!address) return null;
  const proto = allPrototypes(manifest).find((p) => p.contributorKey === address.contributor && p.id === address.id);
  // A prototype whose items aren't loaded yet (manifest.ts) has no items to find.
  const item = proto?.artifacts?.find((i) => artifactSlug(i.path) === address.rest.join('/'));
  return proto && item ? { proto: proto as Prototype, item } : null;
}
