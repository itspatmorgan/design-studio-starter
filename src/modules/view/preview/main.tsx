import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from '@tanstack/react-router';
import { loadView } from '../load';
import { resolveTarget, previewTarget } from './target';
import { CHANNEL, VERSION, acceptsHost, identityOf, prototypeScopeOf, readBootstrap, routerHref, previewUrl, validHref, type Config, type PreviewMessage } from './protocol';
import PreviewSurface, { type LoadedView } from './PreviewSurface';
import { loadManifest, setManifest, allPrototypes, withItems, findArtifactByIdentity, findArtifact } from '@/platform/app/data/manifest';
import type { Manifest } from '@/platform/app/data/types';
import { addressOf } from '@/platform/core/roots';
import { previewShortcut } from '@/platform/app/shell/artifactShortcuts';

type Status = Extract<PreviewMessage, { kind: 'status' }>;
const RuntimeContext = createContext<{ config: Config; refresh: number; status: (state: Status['state'], render: number, detail?: string) => void } | null>(null);

function RuntimeView() {
  const { config, refresh, status } = useContext(RuntimeContext)!;
  const [loaded, setLoaded] = useState<{ identity: string; value: LoadedView } | null>(null);
  const [error, setError] = useState<{ identity: string; detail: string } | null>(null);
  const render = useRef(0);
  const identity = identityOf(config.target);
  useEffect(() => {
    let live = true;
    const revision = ++render.current;
    setError(null);
    status('loading', revision);
    void resolveTarget(config.target).then(loadView).then(result => {
      if (!live) return;
      if (!result) throw new Error('This React view could not load.');
      document.title = result.prototype.title + ' preview';
      setLoaded({ identity, value: result });
    }).catch(error => {
      if (!live) return;
      const detail = error instanceof Error ? error.message : String(error);
      setLoaded(null); setError({ identity, detail }); status('error', revision, detail);
    });
    return () => { live = false; };
  }, [identity, refresh, status]);
  const ready = useCallback(() => status('ready', render.current), [status, loaded]);
  const failed = useCallback((error: unknown) => status('error', render.current, error instanceof Error ? error.message : String(error)), [status]);
  // A new artifact must not display the previous component while its import resolves.
  if (error?.identity === identity) return <div role="alert" className="p-8 text-sm"><p>This page could not load. Give the error to your agent.</p><pre className="mt-4 whitespace-pre-wrap">{error.detail}</pre></div>;
  if (!loaded || loaded.identity !== identity) return <p role="status" className="p-4 text-sm">Loading preview</p>;
  return <PreviewSurface loaded={loaded.value} surface={config.surface} ready={ready} failed={failed} />;
}

async function targetFromHref(href: string): Promise<Config['target'] | null> {
  const url = new URL(href, location.origin);
  if (url.searchParams.get('mode') === 'source') return null;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const pathname = url.pathname.slice(base.length);
  const refs = allPrototypes(await loadManifest());
  const permanent = /^\/prototypes\/([^/]+)\/artifacts\/([^/]+)$/.exec(pathname);
  if (permanent) {
    const ref = refs.find(proto => proto.studioId === permanent[1]);
    if (!ref) return null;
    const proto = await withItems(ref);
    const item = findArtifactByIdentity(proto, permanent[2]);
    return item?.fileType === 'view' ? previewTarget({ proto, item }) : null;
  }
  for (const ref of refs) {
    const prefix = addressOf(ref.contributorKey, ref.id) + '/';
    if (!pathname.startsWith(prefix)) continue;
    const proto = await withItems(ref);
    const item = findArtifact(proto, pathname.slice(prefix.length));
    if (item?.fileType === 'view') return previewTarget({ proto, item });
  }
  return null;
}

function start() {
  const bootstrap = readBootstrap(location.search);
  const hosted = window.parent !== window;
  const runtime = crypto.randomUUID();
  // Native links (including modified clicks) and relative assets see the artifact address.
  const addressBase = document.createElement('base');
  addressBase.href = new URL(bootstrap.config.href, location.origin).href;
  document.head.prepend(addressBase);
  let current = bootstrap.config;
  let request = 0;
  let lastRender = 0;
  const history = createMemoryHistory({ initialEntries: [current.href] });
  const rootRoute = createRootRoute({ component: Outlet });
  const viewRoute = createRoute({ getParentRoute: () => rootRoute, path: '$', component: RuntimeView });
  const router = createRouter({ routeTree: rootRoute.addChildren([viewRoute]), history, basepath: import.meta.env.BASE_URL });
  const envelope = () => ({ channel: CHANNEL, version: VERSION, session: bootstrap.session, runtime, identity: identityOf(current.target) } as const);
  const send = (event: Omit<Extract<PreviewMessage, { kind: 'status' }>, keyof ReturnType<typeof envelope>> | { kind: 'hello' } | { kind: 'navigate'; href: string; replace: boolean } | { kind: 'shortcut'; action: 'source' | 'grid' | 'palette' | 'navigation' }) => {
    if (hosted) window.parent.postMessage({ ...envelope(), ...event }, location.origin);
  };
  function Runtime() {
    const [config, setConfig] = useState(current);
    const [refresh, setRefresh] = useState(0);
    const identity = identityOf(config.target);
    const status = useCallback((state: Status['state'], render: number, detail = '') => {
      lastRender = Math.max(lastRender, render);
      if (hosted) window.parent.postMessage({ ...envelope(), identity, kind: 'status', state, render: lastRender, detail: detail.slice(0, 4096) }, location.origin);
    }, [identity]);
    useEffect(() => {
      const apply = (next: Config) => {
        current = next;
        addressBase.href = new URL(next.href, location.origin).href;
        document.documentElement.classList.toggle('dark', next.dark);
        setConfig(next);
        if (history.location.href !== next.href) {
          void router.navigate({ to: routerHref(next.href, import.meta.env.BASE_URL) as never, replace: true });
        }
      };
      const onMessage = (event: MessageEvent) => {
        if (!acceptsHost(event, window.parent, location.origin, bootstrap.session, runtime, bootstrap.config.surface, prototypeScopeOf(bootstrap.config.target))) return;
        apply(event.data.config);
      };
      const navigation = async (href: string, replace: boolean) => {
        if (!validHref(href)) return;
        if (current.surface === 'embed' || href === current.href) return;
        if (hosted) { send({ kind: 'navigate', href, replace }); return; }
        const ticket = ++request;
        const target = await targetFromHref(href);
        if (ticket !== request) return;
        if (!target) { window.location.assign(href); return; }
        if (prototypeScopeOf(target) !== prototypeScopeOf(current.target)) {
          window.location.assign(previewUrl({ ...current, target, href }, crypto.randomUUID(), import.meta.env.BASE_URL));
          return;
        }
        apply({ ...current, target, href });
        const url = previewUrl(current, bootstrap.session, import.meta.env.BASE_URL);
        if (replace) window.history.replaceState(null, '', url); else window.history.pushState(null, '', url);
      };
      const unsubscribe = history.subscribe(({ action }) => { void navigation(history.location.href, action.type === 'REPLACE'); });
      const onClick = (event: MouseEvent) => {
        const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
        if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || anchor.download || anchor.target === '_blank') return;
        const raw = anchor.getAttribute('href')!;
        const url = new URL(raw, document.baseURI);
        if (raw.startsWith('#')) {
          event.preventDefault();
          const hash = raw.slice(1);
          try { document.getElementById(decodeURIComponent(hash))?.scrollIntoView(); } catch { /* malformed hash */ }
          void router.navigate({ to: routerHref(history.location.pathname + history.location.search + raw, import.meta.env.BASE_URL) as never });
        } else if (url.origin === location.origin && url.pathname.startsWith(import.meta.env.BASE_URL)) {
          // Native anchors and TanStack links both stay inside the Studio navigation policy.
          event.preventDefault();
          void router.navigate({ to: routerHref(url.pathname + url.search + url.hash, import.meta.env.BASE_URL) as never });
        } else if (url.protocol === 'https:' || url.protocol === 'http:') {
          event.preventDefault();
          window.open(url.href, '_blank', 'noopener,noreferrer');
        }
      };
      const onKey = (event: KeyboardEvent) => {
        const action = previewShortcut(event);
        if (!hosted || current.surface !== 'page' || event.defaultPrevented || !action) return;
        if (event.target instanceof HTMLElement && (event.target.isContentEditable || event.target.closest('input,textarea,select'))) return;
        if ((action === 'source' || action === 'grid') && document.querySelector('[role="dialog"],[role="alertdialog"],[role="menu"]')) return;
        event.preventDefault(); event.stopImmediatePropagation(); send({ kind: 'shortcut', action });
      };
      // Preserve the shell's reserved shortcuts; search can be consumed by prototype handlers.
      const onReservedKey = (event: KeyboardEvent) => { if (previewShortcut(event) !== 'palette') onKey(event); };
      const onSearchKey = (event: KeyboardEvent) => { if (previewShortcut(event) === 'palette') onKey(event); };
      const onPopState = () => {
        if (hosted) return;
        try {
          const next = readBootstrap(location.search);
          if (next.session !== bootstrap.session || prototypeScopeOf(next.config.target) !== prototypeScopeOf(current.target) || next.config.surface !== current.surface) { window.location.reload(); return; }
          ++request; // Cancel any pending direct navigation before restoring browser history.
          apply(next.config);
        } catch { window.location.reload(); }
      };
      window.addEventListener('popstate', onPopState);
      const reload = () => setRefresh(value => value + 1);
      const manifest = ({ manifest }: { manifest: Manifest }) => { setManifest(manifest); reload(); };
      const uncaught = (event: ErrorEvent) => send({ kind: 'status', state: 'error', render: lastRender, detail: event.message.slice(0, 4096) });
      const rejected = (event: PromiseRejectionEvent) => send({ kind: 'status', state: 'error', render: lastRender, detail: String(event.reason).slice(0, 4096) });
      window.addEventListener('message', onMessage);
      document.addEventListener('click', onClick);
      window.addEventListener('keydown', onReservedKey, true);
      window.addEventListener('keydown', onSearchKey);
      window.addEventListener('error', uncaught);
      window.addEventListener('unhandledrejection', rejected);
      window.addEventListener('studio:views', reload);
      if (import.meta.hot) {
        import.meta.hot.on('studio:manifest', manifest);
        import.meta.hot.on('studio:file', reload);
      }
      apply(current);
      send({ kind: 'hello' });
      return () => {
        unsubscribe();
        window.removeEventListener('popstate', onPopState);
        window.removeEventListener('message', onMessage);
        document.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onReservedKey, true);
        window.removeEventListener('keydown', onSearchKey);
        window.removeEventListener('error', uncaught);
        window.removeEventListener('unhandledrejection', rejected);
        window.removeEventListener('studio:views', reload);
        import.meta.hot?.off('studio:manifest', manifest);
        import.meta.hot?.off('studio:file', reload);
      };
    }, []);
    return <RuntimeContext.Provider value={{ config, refresh, status }}><RouterProvider router={router} /></RuntimeContext.Provider>;
  }
  document.documentElement.classList.toggle('dark', current.dark);
  const mount = document.getElementById('root')!;
  mount.style.cssText = 'height:100vh;display:flex;flex-direction:column;overflow:hidden';
  if (current.surface === 'embed') mount.inert = true;
  const root = createRoot(mount);
  root.render(<Runtime />);
  import.meta.hot?.dispose(() => { root.unmount(); addressBase.remove(); });
}

try { start(); }
catch (error) {
  const root = document.getElementById('root')!;
  root.setAttribute('role', 'alert');
  root.textContent = error instanceof Error ? error.message : 'This preview could not start.';
}
