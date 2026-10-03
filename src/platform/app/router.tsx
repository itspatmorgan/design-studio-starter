// Routes and router, in code (TanStack Router's code-based routing):
// https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing
//
//   /                                        Home: what each module adds to the app's front page
//   /prototypes/$contributor/$prototype      a prototype, on its start item (or its first)
//   /prototypes/$contributor/$prototype/$    an item, by its path without the extension, at any depth:
//                                            /prototypes/patrick/hello-world/lofi/main
//                                            (?mode=source shows its text, in dev: ArtifactSource)
//   /$contributor/$prototype[/$]             the same for a section's items: /examples/sample, /handbook/context.
//                                            An address from before prototypes moved, /patrick/hello-world, is
//                                            sent on to /prototypes/patrick/hello-world.
//
// The modules add their own: /prototypes (the gallery), /examples, /systems/$system, /handbook, /documentation/guide/$page
// (src/platform/modules/<id>/app.tsx). Everything that opens in the viewer does so through the routes above.
import { lazy, Suspense } from 'react';
import { createRootRoute, createRoute, createRouter, notFound, redirect, useRouter } from '@tanstack/react-router';
import { useSourceView } from '@/platform/core/source/useSourceView';
import { shortcutLabel } from '@/platform/app/shell/artifactShortcuts';
import { Button } from '@/platform/components/button';
import App, { NotFound } from '@/platform/app/shell/App';
import Home from '@/platform/app/pages/home/Home';
import PrototypeLayout from '@/platform/modules/prototypes/viewer/PrototypeLayout';
import { isSectionKey } from '@/platform/core/roots';
import { findArtifact, firstArtifact, artifactLabel, loadManifest, loadPrototype, setManifest } from '@/platform/app/data/manifest';
import { FILE_TYPES, fileTypeModules } from '@/platform/app/data/fileTypes';
import type { Artifact, Manifest, Prototype } from '@/platform/app/data/types';
import { TAB_ID } from '@/platform/app/data/files';
import { moduleApps } from '@/platform/app/modules';
import { APP_NAME } from '@/platform/app/data/config';
import { loadReference } from '@/platform/app/docs/loadReference';
import MarkdownPage from '@/platform/app/docs/MarkdownPage';
import { ReferenceLayout, ReferenceIndex, AboutReference } from '@/platform/app/docs/References';


function LoadError({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  return <div role="alert" className="space-y-3 p-8">
    <p className="text-sm font-medium">This page couldn't load.</p>
    <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : String(error)}</p>
    <Button variant="outline" onClick={() => { void router.invalidate().then(reset); }}>Try again</Button>
  </div>;
}

const rootRoute = createRootRoute({
  loader: () => loadManifest(),
  staleTime: Infinity,
  head: () => ({ meta: [{ title: APP_NAME }] }),
  component: App,
  notFoundComponent: NotFound,
  errorComponent: LoadError,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  head: () => ({ meta: [{ title: APP_NAME }] }),
  component: Home,
});

const documentationRoute = createRoute({ getParentRoute: () => rootRoute, path: 'documentation', beforeLoad: async () => {
  const { guide } = await loadManifest();
  throw redirect({ to: (guide.length ? '/documentation/guide' : '/documentation/reference') as never, replace: true });
} });

// References and their local file actions remain available without the optional Guide.
const DocumentationEditor = import.meta.env.DEV ? lazy(() => import('@/platform/app/docs/DocumentationEditor')) : null;
const referencesRoute = createRoute({ getParentRoute: () => rootRoute, path: 'documentation/reference', validateSearch: (search: Record<string, unknown>): { mode?: 'source' } => ({ mode: search.mode === 'source' ? 'source' : undefined }), component: ReferenceLayout });
const referenceIndexRoute = createRoute({ getParentRoute: () => referencesRoute, path: '/', head: () => ({ meta: [{ title: 'Reference — ' + APP_NAME }] }), component: ReferenceIndex });
const referenceRoute = createRoute({
  getParentRoute: () => referencesRoute,
  path: '$',
  loaderDeps: ({ search }) => ({ mode: search.mode }),
  loader: async ({ params, deps }) => {
    const path = '/' + (params._splat ?? '');
    const manifest = await loadManifest();
    const group = manifest.platformReferences.find((g) => g.references.some((ref) => ref.source === path));
    if (import.meta.env.DEV && deps.mode === 'source') {
      if (!group) throw notFound();
      return { editing: true as const, path, title: 'Source' };
    }
    const mod = await loadReference(path);
    if (!mod) throw notFound();
    const title = group?.references.find((ref) => ref.source === path)?.title ?? mod.frontmatter?.title;
    return { editing: false as const, Component: mod.default, frontmatter: { ...mod.frontmatter, title }, path, group, title };
  },
  head: ({ loaderData }) => ({ meta: [{ title: [loaderData?.title, 'Reference', APP_NAME].filter(Boolean).join(' — ') }] }),
  component: () => {
    const data = referenceRoute.useLoaderData();
    const { rendered } = useSourceView(import.meta.env.DEV, data.editing);
    if (data.editing) return DocumentationEditor && <Suspense fallback={null}><DocumentationEditor path={'src' + data.path} /></Suspense>;
    return <div ref={rendered} tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none [&>div]:min-h-0"><MarkdownPage Component={data.Component} frontmatter={data.frontmatter} docKey={data.path} base={'/documentation/reference' + data.path.slice(0, data.path.lastIndexOf('/'))} footer={<AboutReference source={data.path} group={data.group} />} /></div>;
  },
  notFoundComponent: NotFound,
});

// ?mode=source shows an item's text instead of the item (dev only): "Edit source" in its file menu.
type ItemSearch = { mode?: 'source' };

// Loads an item before the route renders, so the current one stays on screen until the next
// one is ready. Its file type (src/platform/modules/<type>/) loads the file. An unknown address, or a type
// that isn't installed, shows the not-found page.
async function itemLoader({ contributor, prototype, _splat }: { contributor: string; prototype: string; _splat?: string }, mode?: ItemSearch['mode']): Promise<ItemData> {
  const proto = await loadPrototype(contributor, prototype);
  // No path in the URL: the prototype's start item, or its first.
  const item = proto && (_splat ? findArtifact(proto, _splat) : firstArtifact(proto));
  const type = item && fileTypeModules[item.fileType];
  const title = proto && item && [proto.title, artifactLabel(item.path, proto), APP_NAME].join(' — ');
  // Source view: just the text, so a file that doesn't compile can still be read and fixed.
  if (import.meta.env.DEV && mode === 'source' && proto && item && title && FILE_TYPES[item.fileType]?.language) {
    return { fileType: item.fileType, props: null, source: { proto, item }, title };
  }
  const props = proto && item && type ? await type.load({ proto, item }) : undefined;
  if (!proto || !item || !props || !title) throw notFound();
  return { fileType: item.fileType, props, title };
}

// What an item route loads: the item's page props, or the Source view of it.
type ItemData = { fileType: string; props: object | null; source?: { proto: Prototype; item: Artifact }; title: string };

// Dev only: import.meta.env.DEV is false in the build, so the editor isn't in the deployed site.
const ArtifactSource = import.meta.env.DEV ? lazy(() => import('@/platform/app/source/ArtifactSource')) : null;

// The open item, in its file type's page. It shows its own not-found page, inside the
// prototype's navigation, and never renders without its loader's data.
function ItemPage({ data }: { data: ItemData | undefined }) {
  const source = Boolean(data?.source);
  const { toggle, rendered } = useSourceView(import.meta.env.DEV && Boolean(data && FILE_TYPES[data.fileType]?.language), source);
  if (!data) return null;
  // Done goes back to the item's page; unsaved edits ask first (the shared SourceEditor).
  const done = <Button size="sm" variant="outline" onClick={toggle} title={`Return to rendered view (${shortcutLabel('source')})`}>Done</Button>;
  if (data.source) return ArtifactSource && <Suspense fallback={null}><ArtifactSource key={data.source.item.path} {...data.source} actions={done} /></Suspense>;
  const { Page } = fileTypeModules[data.fileType];
  return <div ref={rendered} tabIndex={-1} className="flex min-h-0 min-w-0 flex-1 outline-none"><Suspense fallback={null}><Page {...data.props!} /></Suspense></div>;
}

// The routes that open an item in the viewer: one set for a prototype (/prototypes/<person>/<id>) and one for an item
// of a section (/examples/<id>, /handbook/<section>). They do the same thing and are written twice, not made by a
// function, because the router's types need each path written out to check links to it.
const loadProto = async ({ contributor, prototype }: { contributor: string; prototype: string }) => {
  const proto = await loadPrototype(contributor, prototype);
  if (!proto) throw notFound();
  return { proto };
};
const searchOf = (search: Record<string, unknown>): ItemSearch => ({ mode: search.mode === 'source' ? 'source' : undefined });
const titleOf = ({ loaderData }: { loaderData?: ItemData }) => ({ meta: [{ title: loaderData?.title ?? APP_NAME }] });

// A prototype's, with its navigation around whichever item is open.
const prototypeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'prototypes/$contributor/$prototype',
  validateSearch: searchOf,
  loader: ({ params }) => loadProto(params),
  component: () => <PrototypeLayout proto={prototypeRoute.useLoaderData().proto} />,
  notFoundComponent: NotFound,
});
const prototypeIndexRoute = createRoute({
  getParentRoute: () => prototypeRoute,
  path: '/',
  loaderDeps: ({ search }) => ({ mode: search.mode }),
  loader: ({ params, deps }) => itemLoader(params, deps.mode),
  head: titleOf,
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
  head: titleOf,
  component: () => <ItemPage data={itemRoute.useLoaderData()} />,
  notFoundComponent: NotFound,
});

// A section's. A first part that isn't a section is a prototype's address from before prototypes moved under
// /prototypes (/patrick/hello-world), so it is sent there.
const sectionItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$contributor/$prototype',
  beforeLoad: async ({ params, location }) => {
    if (!isSectionKey(params.contributor)) {
      const manifest = await loadManifest();
      if (!manifest.prototypes.some((proto) => proto.contributorKey === params.contributor)) throw notFound();
      throw redirect({ to: `/prototypes${location.pathname}` as never, search: location.search as never, replace: true });
    }
  },
  validateSearch: searchOf,
  loader: ({ params }) => loadProto(params),
  component: () => <PrototypeLayout proto={sectionItemRoute.useLoaderData().proto} />,
  notFoundComponent: NotFound,
});
const sectionItemIndexRoute = createRoute({
  getParentRoute: () => sectionItemRoute,
  path: '/',
  loaderDeps: ({ search }) => ({ mode: search.mode }),
  loader: ({ params, deps }) => itemLoader(params, deps.mode),
  head: titleOf,
  component: () => <ItemPage data={sectionItemIndexRoute.useLoaderData()} />,
  notFoundComponent: NotFound,
});
const sectionItemSplatRoute = createRoute({
  getParentRoute: () => sectionItemRoute,
  path: '$',
  loaderDeps: ({ search }) => ({ mode: search.mode }),
  loader: ({ params, deps }) => itemLoader(params, deps.mode),
  head: titleOf,
  component: () => <ItemPage data={sectionItemSplatRoute.useLoaderData()} />,
  notFoundComponent: NotFound,
});

// The app's own routes are typed, so links to them are checked. The modules' routes (Systems, the
// Handbook, the Guide, in src/platform/modules/<id>/app.tsx) are added at run time, and the types leave
// them out: a link to one is written loosely.
const coreRoutes = [homeRoute, documentationRoute, referencesRoute.addChildren([referenceIndexRoute, referenceRoute]), prototypeRoute.addChildren([prototypeIndexRoute, itemRoute]), sectionItemRoute.addChildren([sectionItemIndexRoute, sectionItemSplatRoute])] as const;
const routeTree = rootRoute.addChildren([...coreRoutes, ...moduleApps.flatMap(({ app }) => app.routes?.(rootRoute) ?? [])] as unknown as typeof coreRoutes);

export const router = createRouter({
  routeTree,
  // Browser history: clean URLs; the host must serve index.html for every path (see README, Hosting).
  // No rewrites on your host? Use hash URLs instead (/#/prototypes/patrick/hello-world):
  //   import { createHashHistory } from '@tanstack/react-router';
  //   history: createHashHistory(),
  // https://tanstack.com/router/latest/docs/framework/react/guide/history-types
  basepath: import.meta.env.BASE_URL,
  defaultErrorComponent: LoadError,
  defaultPreload: 'intent',
});

// Type-safe Link, useNavigate, useParams, and useSearch everywhere.
// https://tanstack.com/router/latest/docs/framework/react/decisions-on-dx#declaring-the-router-instance-for-type-inference
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// In dev, the manifest updates live as files change (scripts/build/vite-manifest-watch-plugin.js).
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
