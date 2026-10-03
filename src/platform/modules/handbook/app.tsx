// The Handbook in the app: its rail button, the /handbook address, and its files in the ⌘K palette. Its
// sections open as /handbook/<section> through the prototype routes, because they're listed in the
// manifest like prototypes; /handbook itself opens the first section.
import { createRoute, notFound, redirect, useRouterState } from '@tanstack/react-router';
import { APP_NAME } from '@/platform/app/data/config';
import { loadReference } from '@/platform/app/docs/loadReference';
import MarkdownPage from '@/platform/app/docs/MarkdownPage';
import { PlatformReferenceLayout, PlatformReferenceIndex, RelatedGuidance, referenceHref } from './pages/PlatformReference';
import { Notebook01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/platform/components/command';
import { HomeHint, HomeSection } from '@/platform/app/items/HomeSection';
import { useMe } from '@/platform/app/data/files';
import { ItemRow } from '@/platform/app/items/ItemRow';
import { NotFound } from '@/platform/app/shell/App';
import { itemFolder, itemLabel, loadManifest } from '@/platform/app/data/manifest';
import { itemLink } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';
import type { Manifest } from '@/platform/app/data/types';

function HandbookPlaces({ go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <> <CommandItem value="handbook docs rules skills" disabled={pathname === '/handbook'} onSelect={() => go({ to: '/handbook' } as never)}>Handbook</CommandItem><CommandItem value="platform reference modules contracts" onSelect={() => go({ to: '/handbook/platform' } as never)}>Platform reference</CommandItem></>;
}

function HandbookPalette({ manifest, current, isOpen, go }: PaletteContext) {
  if (!manifest.handbook.some((section) => section.items.length > 0) && !manifest.platformReferences.some((group) => group.references.length)) return null;
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Handbook">
        {manifest.handbook.flatMap((section) => section.items.map((item) => (
          <CommandItem
            key={`${section.id}/${item.path}`}
            value={`handbook ${section.title} ${itemLabel(item.path, section)} ${item.path}`}
            disabled={section === current && isOpen(item)}
            onSelect={() => go(itemLink(section, item))}
          >
            <span className="shrink-0 text-xs text-muted-foreground">{[section.title, itemFolder(item.path)].filter(Boolean).join(' · ')}</span>
            <span className="truncate">{itemLabel(item.path, section)}</span>
          </CommandItem>
        )))}
        {manifest.platformReferences.flatMap((group) => group.references.map((ref) => <CommandItem key={ref.source} value={`platform reference ${group.label} ${ref.title} ${ref.source}`} onSelect={() => go({ to: referenceHref(ref.source) } as never)}><span className="shrink-0 text-xs text-muted-foreground">{group.label}</span><span className="truncate">{ref.title}</span></CommandItem>))}
      </CommandGroup>
    </>
  );
}

// On the front page: the first few docs, the part of the Handbook written for people. Its rules and skills
// are for agents, so they stay out of sight here. Locally, with none yet, it says how to write one.
function Overview({ manifest }: { manifest: Manifest }) {
  const me = useMe();
  const docs = manifest.handbook.find((section) => section.id === 'docs');
  const items = docs?.items.slice(0, 3) ?? [];
  if (!docs || !items.length) return import.meta.env.DEV && me ? <HomeSection title="Docs" to="/handbook/docs"><HomeHint>None yet. Ask your agent to write one.</HomeHint></HomeSection> : null;
  return (
    <HomeSection title="Docs" to="/handbook/docs">
      <ul>{items.map((item) => <ItemRow key={item.path} link={itemLink(docs, item)} icon={Notebook01Icon} title={itemLabel(item.path)} />)}</ul>
    </HomeSection>
  );
}

export default {
  icon: Notebook01Icon,
  rail: 'top',
  order: 30,
  routes: (root) => {
    const reference = createRoute({ getParentRoute: () => root, path: 'handbook/platform', component: PlatformReferenceLayout });
    const index = createRoute({ getParentRoute: () => reference, path: '/', head: () => ({ meta: [{ title: 'Platform reference — ' + APP_NAME }] }), component: PlatformReferenceIndex });
    const page = createRoute({
      getParentRoute: () => reference, path: '$',
      loader: async ({ params }) => {
        const source = '/' + (params._splat ?? '');
        const manifest = await loadManifest();
        const group = manifest.platformReferences.find((g) => g.references.some((r) => r.source === source));
        if (!group) throw notFound();
        const mod = await loadReference(source);
        if (!mod) throw notFound();
        return { source, group, Component: mod.default, title: group.references.find((r) => r.source === source)!.title, frontmatter: mod.frontmatter ?? {} };
      },
      head: ({ loaderData }) => ({ meta: [{ title: [loaderData?.title, 'Handbook', APP_NAME].filter(Boolean).join(' — ') }] }),
      component: () => {
        const { source, group, Component, frontmatter } = page.useLoaderData();
        return <>
          <div className="shrink-0 border-b border-border px-8 py-4">
            <p className="break-words font-mono text-xs text-muted-foreground">src{source} · Read-only reference</p>
            <RelatedGuidance group={group} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col [&>div]:min-h-0"><MarkdownPage Component={Component} frontmatter={frontmatter} docKey={source} base={'/handbook/platform' + String(source).slice(0, String(source).lastIndexOf('/'))} /></div>
        </>;
      },
      notFoundComponent: NotFound,
    });
    const handbook = createRoute({
      getParentRoute: () => root, path: 'handbook',
      beforeLoad: async () => {
        const first = (await loadManifest()).handbook[0];
        if (!first) throw notFound();
        throw redirect({ to: '/$contributor/$prototype', params: { contributor: first.contributorKey, prototype: first.id }, replace: true });
      },
      notFoundComponent: NotFound,
    });
    return [handbook, reference.addChildren([index, page])];
  },
  overview: Overview,
  places: HandbookPlaces,
  palette: HandbookPalette,
} satisfies ModuleApp;
