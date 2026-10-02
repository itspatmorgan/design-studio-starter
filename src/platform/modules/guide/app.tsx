// The Guide in the app: its rail button and its routes (/guide and /guide/<page>). The pages are in
// src/platform/modules/guide/pages/ and in the READMEs of modules and file types, listed in the manifest. It adds nothing to the ⌘K palette: that searches the team's own content.
import { createRoute, lazyRouteComponent, notFound } from '@tanstack/react-router';
import { BookOpen01Icon } from '@hugeicons/core-free-icons';
import { APP_NAME } from '@/platform/app/data/config';
import type { ModuleApp } from '@/platform/core/api';
import { loadManifest } from '@/platform/app/data/manifest';
import { loadGuidePage } from './loadGuide';

// Guide pages render in DocLayout, loaded with the first Guide page.
const DocLayout = lazyRouteComponent(() => import('@/platform/app/docs/DocLayout'), 'DocLayout');

// Loads a Guide page before it renders, like views. /guide opens index.md. A page that is a README says where it is in the manifest.
async function guideLoader(slug: string) {
  const page = (await loadManifest()).guide.find((p) => p.slug === slug);
  const mod = await loadGuidePage(slug, page?.source);
  if (!mod) throw notFound();
  const { title, description, toc } = mod.frontmatter ?? {};
  return { Component: mod.default, title, description, toc, pageTitle: [title, 'Guide', APP_NAME].filter(Boolean).join(' — ') };
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
} satisfies ModuleApp;
