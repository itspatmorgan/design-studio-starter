// The Handbook in the app: its rail button, the /handbook address, and its files in the ⌘K palette. Its
// sections open as /handbook/<section> through the prototype routes, because they're listed in the
// manifest like prototypes; /handbook itself opens the first section.
import { createRoute, notFound, redirect, useRouterState } from '@tanstack/react-router';
import { Notebook01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/platform/components/command';
import { HomeHint, HomeSection } from '@/platform/app/items/HomeSection';
import { useMe } from '@/platform/app/data/files';
import { ItemRow } from '@/platform/app/items/ItemRow';
import { NotFound } from '@/platform/app/shell/App';
import { artifactFolder, artifactLabel, loadManifest } from '@/platform/app/data/manifest';
import { artifactLink } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';
import type { Manifest } from '@/platform/app/data/types';

function HandbookPlaces({ go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <CommandItem value="handbook context rules skills" disabled={pathname === '/handbook'} onSelect={() => go({ to: '/handbook' } as never)}>Handbook</CommandItem>;
}

function HandbookPalette({ manifest, current, isOpen, go }: PaletteContext) {
  if (!manifest.handbook.some((section) => section.artifacts.length > 0)) return null;
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Handbook">
        {manifest.handbook.flatMap((section) => section.artifacts.map((item) => (
          <CommandItem
            key={`${section.id}/${item.path}`}
            value={`handbook ${section.title} ${artifactLabel(item.path, section)} ${item.path}`}
            disabled={section === current && isOpen(item)}
            onSelect={() => go(artifactLink(section, item))}
          >
            <span className="shrink-0 text-xs text-muted-foreground">{[section.title, artifactFolder(item.path)].filter(Boolean).join(' · ')}</span>
            <span className="truncate">{artifactLabel(item.path, section)}</span>
          </CommandItem>
        )))}
      </CommandGroup>
    </>
  );
}

// On the front page: the first few docs, the part of the Handbook written for people. Its rules and skills
// are for agents, so they stay out of sight here. Locally, with none yet, it says how to write one.
function Overview({ manifest }: { manifest: Manifest }) {
  const me = useMe();
  const docs = manifest.handbook.find((section) => section.id === 'docs');
  const items = docs?.artifacts.slice(0, 3) ?? [];
  if (!docs || !items.length) return import.meta.env.DEV && me ? <HomeSection title="Context" to="/handbook/context"><HomeHint>None yet. Ask your agent to write one.</HomeHint></HomeSection> : null;
  return (
    <HomeSection title="Context" to="/handbook/context">
      <ul>{items.map((item) => <ItemRow key={item.path} link={artifactLink(docs, item)} icon={Notebook01Icon} title={artifactLabel(item.path)} />)}</ul>
    </HomeSection>
  );
}

export default {
  icon: Notebook01Icon,
  rail: 'top',
  order: 30,
  routes: (root) => {
    const handbook = createRoute({
      getParentRoute: () => root, path: 'handbook',
      beforeLoad: async () => {
        const first = (await loadManifest()).handbook[0];
        if (!first) throw notFound();
        throw redirect({ to: '/$contributor/$prototype', params: { contributor: first.contributorKey, prototype: first.id === 'docs' ? 'context' : first.id }, replace: true });
      },
      notFoundComponent: NotFound,
    });
    return [handbook];
  },
  overview: Overview,
  places: HandbookPlaces,
  palette: HandbookPalette,
} satisfies ModuleApp;
