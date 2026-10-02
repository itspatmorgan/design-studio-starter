// Prototypes in the app: the gallery at /prototypes, its rail button, and its entries in the ⌘K palette.
// A prototype itself opens in the viewer (viewer/), through the platform's item routes
// (src/platform/app/router.tsx), at /prototypes/<person>/<id>.
import { createRoute } from '@tanstack/react-router';
import { Layers01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/platform/components/command';
import { HomeSection } from '@/platform/app/items/HomeSection';
import { HomeRow } from '@/platform/app/items/HomeRows';
import { useMe } from '@/platform/app/data/files';
import { APP_NAME } from '@/platform/app/data/config';
import { newestFirst, prototypeLink } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';
import type { Manifest } from '@/platform/app/data/types';
import Gallery from './gallery/Gallery';
import NewPrototypeButton from './gallery/NewPrototypeDialog';
import PrototypeCardMenu from './gallery/PrototypeCardMenu';

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

// On the front page, the newest prototypes, five at most, with the title above linking to all of them. While you run
// the app locally, a section of your own comes first and the newest are the other people's, so none is shown twice.
const SHOWN = 5;
function Overview({ manifest }: { manifest: Manifest }) {
  const me = useMe();
  const live = manifest.prototypes.filter((p) => p.status !== 'archived').sort(newestFirst);
  const mine = me ? live.filter((p) => p.contributorKey === me) : [];
  const latest = (me ? live.filter((p) => p.contributorKey !== me) : live).slice(0, SHOWN);
  const rows = (list: typeof live, byline: boolean) => (
    <ul>
      {list.map((p) => (
        <HomeRow
          key={`${p.contributorKey}/${p.id}`}
          link={prototypeLink(p)}
          id={p.id}
          title={p.title}
          meta={byline ? (p.contributor || p.contributorKey).split(' ')[0] : undefined}
          menu={<PrototypeCardMenu proto={p} />}
        />
      ))}
    </ul>
  );
  return (
    <>
      {me && (
        <HomeSection title="Your prototypes" to="/prototypes">
          {mine.length ? rows(mine.slice(0, SHOWN), false) : <div className="px-4 py-2"><NewPrototypeButton /></div>}
        </HomeSection>
      )}
      {latest.length > 0 && <HomeSection title={me ? 'Latest from the team' : 'Latest prototypes'} to="/prototypes">{rows(latest, true)}</HomeSection>}
    </>
  );
}

export default {
  icon: Layers01Icon,
  rail: 'top',
  order: 0,
  // Locally your own prototypes come first. On the deployed site the tools do, since that is mostly what colleagues come for.
  homeOrder: { local: 0, deployed: 15 },
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
