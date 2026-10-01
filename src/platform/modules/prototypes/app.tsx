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

// On the front page, the newest prototypes, nine at most (three rows of the grid). While you run the app locally, a
// row of your own comes first and the newest ones are the other people's, so none is shown twice.
function Overview({ manifest }: { manifest: Manifest }) {
  const me = useMe();
  const live = manifest.prototypes.filter((p) => p.status !== 'archived').sort(newestFirst);
  const mine = me ? live.filter((p) => p.contributorKey === me) : [];
  const latest = (me ? live.filter((p) => p.contributorKey !== me) : live).slice(0, 9);
  const cards = (list: typeof live) => <ItemGrid>{list.map((p) => <li key={`${p.contributorKey}/${p.id}`}><PrototypeCard prototype={p} /></li>)}</ItemGrid>;
  return (
    <>
      {me && (
        <HomeSection title="Your prototypes" to="/prototypes">
          {mine.length ? cards(mine.slice(0, 9)) : <NewPrototypeButton />}
        </HomeSection>
      )}
      {latest.length > 0 && <HomeSection title={me ? 'Latest from the team' : 'Latest prototypes'} to="/prototypes">{cards(latest)}</HomeSection>}
    </>
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
