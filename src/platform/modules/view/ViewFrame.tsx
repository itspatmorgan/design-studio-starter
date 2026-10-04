// One view, in its prototype system's theme, inside an error boundary. contain:layout plus its
// own portal container keep overlays inside the prototype frame.
import { ThemeScope } from '@/platform/modules/systems/ThemeScope';
import { useState, type ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PortalContext } from '@/lib/portal';
import ViewError from '@/platform/modules/prototypes/viewer/ViewError';
import EmptyView from './EmptyView';
import './lofi.css';

// The route's loader has already loaded Component.
// viewKey (contributor/prototype/group/view) resets the error boundary when the view changes,
// and so does a new Component (the file was fixed, in dev).
// `lofi` is a view that says so in its file (type.ts): the override in lofi.css puts it in grayscale with handwritten type.
// `empty` is set for a view that hasn't been built yet (src/lib/emptyView.ts): the platform's own page shows, not in the system's theme.
export default function ViewFrame({ Component, viewKey, themeClass, empty, lofi = false }: { Component: ComponentType; viewKey: string; themeClass: string; empty?: { path: string | null }; lofi?: boolean }) {
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  if (empty) return <div className="bg-background text-foreground min-w-0 flex-1 overflow-auto"><EmptyView path={empty.path} /></div>;
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {/* The boundary sits outside the system's theme class, so its fallback keeps the app UI's look. */}
      <ErrorBoundary resetKeys={[viewKey, Component]} FallbackComponent={ViewError}>
        {/* contain: layout makes this box the frame for fixed-position overlays, so dialogs
            and their backdrops center and dim within the prototype, not the whole app.
            The box itself doesn't scroll; the inner div does, so overlays stay put. */}
        <ThemeScope themeClass={themeClass} className={`${lofi ? ' lofi-view' : ''} bg-background text-foreground relative flex min-h-0 flex-1 flex-col [contain:layout]`}>
          <div className="min-h-0 flex-1 overflow-auto">
            <PortalContext.Provider value={portal}>
              <Component />
            </PortalContext.Provider>
          </div>
          <div ref={setPortal} />
        </ThemeScope>
      </ErrorBoundary>
    </div>
  );
}
