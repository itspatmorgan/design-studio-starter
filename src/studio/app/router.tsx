// Routes and router, in code (TanStack Router's code-based routing):
// https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing
//
//   /                                        Index (search: ?q=)
//   /systems/$system, /systems/$system/$page  Systems (/systems opens the product system)
//   /guide, /guide/$page                     the Guide (pages in src/guide/)
//   /$contributor/$prototype                 a prototype, on its start item (or its first)
//   /$contributor/$prototype/$               an item, by its path without the extension,
//                                            at any depth: /patrick/hello-world/lofi/main
import { createRootRoute, createRoute, createRouter, lazyRouteComponent, notFound, redirect } from '@tanstack/react-router';
import App, { NotFound } from '@/studio/app/shell/App';
import Index from '@/studio/app/pages/index/Index';
import { loadGuidePage } from '@/studio/app/data/loadGuide';
import PrototypeLayout from '@/studio/app/pages/prototype/PrototypeLayout';
import ViewFrame from '@/studio/app/pages/prototype/ViewFrame';
import { findItem, findPrototype, firstItem, itemLabel, itemSlug, loadManifest, setManifest } from '@/studio/app/data/manifest';
import type { Manifest } from '@/studio/app/data/types';
import { loadView, viewsWithoutComponent } from '@/studio/app/data/loadView';
import { TAB_ID } from '@/studio/app/data/files';
import { DEFAULT_SYSTEM, PROTOTYPE_SYSTEMS, type PrototypeSystemId } from '@/systems';

const APP_NAME = 'Design Studio';

const rootRoute = createRootRoute({
  loader: () => loadManifest(),
  staleTime: Infinity,
  head: () => ({ meta: [{ title: APP_NAME }] }),
  component: App,
  notFoundComponent: NotFound,
});

type IndexSearch = { q?: string };

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  // https://tanstack.com/router/latest/docs/framework/react/guide/search-params#validating-search-params
  validateSearch: (search: Record<string, unknown>): IndexSearch => ({
    q: typeof search.q === 'string' && search.q ? search.q : undefined,
  }),
  head: () => ({ meta: [{ title: `Prototypes — ${APP_NAME}` }] }),
  component: Index,
});

// Systems: /systems opens the product system; each system has one page per foundation
// and component. The page is loaded on first visit, so it isn't in the main bundle:
// https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting
const systemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'systems',
});

const systemsIndexRoute = createRoute({
  getParentRoute: () => systemsRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/systems/$system', params: { system: 'product' }, replace: true }); },
});

const SystemsPage = lazyRouteComponent(() => import('@/studio/app/pages/systems/SystemsPage'));
const systemsTitle = (...parts: (string | undefined)[]) =>
  [...parts.filter(Boolean).map((p) => itemLabel(p!)), 'Systems', APP_NAME].join(' — ');

const systemRoute = createRoute({
  getParentRoute: () => systemsRoute,
  path: '$system',
  head: ({ params }) => ({ meta: [{ title: systemsTitle(params.system) }] }),
  component: SystemsPage,
});

const systemPageRoute = createRoute({
  getParentRoute: () => systemsRoute,
  path: '$system/$page',
  head: ({ params }) => ({ meta: [{ title: systemsTitle(params.page, params.system) }] }),
  component: SystemsPage,
});

// The Guide's sidebar, around whichever page is open.
const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'guide',
  component: lazyRouteComponent(() => import('@/studio/app/pages/guide/GuideLayout')),
});

// Guide pages render in DocLayout, loaded with the first Guide page.
const DocLayout = lazyRouteComponent(() => import('@/studio/app/docs/DocLayout'), 'DocLayout');

// Loads a Guide page before it renders, like views. /guide opens index.mdx.
async function guideLoader(slug: string) {
  const mod = await loadGuidePage(slug);
  if (!mod) throw notFound();
  const { title, description, toc } = mod.frontmatter ?? {};
  return { Component: mod.default, title, description, toc, pageTitle: [title, 'Guide', APP_NAME].filter(Boolean).join(' — ') };
}

const guideIndexRoute = createRoute({
  getParentRoute: () => guideRoute,
  path: '/',
  loader: () => guideLoader('index'),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.pageTitle ?? APP_NAME }] }),
  component: () => <DocLayout {...guideIndexRoute.useLoaderData()} />,
});

const guidePageRoute = createRoute({
  getParentRoute: () => guideRoute,
  path: '$page',
  loader: ({ params }) => guideLoader(params.page),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.pageTitle ?? APP_NAME }] }),
  component: () => <DocLayout {...guidePageRoute.useLoaderData()} />,
});

// The prototype's navigation, around whichever item is open.
const prototypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$contributor/$prototype',
  loader: async ({ params }) => {
    const proto = findPrototype(await loadManifest(), params.contributor, params.prototype);
    if (!proto) throw notFound();
    return { proto };
  },
  component: PrototypeLayout,
  notFoundComponent: NotFound,
});

// Loads an item before the route renders, so the current one stays on screen until the next
// one is ready. An unknown address shows the not-found page. (Views are the one kind today;
// see src/kinds.ts.)
async function itemLoader({ contributor, prototype, _splat }: { contributor: string; prototype: string; _splat?: string }) {
  const proto = findPrototype(await loadManifest(), contributor, prototype);
  // No path in the URL: the prototype's start item, or its first.
  const item = proto && (_splat ? findItem(proto, _splat) : firstItem(proto));
  const mod = proto && item ? await loadView({ contributor, prototype, path: item.path }, { inManifest: true }) : undefined;
  if (!proto || !item || !mod) throw notFound();
  // A view file that doesn't export a component yet (say, one you're still writing) shows
  // an error in its place, instead of breaking the page.
  const file = `src/prototypes/${contributor}/${prototype}/${item.path}`;
  const valid = typeof mod.default === 'function' || typeof mod.default === 'object';
  if (!valid) viewsWithoutComponent.add(file);
  const Component = valid
    ? mod.default
    : () => { throw new Error(`${file} has no default export. A view needs one: export default function MyView() { ... }`); };
  return {
    Component,
    viewKey: `${contributor}/${prototype}/${itemSlug(item.path)}`,
    themeClass: PROTOTYPE_SYSTEMS[(proto.system as PrototypeSystemId)]?.themeClass ?? PROTOTYPE_SYSTEMS[DEFAULT_SYSTEM].themeClass,
    title: [proto.title, itemLabel(item.path), APP_NAME].join(' — '),
  };
}

// The open item. It shows its own not-found page, inside the prototype's navigation, and
// never renders without its loader's data.
function ItemPage({ data }: { data: Awaited<ReturnType<typeof itemLoader>> | undefined }) {
  return data ? <ViewFrame {...data} /> : null;
}

const prototypeIndexRoute = createRoute({
  getParentRoute: () => prototypeRoute,
  path: '/',
  loader: ({ params }) => itemLoader(params),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title ?? APP_NAME }] }),
  component: () => <ItemPage data={prototypeIndexRoute.useLoaderData()} />,
  notFoundComponent: NotFound,
});

// Splat route: everything after the prototype is the item's path.
// https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts#splat--catch-all-routes
const itemRoute = createRoute({
  getParentRoute: () => prototypeRoute,
  path: '$',
  loader: ({ params }) => itemLoader(params),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title ?? APP_NAME }] }),
  component: () => <ItemPage data={itemRoute.useLoaderData()} />,
  notFoundComponent: NotFound,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  systemsRoute.addChildren([systemsIndexRoute, systemRoute, systemPageRoute]),
  guideRoute.addChildren([guideIndexRoute, guidePageRoute]),
  prototypeRoute.addChildren([prototypeIndexRoute, itemRoute]),
]);

export const router = createRouter({
  routeTree,
  // Browser history: clean URLs; the host must serve index.html for every path (see README, Hosting).
  // No rewrites on your host? Use hash URLs instead (/#/patrick/hello-world):
  //   import { createHashHistory } from '@tanstack/react-router';
  //   history: createHashHistory(),
  // https://tanstack.com/router/latest/docs/framework/react/guide/history-types
  basepath: import.meta.env.BASE_URL,
  defaultPreload: 'intent',
});

// Type-safe Link, useNavigate, useParams, and useSearch everywhere.
// https://tanstack.com/router/latest/docs/framework/react/decisions-on-dx#declaring-the-router-instance-for-type-inference
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// In dev, the manifest updates live as files change (scripts/vite-manifest-watch-plugin.js).
// invalidate() reruns the loaders, so lists and navigation update without a page reload.
// https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#using-routerinvalidate
if (import.meta.hot) {
  window.addEventListener('studio:views', () => router.invalidate());
  import.meta.hot.on('studio:manifest', ({ manifest, origin }: { manifest: Manifest; origin?: string }) => {
    if (origin === TAB_ID) return; // this tab made the change and already applied it
    setManifest(manifest);
    router.invalidate();
  });
}
