// Prototypes in the app: the gallery at /prototypes, its rail button, and its entries in the ⌘K palette.
// A prototype itself opens in the viewer (viewer/), through the platform's item routes
// (src/platform/app/router.tsx), at /prototypes/<person>/<id>.
import { createRoute } from '@tanstack/react-router';
import { Layers01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/platform/components/command';
import { HomeSection } from '@/platform/app/items/HomeSection';
import { ItemGrid } from '@/platform/app/items/ItemGrid';
import { useMe } from '@/platform/app/data/files';
import { APP_NAME } from '@/platform/app/data/config';
import { newestFirst, prototypeLink } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';
import type { Manifest } from '@/platform/app/data/types';
import Gallery from './gallery/Gallery';
import NewPrototypeButton from './gallery/NewPrototypeDialog';
import PrototypeCard from './gallery/PrototypeCard';

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

// On the front page: your own prototypes while you run the app locally, otherwise the newest ones, nine at most
// (three rows of the grid), with a link to all of them.
function Overview({ manifest }: { manifest: Manifest }) {
  const me = useMe();
  const live = manifest.prototypes.filter((p) => p.status !== 'archived').sort(newestFirst);
  const mine = me ? live.filter((p) => p.contributorKey === me) : [];
  const shown = (mine.length ? mine : live).slice(0, 9);
  if (!shown.length) return import.meta.env.DEV && me ? <HomeSection title="Prototypes" to="/prototypes" linkLabel="All prototypes"><NewPrototypeButton /></HomeSection> : null;
  return (
    <HomeSection title={mine.length ? 'Your prototypes' : 'Latest prototypes'} to="/prototypes" linkLabel="All prototypes">
      <ItemGrid>{shown.map((p) => <li key={`${p.contributorKey}/${p.id}`}><PrototypeCard prototype={p} /></li>)}</ItemGrid>
    </HomeSection>
  );
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
