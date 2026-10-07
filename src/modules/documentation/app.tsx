import { Suspense } from 'react';
// The Guide in the app: its rail button and its routes (/documentation/guide and /documentation/guide/<page>). The pages are in
// src/modules/documentation/pages/ with availability and order recorded in the manifest.
import { createRoute, notFound, lazyRouteComponent } from '@tanstack/react-router';
import { BookOpen01Icon } from '@hugeicons/core-free-icons';
import { APP_NAME } from '@/platform/app/data/config';
import type { ModuleApp } from '@/platform/core/api';
import { loadManifest } from '@/platform/app/data/manifest';
import { loadGuidePage } from './loadGuide';

// Guide pages render in DocLayout, loaded with the first Guide page.
const GuidePage = lazyRouteComponent(() => import('./GuidePage'));
const GuideLayout = lazyRouteComponent(() => import('./GuideLayout'));

// Loads a Guide page before it renders, like views. /documentation/guide opens index.md. Each chapter has its own Guide source.
async function guideLoader(slug: string, mode?: 'source') {
  await Promise.all([GuideLayout.preload?.(), GuidePage.preload?.(), mode === 'source' && import.meta.env.DEV ? import('./GuidePage').then(mod => mod.prepareGuideSource()) : undefined]);
  const page = (await loadManifest()).guide.find((p) => p.slug === slug);
  if (import.meta.env.DEV && mode === 'source') {
    const path = 'src' + (page?.source ?? `/modules/documentation/pages/${slug}.md`);
    return { slug, filePath: path.slice(3), source: { path }, title: page?.title ?? slug, pageTitle: [page?.title ?? slug, 'Source', APP_NAME].join(' — ') };
  }
  if (!page) throw notFound();
  const mod = await loadGuidePage(slug, page?.source);
  if (!mod) throw notFound();
  const { title, description, toc } = mod.frontmatter ?? {};
  return { slug, filePath: page.source ?? `/modules/documentation/pages/${slug}.md`, Component: mod.default, title, description, toc, pageTitle: [title, 'Guide', APP_NAME].filter(Boolean).join(' — ') };
}

export default {
  icon: BookOpen01Icon,
  rail: 'top',
  order: 30,
  routes: (root) => {
    // The Guide's sidebar, around whichever page is open.
    const guideRoute = createRoute({
      getParentRoute: () => root,
      path: 'documentation/guide',
      validateSearch: (search: Record<string, unknown>): { mode?: 'source' } => ({ mode: search.mode === 'source' ? 'source' : undefined }),
      component: () => <Suspense fallback={null}><GuideLayout /></Suspense>,
    });
    const indexRoute = createRoute({
      getParentRoute: () => guideRoute,
      path: '/',
      loaderDeps: ({ search }) => ({ mode: search.mode }),
      loader: ({ deps }) => guideLoader('index', deps.mode),
      head: ({ loaderData }) => ({ meta: [{ title: loaderData?.pageTitle ?? APP_NAME }] }),
      component: () => <Suspense fallback={null}><GuidePage {...indexRoute.useLoaderData()} /></Suspense>,
    });
    const pageRoute = createRoute({
      getParentRoute: () => guideRoute,
      path: '$page',
      loaderDeps: ({ search }) => ({ mode: search.mode }),
      loader: ({ params, deps }) => guideLoader(params.page, deps.mode),
      head: ({ loaderData }) => ({ meta: [{ title: loaderData?.pageTitle ?? APP_NAME }] }),
      component: () => <Suspense fallback={null}><GuidePage {...pageRoute.useLoaderData()} /></Suspense>,
    });
    return [guideRoute.addChildren([indexRoute, pageRoute])];
  },
} satisfies ModuleApp;
