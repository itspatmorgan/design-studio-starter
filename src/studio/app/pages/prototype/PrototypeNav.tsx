// Prototype navigation: the prototype's title, a filterable list of its views
// (groups as folders, with expand/collapse all), and About at the bottom.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { formatDate, viewLabel, viewLink } from '@/studio/app/data/manifest';
import type { Prototype, View } from '@/studio/app/data/types';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Cancel01Icon, CodeIcon, Search01Icon, UnfoldLessIcon, UnfoldMoreIcon } from '@hugeicons/core-free-icons';
import { Input } from '@/studio/components/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { ContributorAvatar } from '@/studio/app/shell/ContributorAvatar';
import { cn } from '@/lib/utils';

const row = 'mx-1 flex w-[calc(100%-8px)] min-w-0 items-center gap-1.5 rounded-md py-1 pr-1.5 text-[12px] leading-tight transition-colors';

function ViewLink({ proto, view, active, depth }: { proto: Prototype; view: View; active: boolean; depth: number }) {
  return (
    <Link
      {...viewLink(proto, view)}
      aria-current={active ? 'page' : undefined}
      style={{ paddingLeft: 8 + depth * 16 }}
      className={cn(row, active
        ? 'bg-sidebar-foreground/10 font-medium text-sidebar-accent-foreground'
        : 'text-muted-foreground hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground')}
    >
      <HugeiconsIcon icon={CodeIcon} size={14} className="shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate">{viewLabel(view.name)}</span>
    </Link>
  );
}

// A group is a collapsible folder of views. PrototypeNav owns which ones are open.
function GroupFolder({ name, open, onOpenChange, children }: { name: string; open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className={cn(row, 'pl-2 text-left font-medium text-sidebar-foreground hover:bg-sidebar-foreground/5')}>
        <HugeiconsIcon icon={ArrowDown01Icon} size={14} className={cn('shrink-0 text-muted-foreground transition-transform', !open && '-rotate-90')} />
        <span className="min-w-0 flex-1 truncate">{viewLabel(name)}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

// About: the prototype's meta.json, collapsed at the bottom of its navigation.
function About({ proto }: { proto: Prototype }) {
  const [open, setOpen] = useState(false);
  const labelClass = 'text-[11px] text-muted-foreground';
  const valueClass = 'mt-0.5 text-[12px] leading-snug text-sidebar-foreground';
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="shrink-0 border-t border-sidebar-border">
      <CollapsibleTrigger
        aria-label={open ? 'Collapse prototype info' : 'Expand prototype info'}
        className="flex h-9 w-full items-center gap-1.5 px-2.5 text-left hover:bg-sidebar-foreground/5"
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
                  <ContributorAvatar name={proto.contributor} />
                  <span className="truncate">{proto.contributor}</span>
                </dd>
              </div>
            )}
            {proto.created && (
              <div>
                <dt className={labelClass}>Created</dt>
                <dd className={valueClass}>{formatDate(proto.created)}</dd>
              </div>
            )}
          </dl>
          {proto.description && <p className="text-xs leading-relaxed text-muted-foreground">{proto.description}</p>}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

const iconButton = 'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground';

function IconButton({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<button type="button" aria-label={label} aria-pressed={pressed} onClick={onClick}
          className={cn(iconButton, pressed && 'bg-sidebar-foreground/10 text-sidebar-accent-foreground')} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

export default function PrototypeNav({ proto, current }: { proto: Prototype; current: View | undefined }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [closedGroups, setClosedGroups] = useState(() => new Set<string>());
  const filterRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (filterOpen) filterRef.current?.focus(); }, [filterOpen]);

  const q = filter.trim().toLowerCase();
  const views = q ? proto.views.filter((v) => `${viewLabel(v.name)} ${v.group ?? ''}`.toLowerCase().includes(q)) : proto.views;
  const groupsOf = (vs: View[]) => [...new Set(vs.flatMap((v) => (v.group ? [v.group] : [])))];
  const allGroups = groupsOf(proto.views);
  const groups = groupsOf(views);
  const isActive = (v: View) => v === current;
  // While filtering, every matching group shows open.
  const isOpen = (g: string) => Boolean(q) || !closedGroups.has(g);
  const allOpen = allGroups.every((g) => !closedGroups.has(g));
  const toggleAll = () => setClosedGroups(allOpen ? new Set(allGroups) : new Set());
  const setGroupOpen = (g: string, open: boolean) => setClosedGroups((prev) => {
    const next = new Set(prev);
    if (open) next.delete(g); else next.add(g);
    return next;
  });
  return (
    <aside aria-label="Prototype navigation" className="flex w-[220px] shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 px-2 pt-3">
        <p className="flex h-8 items-center truncate px-2.5 text-sm font-semibold leading-tight">{proto.title}</p>
      </div>
      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2 pt-3 pb-3">
        <div className="flex h-7 items-center justify-between gap-1 px-2.5 pr-0.5">
          <p className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-none">Views</p>
          <div className="flex items-center gap-0.5">
            <IconButton label="Filter views" pressed={filterOpen} onClick={() => setFilterOpen((o) => !o)}>
              <HugeiconsIcon icon={Search01Icon} size={14} />
            </IconButton>
            {allGroups.length > 0 && (
              <IconButton label={allOpen ? 'Collapse all' : 'Expand all'} onClick={toggleAll}>
                <HugeiconsIcon icon={allOpen ? UnfoldLessIcon : UnfoldMoreIcon} size={14} />
              </IconButton>
            )}
          </div>
        </div>
        {filterOpen && (
          <div className="relative px-1">
            <Input
              ref={filterRef}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Escape') return;
                e.preventDefault();
                if (filter) setFilter('');
                else setFilterOpen(false);
              }}
              placeholder="Filter views…"
              aria-label="Filter views"
              className={cn('h-8 border-sidebar-border bg-sidebar-accent text-[13px] shadow-none', filter && 'pr-8')}
            />
            {filter && (
              <button type="button" aria-label="Clear filter" onClick={() => setFilter('')}
                className="absolute top-1/2 right-3 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-sidebar-foreground">
                <HugeiconsIcon icon={Cancel01Icon} size={12} />
              </button>
            )}
          </div>
        )}
        <div className="space-y-1">
          {q && views.length === 0 && <p className="px-2.5 py-1 text-[12px] text-muted-foreground">No matching views.</p>}
          {views.filter((v) => !v.group).map((v) => (
            <ViewLink key={v.name} proto={proto} view={v} active={isActive(v)} depth={0} />
          ))}
          {groups.map((g) => (
            <GroupFolder key={g} name={g} open={isOpen(g)} onOpenChange={(open) => setGroupOpen(g, open)}>
              {views.filter((v) => v.group === g).map((v) => (
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
