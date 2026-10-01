// The Guide in the app: its rail button, its routes (/guide and /guide/<page>), and its pages in the ⌘K
// palette. The pages are in src/studio/modules/guide/pages/, listed in the manifest.
import { createRoute, lazyRouteComponent, notFound, useRouterState } from '@tanstack/react-router';
import { BookOpen01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/studio/components/command';
import { APP_NAME } from '@/studio/app/data/config';
import type { ModuleApp, PaletteContext } from '@/studio/core/api';
import { loadGuidePage } from './loadGuide';

// Guide pages render in DocLayout, loaded with the first Guide page.
const DocLayout = lazyRouteComponent(() => import('@/studio/app/docs/DocLayout'), 'DocLayout');

// Loads a Guide page before it renders, like views. /guide opens index.md.
async function guideLoader(slug: string) {
  const mod = await loadGuidePage(slug);
  if (!mod) throw notFound();
  const { title, description, toc } = mod.frontmatter ?? {};
  return { Component: mod.default, title, description, toc, pageTitle: [title, 'Guide', APP_NAME].filter(Boolean).join(' — ') };
}

function GuidePalette({ manifest, go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!manifest.guide.length) return null;
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Guide">
        {manifest.guide.map((page) => {
          const to = page.slug === 'index' ? '/guide' : `/guide/${page.slug}`;
          return (
            <CommandItem key={page.slug} value={`guide ${page.title} ${page.description}`} disabled={pathname === to} onSelect={() => go({ to } as never)}>
              {page.title}
            </CommandItem>
          );
        })}
      </CommandGroup>
    </>
  );
}

export default {
  icon: BookOpen01Icon,
  rail: 'bottom',
  order: 90,
  routes: (root) => {
    // The Guide's sidebar, around whichever page is open.
    const guideRoute = createRoute({
      getParentRoute: () => root,
      path: 'guide',
      component: lazyRouteComponent(() => import('./GuideLayout')),
    });
    const indexRoute = createRoute({
      getParentRoute: () => guideRoute,
      path: '/',
      loader: () => guideLoader('index'),
      head: ({ loaderData }) => ({ meta: [{ title: loaderData?.pageTitle ?? APP_NAME }] }),
      component: () => <DocLayout {...indexRoute.useLoaderData()} />,
    });
    const pageRoute = createRoute({
      getParentRoute: () => guideRoute,
      path: '$page',
      loader: ({ params }) => guideLoader(params.page),
      head: ({ loaderData }) => ({ meta: [{ title: loaderData?.pageTitle ?? APP_NAME }] }),
      component: () => <DocLayout {...pageRoute.useLoaderData()} />,
    });
    return [guideRoute.addChildren([indexRoute, pageRoute])];
  },
  palette: GuidePalette,
} satisfies ModuleApp;
