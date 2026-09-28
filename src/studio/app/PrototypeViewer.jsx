import { lazy, Suspense, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PortalContext } from '@/product/components/portal';
import { TooltipProvider } from '@/product/components/tooltip';
import { firstView } from './Index.jsx';
import { loadView } from './loadView.js';
import { Link } from './navigate.jsx';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, CodeIcon } from '@hugeicons/core-free-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { cn } from '@/lib/utils';

// "session-done.jsx" → "Session Done"
const label = (name) => name.replace(/\.jsx$/, '').split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const row = 'mx-1 flex w-[calc(100%-8px)] min-w-0 items-center gap-1.5 rounded-md py-1 pr-1.5 text-[12px] leading-tight transition-colors';

function ViewLink({ proto, view, active, depth }) {
  return (
    <Link
      to={{ contributor: proto.contributorKey, prototype: proto.id, group: view.group, view: view.name }}
      aria-current={active ? 'page' : undefined}
      style={{ paddingLeft: 8 + depth * 16 }}
      className={cn(row, active
        ? 'bg-sidebar-accent-active font-medium text-sidebar-accent-foreground'
        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}
    >
      <HugeiconsIcon icon={CodeIcon} size={14} className="shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{label(view.name)}</span>
    </Link>
  );
}

// A group is a collapsible folder of views, open by default.
function GroupFolder({ name, children }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className={cn(row, 'pl-2 text-left font-medium text-sidebar-foreground hover:bg-sidebar-accent')}>
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} className={cn('shrink-0 text-muted-foreground transition-transform', !open && '-rotate-90')} />
        <span className="min-w-0 flex-1 truncate">{label(name)}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

// Prototype navigation: the prototype's title, then its views, with groups as folders.
function PrototypeNav({ proto, current }) {
  const groups = [...new Set(proto.views.map((v) => v.group).filter(Boolean))];
  const isActive = (v) => v.name === current.view && (v.group ?? null) === current.group;
  return (
    <aside aria-label="Prototype navigation" className="flex w-[220px] shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 px-2 pt-3">
        <p className="flex h-8 items-center truncate px-2.5 text-sm font-semibold leading-tight">{proto.title}</p>
      </div>
      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2 pt-3 pb-3">
        <p className="flex h-7 items-center px-2.5 text-[12px] font-semibold leading-none">Views</p>
        <div className="space-y-1">
          {proto.views.filter((v) => !v.group).map((v) => (
            <ViewLink key={v.name} proto={proto} view={v} active={isActive(v)} depth={0} />
          ))}
          {groups.map((g) => (
            <GroupFolder key={g} name={g}>
              {proto.views.filter((v) => v.group === g).map((v) => (
                <ViewLink key={v.name} proto={proto} view={v} active={isActive(v)} depth={1} />
              ))}
            </GroupFolder>
          ))}
        </div>
      </nav>
    </aside>
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
    // The view sits in a rounded frame, inset on a gray background.
    <div className="min-w-0 flex-1 bg-zinc-200 p-2">
      <div className="product-theme bg-background text-foreground relative h-full overflow-auto rounded-xl">
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
    <div className="flex min-h-0 flex-1">
      <PrototypeNav proto={proto} current={{ group, view }} />
      <ProductView contributor={contributor} prototype={prototype} group={group} view={view} />
    </div>
  );
}
