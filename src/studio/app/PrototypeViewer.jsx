import { lazy, Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PortalContext } from '@/product/components/portal';
import { TooltipProvider } from '@/product/components/tooltip';
import { loadView } from './loadView.js';
import { Link } from './navigate.jsx';

function PrototypeNav({ proto, contributor, current }) {
  if (!proto) return null;
  const top = proto.views.filter((v) => !v.group);
  const groups = [...new Set(proto.views.filter((v) => v.group).map((v) => v.group))];
  const item = (v) => {
    const active = v.name === current.view && (v.group ?? '') === (current.group ?? '');
    return (
      <li key={`${v.group}/${v.name}`}>
        <Link to={{ contributor, prototype: proto.id, group: v.group, view: v.name }}
          className={`block rounded px-2 py-1 hover:bg-muted ${active ? 'bg-muted font-medium' : ''}`}>
          {v.name.replace(/\.jsx$/, '')}
        </Link>
      </li>
    );
  };
  return (
    <nav aria-label="Prototype" className="w-56 shrink-0 border-r p-4 text-sm">
      <p className="mb-2 font-semibold">{proto.title}</p>
      <ul>{top.map(item)}</ul>
      {groups.map((g) => (
        <div key={g} className="mt-3">
          <p className="px-2 text-xs uppercase text-muted-foreground">{g}</p>
          <ul>{proto.views.filter((v) => v.group === g).map(item)}</ul>
        </div>
      ))}
    </nav>
  );
}

export default function PrototypeViewer({ params, manifest }) {
  const { contributor, prototype, group = null, view = 'prototype.jsx' } = params;
  const key = [contributor, prototype, group, view].join('/');
  const View = useMemo(
    () => lazy(() => loadView({ contributor, prototype, group, view })),
    [key],
  );
  const [portal, setPortal] = useState(null);
  const proto = manifest?.prototypes.find((p) => p.contributorKey === contributor && p.id === prototype);

  return (
    <div className="flex min-h-[calc(100vh-49px)]">
      <PrototypeNav proto={proto} contributor={contributor} current={{ group, view }} />
      <div className="product-theme bg-background text-foreground flex-1">
        <PortalContext.Provider value={portal}>
          <TooltipProvider>
            <ErrorBoundary resetKeys={[key]} fallback={<p className="p-6">This view failed to load.</p>}>
              <Suspense fallback={<p className="p-6">Loading…</p>}>
                <View />
              </Suspense>
            </ErrorBoundary>
          </TooltipProvider>
        </PortalContext.Provider>
        <div ref={setPortal} />
      </div>
    </div>
  );
}
