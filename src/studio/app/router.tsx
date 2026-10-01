// Routes and router, in code (TanStack Router's code-based routing):
// https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing
//
//   /                                        Index (search: ?q=)
//   /$contributor/$prototype                 a prototype, on its start item (or its first)
//   /$contributor/$prototype/$               an item, by its path without the extension,
//                                            at any depth: /patrick/hello-world/lofi/main
//                                            (?mode=source shows its text, in dev: SourcePane)
//
// The modules add their own: /tools, /systems/$system, /handbook, /guide/$page (src/studio/modules/<id>/app.tsx).
// The Handbook's sections and the tools open through the prototype routes, as /handbook/docs and /tools/<id>.
import { lazy, Suspense } from 'react';
import { createRootRoute, createRoute, createRouter, notFound, useNavigate } from '@tanstack/react-router';
import { Button } from '@/studio/components/button';
import App, { NotFound } from '@/studio/app/shell/App';
import Index from '@/studio/app/pages/index/Index';
import PrototypeLayout from '@/studio/app/pages/prototype/PrototypeLayout';
import { findItem, firstItem, itemLabel, loadManifest, loadPrototype, setManifest } from '@/studio/app/data/manifest';
import { FILE_TYPES, fileTypeModules } from '@/studio/app/data/fileTypes';
import type { Item, Manifest, Prototype } from '@/studio/app/data/types';
import { TAB_ID } from '@/studio/app/data/files';
import { moduleApps } from '@/studio/app/modules';
import { APP_NAME } from '@/studio/app/data/config';


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

// ?mode=source shows an item's text instead of the item (dev only): "Edit source" in its file menu.
type ItemSearch = { mode?: 'source' };

// The prototype's navigation, around whichever item is open.
const prototypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$contributor/$prototype',
  validateSearch: (search: Record<string, unknown>): ItemSearch => ({ mode: search.mode === 'source' ? 'source' : undefined }),
  loader: async ({ params }) => {
    const proto = await loadPrototype(params.contributor, params.prototype).catch(() => undefined);
    if (!proto) throw notFound();
    return { proto };
  },
  component: () => <PrototypeLayout proto={prototypeRoute.useLoaderData().proto} />,
  notFoundComponent: NotFound,
});

// Loads an item before the route renders, so the current one stays on screen until the next
// one is ready. Its file type (src/studio/fileTypes/) loads the file. An unknown address, or a type
// that isn't installed, shows the not-found page.
async function itemLoader({ contributor, prototype, _splat }: { contributor: string; prototype: string; _splat?: string }, mode?: ItemSearch['mode']): Promise<ItemData> {
  const proto = await loadPrototype(contributor, prototype).catch(() => undefined);
  // No path in the URL: the prototype's start item, or its first.
  const item = proto && (_splat ? findItem(proto, _splat) : firstItem(proto));
  const type = item && fileTypeModules[item.fileType];
  const title = proto && item && [proto.title, itemLabel(item.path), APP_NAME].join(' — ');
  // Source view: just the text, so a file that doesn't compile can still be read and fixed.
  if (import.meta.env.DEV && mode === 'source' && proto && item && title && FILE_TYPES[item.fileType]?.language) {
    return { fileType: item.fileType, props: null, source: { proto, item }, title };
  }
  const props = proto && item && type ? await type.load({ proto, item }) : undefined;
  if (!proto || !item || !props || !title) throw notFound();
  return { fileType: item.fileType, props, title };
}

// What an item route loads: the item's page props, or the Source view of it.
type ItemData = { fileType: string; props: object | null; source?: { proto: Prototype; item: Item }; title: string };

// Dev only: import.meta.env.DEV is false in the build, so the editor isn't in the deployed site.
const SourcePane = import.meta.env.DEV ? lazy(() => import('@/studio/app/pages/prototype/SourcePane')) : null;

// The open item, in its file type's page. It shows its own not-found page, inside the
// prototype's navigation, and never renders without its loader's data.
function ItemPage({ data }: { data: ItemData | undefined }) {
  const navigate = useNavigate();
  if (!data) return null;
  // Done goes back to the item's page; unsaved edits ask first (SourcePane.tsx).
  const done = <Button size="sm" variant="outline" onClick={() => navigate({ to: '.', search: ((prev: object) => ({ ...prev, mode: undefined })) as never })}>Done</Button>;
  if (data.source) return SourcePane && <Suspense fallback={null}><SourcePane key={data.source.item.path} {...data.source} actions={done} /></Suspense>;
  const { Page } = fileTypeModules[data.fileType];
  return <Suspense fallback={null}><Page {...data.props!} /></Suspense>;
}

const prototypeIndexRoute = createRoute({
  getParentRoute: () => prototypeRoute,
  path: '/',
  loaderDeps: ({ search }) => ({ mode: search.mode }),
  loader: ({ params, deps }) => itemLoader(params, deps.mode),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title ?? APP_NAME }] }),
  component: () => <ItemPage data={prototypeIndexRoute.useLoaderData()} />,
  notFoundComponent: NotFound,
});

// Splat route: everything after the prototype is the item's path.
// https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts#splat--catch-all-routes
const itemRoute = createRoute({
  getParentRoute: () => prototypeRoute,
  path: '$',
  loaderDeps: ({ search }) => ({ mode: search.mode }),
  loader: ({ params, deps }) => itemLoader(params, deps.mode),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title ?? APP_NAME }] }),
  component: () => <ItemPage data={itemRoute.useLoaderData()} />,
  notFoundComponent: NotFound,
});

// The app's own routes are typed, so links to them are checked. The modules' routes (Tools, Systems, the
// Handbook, the Guide, in src/studio/modules/<id>/app.tsx) are added at run time, and the types leave
// them out: a link to one is written loosely.
const coreRoutes = [indexRoute, prototypeRoute.addChildren([prototypeIndexRoute, itemRoute])] as const;
const routeTree = rootRoute.addChildren([...coreRoutes, ...moduleApps.flatMap(({ app }) => app.routes?.(rootRoute) ?? [])] as unknown as typeof coreRoutes);

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
