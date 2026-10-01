// The Handbook in the app: its rail button, the /handbook address, and its files in the ⌘K palette. Its
// sections open as /handbook/<section> through the prototype routes, because they're listed in the
// manifest like prototypes; /handbook itself opens the first section.
import { createRoute, notFound, redirect, useRouterState } from '@tanstack/react-router';
import { Notebook01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/platform/components/command';
import { NotFound } from '@/platform/app/shell/App';
import { itemFolder, itemLabel, loadManifest } from '@/platform/app/data/manifest';
import { itemLink } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';

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
  places: HandbookPlaces,
  palette: HandbookPalette,
} satisfies ModuleApp;
