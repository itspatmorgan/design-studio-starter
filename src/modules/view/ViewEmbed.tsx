// A view shown live inside another item (on a canvas): the page at a fixed desktop width,
// scaled down to fit the box it's given, and cropped at the bottom. It's a picture: nothing in
// it takes clicks. Same theme, portal and error handling as the view's own page.
import { ThemeScope } from '@/modules/systems/ThemeScope';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PortalContext } from '@/lib/portal';
import { PrototypeNavigationProvider } from '../prototypes/lib';
import type { EmbedProps } from '@/platform/app/data/fileTypeModule';
import { loadView } from './load';
import './lofi.css';

// The width the view is laid out at, before it's scaled down.
export const EMBED_VIEWPORT_WIDTH = 1440;

type Loaded = NonNullable<Awaited<ReturnType<typeof loadView>>>;

function Unavailable({ children }: { children: string }) {
  return <div className="flex h-full items-center justify-center bg-muted p-4 text-center text-xs text-muted-foreground">{children}</div>;
}

export default function ViewEmbed({ proto, item, width, height }: EmbedProps) {
  const [loaded, setLoaded] = useState<Loaded | null | 'failed'>(null);
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let live = true;
    loadView({ proto, item }).then((v) => live && setLoaded(v ?? 'failed'), () => live && setLoaded('failed'));
    return () => { live = false; };
  }, [proto, item]);

  if (loaded === 'failed') return <Unavailable>This view couldn't load.</Unavailable>;
  if (!loaded) return <Unavailable>Loading…</Unavailable>;
  const { Component, themeClass, viewKey, empty, lofi } = loaded;
  if (loaded.missingSystem) return <Unavailable>This prototype needs a rebuild because its system was deleted.</Unavailable>;
  if (empty) return <Unavailable>This view is empty.</Unavailable>;
  const scale = width / EMBED_VIEWPORT_WIDTH;
  return (
    <div aria-hidden className="relative overflow-hidden bg-background" style={{ width, height }}>
      <ThemeScope themeClass={themeClass}
        className={`${lofi ? ' lofi-view' : ''} bg-background text-foreground absolute top-0 left-0 origin-top-left overflow-hidden [contain:layout]`}
        style={{ width: EMBED_VIEWPORT_WIDTH, height: height / scale, transform: `scale(${scale})` }}
      >
        <ErrorBoundary resetKeys={[viewKey, Component]} fallbackRender={() => <Unavailable>This view has an error. Open it to see what's wrong.</Unavailable>}>
          <PortalContext.Provider value={portal}>
            <PrototypeNavigationProvider value={loaded.prototype}><Component /></PrototypeNavigationProvider>
          </PortalContext.Provider>
        </ErrorBoundary>
        <div ref={setPortal} />
      </ThemeScope>
    </div>
  );
}
