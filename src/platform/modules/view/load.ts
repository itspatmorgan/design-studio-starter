// Loads a view for its page (open.tsx) and for embeds (ViewEmbed.tsx).
import type { ItemContext } from '@/platform/app/data/fileTypeModule';
import { itemSlug } from '@/platform/app/data/manifest';
import { DEFAULT_SYSTEM, PROTOTYPE_SYSTEMS } from '@/platform/modules/systems/data/systems';
import { repoPath } from '@/platform/app/data/files';
import { emptyView } from '@/lib/emptyView';
import { views } from './loader';

export async function loadView({ proto, item }: ItemContext) {
  const file = { contributor: proto.contributorKey, prototype: proto.id, path: item.path };
  const mod = await views.load(file, { inManifest: true });
  if (!mod) return undefined;
  // A new view exports emptyView until something is built in it; the platform draws the empty page (EmptyView.tsx)
  // instead of the view, outside the prototype's theme. Its path is shown in dev only.
  const empty = mod.default === emptyView ? { path: import.meta.env.DEV ? repoPath(proto, item.path) : null } : undefined;
  // A view file that doesn't export a component yet (say, one you're still writing) shows
  // an error in its place, instead of breaking the page.
  const repoFile = `src/prototypes/${file.contributor}/${file.prototype}/${file.path}`;
  const valid = typeof mod.default === 'function' || typeof mod.default === 'object';
  if (!valid) views.incomplete.add(repoFile);
  return {
    Component: valid
      ? mod.default
      : () => { throw new Error(`${repoFile} has no default export. A view needs one: export default function MyView() { ... }`); },
    viewKey: `${file.contributor}/${file.prototype}/${itemSlug(item.path)}`,
    empty,
    lofi: item.lofi === true,
    themeClass: PROTOTYPE_SYSTEMS[proto.system]?.themeClass ?? PROTOTYPE_SYSTEMS[DEFAULT_SYSTEM]?.themeClass ?? '',
  };
}
