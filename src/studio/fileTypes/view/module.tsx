// How the app opens a view: its component, in its prototype system's theme.
import { CodeIcon } from '@hugeicons/core-free-icons';
import type { FileTypeModule } from '@/studio/app/data/fileTypeModule';
import { itemSlug } from '@/studio/app/data/manifest';
import { DEFAULT_SYSTEM, PROTOTYPE_SYSTEMS, type PrototypeSystemId } from '@/systems';
import { views } from './loader';
import ViewFrame from './ViewFrame';

export default {
  icon: CodeIcon,

  async load({ proto, item }) {
    const file = { contributor: proto.contributorKey, prototype: proto.id, path: item.path };
    const mod = await views.load(file, { inManifest: true });
    if (!mod) return undefined;
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
      themeClass: PROTOTYPE_SYSTEMS[proto.system as PrototypeSystemId]?.themeClass ?? PROTOTYPE_SYSTEMS[DEFAULT_SYSTEM].themeClass,
    };
  },

  Page: ViewFrame,
} satisfies FileTypeModule;
