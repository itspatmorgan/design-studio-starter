// The Handbook in the app: its rail button, the /handbook address, and its files in the ⌘K palette. Its
// sections open as /handbook/<section> through the prototype routes, because they're listed in the
// manifest like prototypes; /handbook itself opens the first section.
import { createRoute, notFound, redirect, useRouterState } from '@tanstack/react-router';
import { Notebook01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/platform/components/command';
import { HomeLinksSection } from '@/platform/app/items/HomeSection';
import { NotFound } from '@/platform/app/shell/App';
import { itemFolder, itemLabel, loadManifest } from '@/platform/app/data/manifest';
import { itemLink } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';
import type { Manifest } from '@/platform/app/data/types';

function HandbookPlaces({ go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <CommandItem value="handbook docs rules skills" disabled={pathname === '/handbook'} onSelect={() => go({ to: '/handbook' } as never)}>Handbook</CommandItem>;
}

function HandbookPalette({ manifest, current, isOpen, go }: PaletteContext) {
  if (!manifest.handbook.some((section) => section.items.length > 0)) return null;
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Handbook">
        {manifest.handbook.flatMap((section) => section.items.map((item) => (
          <CommandItem
            key={`${section.id}/${item.path}`}
            value={`handbook ${section.title} ${itemLabel(item.path)} ${item.path}`}
            disabled={section === current && isOpen(item)}
            onSelect={() => go(itemLink(section, item))}
          >
            <span className="shrink-0 text-xs text-muted-foreground">{[section.title, itemFolder(item.path)].filter(Boolean).join(' · ')}</span>
            <span className="truncate">{itemLabel(item.path)}</span>
          </CommandItem>
        )))}
      </CommandGroup>
    </>
  );
}

// On the front page: the first few docs, the part of the Handbook written for people. Its rules and skills
// are for agents, so they stay out of sight here.
function Overview({ manifest }: { manifest: Manifest }) {
  const docs = manifest.handbook.find((section) => section.id === 'docs');
  const items = docs?.items.slice(0, 3) ?? [];
  if (!docs || !items.length) return null;
  return <HomeLinksSection title="Docs" to="/handbook/docs" links={items.map((item) => ({ label: itemLabel(item.path), link: itemLink(docs, item) }))} />;
}

export default {
  icon: Notebook01Icon,
  rail: 'top',
  order: 30,
  routes: (root) => [
    createRoute({
      getParentRoute: () => root,
      path: 'handbook',
      beforeLoad: async () => {
        const first = (await loadManifest()).handbook[0];
        if (!first) throw notFound();
        throw redirect({ to: '/$contributor/$prototype', params: { contributor: first.contributorKey, prototype: first.id }, replace: true });
      },
      notFoundComponent: NotFound,
    }),
  ],
  overview: Overview,
  places: HandbookPlaces,
  palette: HandbookPalette,
} satisfies ModuleApp;
