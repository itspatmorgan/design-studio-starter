import { lazy, Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PortalContext } from '@/product/components/portal';
import { TooltipProvider } from '@/product/components/tooltip';
import { firstView } from './Index.jsx';
import { loadView } from './loadView.js';
import { Link } from './navigate.jsx';

function PrototypeNav({ proto, current }) {
  const groups = [...new Set(proto.views.map((v) => v.group).filter(Boolean))];
  const list = (views) => (
    <ul className="space-y-0.5">
      {views.map((v) => {
        const active = v.name === current.view && (v.group ?? null) === current.group;
        return (
          <li key={`${v.group}/${v.name}`}>
            <Link
              to={{ contributor: proto.contributorKey, prototype: proto.id, group: v.group, view: v.name }}
              className={`block rounded-md px-2 py-1.5 hover:bg-muted ${active ? 'bg-muted font-medium' : 'text-muted-foreground'}`}
            >
              {v.name.replace(/\.jsx$/, '')}
            </Link>
          </li>
        );
      })}
    </ul>
  );
  return (
    <nav aria-label="Prototype" className="w-60 shrink-0 space-y-5 border-r px-4 py-6 text-sm">
      <div className="px-2">
        <p className="font-semibold">{proto.title}</p>
        <p className="text-xs text-muted-foreground">{proto.contributor || proto.contributorKey}</p>
      </div>
      {list(proto.views.filter((v) => !v.group))}
      {groups.map((g) => (
        <div key={g} className="space-y-1">
          <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{g}</p>
          {list(proto.views.filter((v) => v.group === g))}
        </div>
      ))}
    </nav>
  );
}

function ProductView({ contributor, prototype, group, view }) {
  const key = [contributor, prototype, group, view].join('/');
  const View = useMemo(
    () => lazy(() => loadView({ contributor, prototype, group, view })),
    [key],
  );
  const [portal, setPortal] = useState(null);

  return (
    <div className="product-theme bg-background text-foreground flex-1">
      <PortalContext.Provider value={portal}>
        <TooltipProvider>
          <ErrorBoundary resetKeys={[key]} fallback={<p className="p-8">This view failed to load.</p>}>
            <Suspense fallback={<p className="p-8">Loading…</p>}>
              <View />
            </Suspense>
          </ErrorBoundary>
        </TooltipProvider>
      </PortalContext.Provider>
      <div ref={setPortal} />
    </div>
  );
}

export default function PrototypeViewer({ params, manifest }) {
  const { contributor, prototype } = params;
  if (!manifest) return <p className="p-8 text-muted-foreground">Loading…</p>;

  const proto = manifest.prototypes.find((p) => p.contributorKey === contributor && p.id === prototype);
  if (!proto) return <p className="p-8 text-muted-foreground">Prototype not found: {contributor}/{prototype}</p>;

  // With no view in the URL, open the prototype's default view.
  const fallback = firstView(proto);
  const view = params.view ?? fallback?.name;
  const group = params.view ? params.group ?? null : fallback?.group ?? null;
  if (!view) return <p className="p-8 text-muted-foreground">This prototype has no views yet.</p>;

  return (
    <div className="flex flex-1">
      <PrototypeNav proto={proto} current={{ group, view }} />
      <ProductView contributor={contributor} prototype={prototype} group={group} view={view} />
    </div>
  );
}
