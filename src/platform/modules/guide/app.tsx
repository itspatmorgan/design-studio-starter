// The Guide in the app: its rail button and its routes (/guide and /guide/<page>). The pages are in
// src/platform/modules/guide/pages/ and in the READMEs of modules and file types, listed in the manifest. It adds nothing to the ⌘K palette: that searches the team's own content.
import { createRoute, lazyRouteComponent, notFound, redirect } from '@tanstack/react-router';
import { BookOpen01Icon } from '@hugeicons/core-free-icons';
import { APP_NAME } from '@/platform/app/data/config';
import type { ModuleApp } from '@/platform/core/api';
import { loadManifest } from '@/platform/app/data/manifest';
import { loadGuidePage } from './loadGuide';

// Guide pages render in DocLayout, loaded with the first Guide page.
const GuidePage = lazyRouteComponent(() => import('./GuidePage'));

// Loads a Guide page before it renders, like views. /guide opens index.md. A page that is a README says where it is in the manifest.
async function guideLoader(slug: string, mode?: 'source') {
  // Retain links to chapters consolidated into the book's main reading path.
  if (slug === 'scopes') throw redirect({ to: '/guide/$page' as never, params: { page: 'working-with-others' } as never, replace: true });
  if (slug === 'prototype-boundaries') throw redirect({ to: '/guide/$page' as never, params: { page: 'prototype-reference' } as never, hash: 'dependency-boundaries', replace: true });
  const page = (await loadManifest()).guide.find((p) => p.slug === slug);
  if (import.meta.env.DEV && mode === 'source') {
    const { readGuideSource } = await import('./source');
    const { path } = await readGuideSource(slug);
    return { slug, source: { path }, title: page?.title ?? slug, pageTitle: [page?.title ?? slug, 'Source', APP_NAME].join(' — ') };
  }
  const mod = await loadGuidePage(slug, page?.source);
  if (!mod) throw notFound();
  const { title, description, toc } = mod.frontmatter ?? {};
  return { slug, Component: mod.default, title, description, toc, pageTitle: [title, 'Guide', APP_NAME].filter(Boolean).join(' — ') };
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
      validateSearch: (search: Record<string, unknown>): { mode?: 'source' } => ({ mode: search.mode === 'source' ? 'source' : undefined }),
      component: lazyRouteComponent(() => import('./GuideLayout')),
    });
    const indexRoute = createRoute({
      getParentRoute: () => guideRoute,
      path: '/',
      loaderDeps: ({ search }) => ({ mode: search.mode }),
      loader: ({ deps }) => guideLoader('index', deps.mode),
      head: ({ loaderData }) => ({ meta: [{ title: loaderData?.pageTitle ?? APP_NAME }] }),
      component: () => <GuidePage {...indexRoute.useLoaderData()} />,
    });
    const pageRoute = createRoute({
      getParentRoute: () => guideRoute,
      path: '$page',
      loaderDeps: ({ search }) => ({ mode: search.mode }),
      loader: ({ params, deps }) => guideLoader(params.page, deps.mode),
      head: ({ loaderData }) => ({ meta: [{ title: loaderData?.pageTitle ?? APP_NAME }] }),
      component: () => <GuidePage {...pageRoute.useLoaderData()} />,
    });
    return [guideRoute.addChildren([indexRoute, pageRoute])];
  },
} satisfies ModuleApp;
