// Routes and router, in code (TanStack Router's code-based routing):
// https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing
//
//   /                                        Index (search: ?q=)
//   /systems                                 Systems page
//   /guide, /guide/$page                     the Guide (pages in src/guide/)
//   /$contributor/$prototype                 a prototype, on its default view
//   /$contributor/$prototype/$view           a top-level view
//   /$contributor/$prototype/$group/$view    a view in a group
import { createRootRoute, createRoute, createRouter, notFound } from '@tanstack/react-router';
import App, { NotFound } from '@/studio/app/shell/App';
import Index from '@/studio/app/pages/index/Index';
import SystemsPage from '@/studio/app/pages/systems/SystemsPage';
import GuideLayout from '@/studio/app/pages/guide/GuideLayout';
import { DocLayout } from '@/studio/app/docs/DocLayout';
import { loadGuidePage } from '@/studio/app/data/loadGuide';
import PrototypeLayout from '@/studio/app/pages/prototype/PrototypeLayout';
import ViewFrame from '@/studio/app/pages/prototype/ViewFrame';
import { findPrototype, firstView, loadManifest, viewLabel, viewSlug } from '@/studio/app/data/manifest';
import { loadView } from '@/studio/app/data/loadView';

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

const systemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'systems',
  head: () => ({ meta: [{ title: `Systems — ${APP_NAME}` }] }),
  component: SystemsPage,
});

// The Guide's sidebar, around whichever page is open.
const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'guide',
  component: GuideLayout,
});

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

// The prototype's navigation, around whichever view is open.
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

// Loads a view's module before the route renders, so the current view stays on
// screen until the next one is ready. Unknown views show the not-found page.
type ViewParams = { contributor: string; prototype: string; group?: string; view?: string };

async function viewLoader({ contributor, prototype, group, view }: ViewParams) {
  const proto = findPrototype(await loadManifest(), contributor, prototype);
  // No view in the URL: the prototype's default view.
  const entry = proto && !view ? firstView(proto) : undefined;
  const g = view ? group ?? null : entry?.group ?? null;
  const v = view ?? (entry && viewSlug(entry.name));
  const mod = proto && v ? await loadView({ contributor, prototype, group: g, view: v }) : undefined;
  if (!proto || !v || !mod) throw notFound();
  return {
    Component: mod.default,
    viewKey: [contributor, prototype, g, v].join('/'),
    title: [proto.title, viewLabel(v), APP_NAME].join(' — '),
  };
}

const prototypeIndexRoute = createRoute({
  getParentRoute: () => prototypeRoute,
  path: '/',
  loader: ({ params }) => viewLoader(params),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title ?? APP_NAME }] }),
  component: () => <ViewFrame {...prototypeIndexRoute.useLoaderData()} />,
});

const viewRoute = createRoute({
  getParentRoute: () => prototypeRoute,
  path: '$view',
  loader: ({ params }) => viewLoader(params),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title ?? APP_NAME }] }),
  component: () => <ViewFrame {...viewRoute.useLoaderData()} />,
});

const groupViewRoute = createRoute({
  getParentRoute: () => prototypeRoute,
  path: '$group/$view',
  loader: ({ params }) => viewLoader(params),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title ?? APP_NAME }] }),
  component: () => <ViewFrame {...groupViewRoute.useLoaderData()} />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  systemsRoute,
  guideRoute.addChildren([guideIndexRoute, guidePageRoute]),
  prototypeRoute.addChildren([prototypeIndexRoute, viewRoute, groupViewRoute]),
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
