import { lazy, Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PortalContext } from '@/product/components/portal';
import { firstView, formatDate } from './Index.jsx';
import { loadView } from './loadView.js';
import { Link } from './navigate.jsx';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, CodeIcon, Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/studio/components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { ContributorAvatar } from '@/studio/components/avatar';
import { cn } from '@/lib/utils';

// "session-done.jsx" (or .tsx) → "Session Done"
export const viewLabel = (name) => name.replace(/\.[jt]sx$/, '').split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
      <span className="min-w-0 flex-1 truncate">{viewLabel(view.name)}</span>
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
        <span className="min-w-0 flex-1 truncate">{viewLabel(name)}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

// About: the prototype's meta.json, collapsed at the bottom of its navigation.
function About({ proto }) {
  const [open, setOpen] = useState(false);
  const date = proto.updated && proto.updated !== proto.created
    ? `Updated ${formatDate(proto.updated)}`
    : proto.created && `Created ${formatDate(proto.created)}`;
  const labelClass = 'text-[11px] text-muted-foreground';
  const valueClass = 'mt-0.5 text-[12px] leading-snug text-sidebar-foreground';
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="shrink-0 border-t border-sidebar-border">
      <CollapsibleTrigger
        aria-label={open ? 'Collapse prototype info' : 'Expand prototype info'}
        className="flex h-9 w-full items-center gap-1.5 px-2.5 text-left hover:bg-sidebar-accent"
      >
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-none">About</span>
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} className={cn('shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 px-2.5 pt-0.5 pb-3">
          <dl className="space-y-2.5">
            {proto.contributor && (
              <div>
                <dt className={labelClass}>Owner</dt>
                <dd className={cn(valueClass, 'flex min-w-0 items-center gap-2')}>
                  <ContributorAvatar name={proto.contributor} size={18} />
                  <span className="truncate">{proto.contributor}</span>
                </dd>
              </div>
            )}
            {date && (
              <div>
                <dt className={labelClass}>Last updated</dt>
                <dd className={valueClass}>{date}</dd>
              </div>
            )}
          </dl>
          {proto.description && <p className="text-xs leading-relaxed text-muted-foreground">{proto.description}</p>}
        </div>
      </CollapsibleContent>
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
      <About proto={proto} />
    </aside>
  );
}

// One lazy component per view, created once, so React can pause and retry
// while a view loads without starting the load over.
const lazyViews = new Map();
function getView(params, key) {
  if (!lazyViews.has(key)) lazyViews.set(key, lazy(() => loadView(params)));
  return lazyViews.get(key);
}

// Shown in place of a view that throws, with the error so it can be copied into a bug report or an agent chat.
function ViewError({ error }) {
  const [copied, setCopied] = useState(false);
  const message = error?.message || String(error);
  const copy = async () => {
    await navigator.clipboard.writeText(error?.stack || message);
    setCopied(true);
  };
  return (
    <div role="alert" className="max-w-2xl space-y-3 p-8">
      <p className="text-sm font-medium">This view failed to load.</p>
      <pre className="overflow-auto rounded-md bg-muted p-3 text-sm whitespace-pre-wrap text-muted-foreground">{message}</pre>
      <Button variant="outline" size="sm" onClick={copy}>
        <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} size={14} />
        {copied ? 'Copied' : 'Copy error'}
      </Button>
    </div>
  );
}

function ProductView({ contributor, prototype, group, view }) {
  const key = [contributor, prototype, group, view].join('/');
  const View = getView({ contributor, prototype, group, view }, key);
  const [portal, setPortal] = useState(null);

  return (
    <div className="min-w-0 flex-1">
      {/* The boundary sits outside .product-theme, so its fallback keeps the app UI's look. */}
      <ErrorBoundary resetKeys={[key]} FallbackComponent={ViewError}>
        <div className="product-theme bg-background text-foreground relative h-full overflow-auto">
          <PortalContext.Provider value={portal}>
            <Suspense fallback={null}>
              <View />
            </Suspense>
          </PortalContext.Provider>
          <div ref={setPortal} />
        </div>
      </ErrorBoundary>
    </div>
  );
}

// Placeholder bars while the manifest loads, shaped like the navigation and frame.
function ViewerSkeleton({ sectionNavOpen }) {
  return (
    <div className="flex min-h-0 flex-1" aria-busy="true">
      {sectionNavOpen && (
        <div className="w-[220px] shrink-0 space-y-3 border-r border-sidebar-border bg-sidebar px-4 pt-5">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
          <div className="h-3 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      )}
      <div className="flex-1" />
    </div>
  );
}

// sectionNavOpen: show the prototype navigation (toggled from the rail or with ⌘;).
export default function PrototypeViewer({ params, manifest, sectionNavOpen = true }) {
  const { contributor, prototype } = params;
  if (!manifest) return <ViewerSkeleton sectionNavOpen={sectionNavOpen} />;

  const proto = manifest.prototypes.find((p) => p.contributorKey === contributor && p.id === prototype);
  if (!proto) return <p className="p-8 text-muted-foreground">Prototype not found: {contributor}/{prototype}</p>;

  // With no view in the URL, open the prototype's default view.
  const fallback = firstView(proto);
  const view = params.view ?? fallback?.name;
  const group = params.view ? params.group ?? null : fallback?.group ?? null;
  if (!view) return <p className="p-8 text-muted-foreground">This prototype has no views yet.</p>;

  return (
    <div className="flex min-h-0 flex-1">
      {sectionNavOpen && <PrototypeNav proto={proto} current={{ group, view }} />}
      <ProductView contributor={contributor} prototype={prototype} group={group} view={view} />
    </div>
  );
}
