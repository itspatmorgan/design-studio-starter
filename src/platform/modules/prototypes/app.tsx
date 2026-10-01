// Prototypes in the app: the gallery at /prototypes, its rail button, and its entries in the ⌘K palette.
// A prototype itself opens in the viewer (viewer/), through the platform's item routes
// (src/platform/app/router.tsx), at /prototypes/<person>/<id>.
import { createRoute } from '@tanstack/react-router';
import { Layers01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/platform/components/command';
import { APP_NAME } from '@/platform/app/data/config';
import { newestFirst, prototypeLink } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';
import type { Manifest } from '@/platform/app/data/types';
import Gallery from './gallery/Gallery';

type GallerySearch = { q?: string };

function PrototypesPlaces({ go }: PaletteContext) {
  return <CommandItem value="prototypes gallery" onSelect={() => go({ to: '/prototypes' } as never)}>Prototypes</CommandItem>;
}

function PrototypesPalette({ manifest, current, go }: PaletteContext) {
  const prototypes = [...manifest.prototypes].sort(newestFirst);
  if (!prototypes.length) return null;
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Prototypes">
        {prototypes.map((p) => (
          <CommandItem
            key={`${p.contributorKey}/${p.id}`}
            value={`${p.title} ${p.description ?? ''} ${p.contributor ?? ''} ${p.contributorKey}/${p.id}`}
            disabled={p === current}
            onSelect={() => go(prototypeLink(p))}
          >
            <span className="truncate">{p.title}</span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{(p.contributor || p.contributorKey).split(' ')[0]}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}

// How many prototypes there are.
function Overview({ manifest }: { manifest: Manifest }) {
  const n = manifest.prototypes.length;
  return <>{n === 1 ? '1 prototype' : `${n} prototypes`}</>;
}

export default {
  icon: Layers01Icon,
  rail: 'top',
  order: 0,
  routes: (root) => [
    createRoute({
      getParentRoute: () => root,
      path: 'prototypes',
      // https://tanstack.com/router/latest/docs/framework/react/guide/search-params#validating-search-params
      validateSearch: (search: Record<string, unknown>): GallerySearch => ({ q: typeof search.q === 'string' && search.q ? search.q : undefined }),
      head: () => ({ meta: [{ title: `Prototypes — ${APP_NAME}` }] }),
      component: Gallery,
    }),
  ],
  overview: Overview,
  places: PrototypesPlaces,
  palette: PrototypesPalette,
} satisfies ModuleApp;
