// One view, in its prototype system's theme, inside an error boundary. contain:layout plus its
// own portal container keep overlays inside the prototype frame.
import { useState, type ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PortalContext } from '@/lib/portal';
import ViewError from '@/studio/app/pages/prototype/ViewError';
import './lofi.css';

// The route's loader has already loaded Component.
// viewKey (contributor/prototype/group/view) resets the error boundary when the view changes,
// and so does a new Component (the file was fixed, in dev).
// `lofi` is a view that says so in its file (type.ts): the override in lofi.css puts it in grayscale with handwritten type.
export default function ViewFrame({ Component, viewKey, themeClass, lofi = false }: { Component: ComponentType; viewKey: string; themeClass: string; lofi?: boolean }) {
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  return (
    <div className="min-w-0 flex-1">
      {/* The boundary sits outside the system's theme class, so its fallback keeps the app UI's look. */}
      <ErrorBoundary resetKeys={[viewKey, Component]} FallbackComponent={ViewError}>
        {/* contain: layout makes this box the frame for fixed-position overlays, so dialogs
            and their backdrops center and dim within the prototype, not the whole app.
            The box itself doesn't scroll; the inner div does, so overlays stay put. */}
        <div className={`${themeClass}${lofi ? ' lofi-view' : ''} bg-background text-foreground relative h-full [contain:layout]`}>
          <div className="h-full overflow-auto">
            <PortalContext.Provider value={portal}>
              <Component />
            </PortalContext.Provider>
          </div>
          <div ref={setPortal} />
        </div>
      </ErrorBoundary>
    </div>
  );
}
