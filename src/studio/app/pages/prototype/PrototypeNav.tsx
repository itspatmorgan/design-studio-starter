// Prototype navigation: the prototype's title, a filterable tree, and About at the bottom.
// Drag the right edge to resize it.
//
// In `pnpm dev`, the tree is the prototype's real files and folders, live from the dev server
// (data/files.ts): views open in the app, and other files open in your editor. Right-click any
// row for more. On the deployed site, it lists the prototype's views, from the manifest.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { formatDate, viewLabel, viewLink } from '@/studio/app/data/manifest';
import { openInEditor, repoPath, revealInFinder, useFileTree, type FileNode } from '@/studio/app/data/files';
import type { Prototype, View } from '@/studio/app/data/types';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Cancel01Icon, CodeIcon, Copy01Icon, File01Icon, FileEditIcon, Folder01Icon, Search01Icon, UnfoldLessIcon, UnfoldMoreIcon } from '@hugeicons/core-free-icons';
import { Input } from '@/studio/components/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/studio/components/context-menu';
import { ContributorAvatar } from '@/studio/app/shell/ContributorAvatar';
import { NAV_WIDTH, useSectionNavWidth } from '@/studio/app/shell/appPrefs';
import { cn } from '@/lib/utils';

const row = 'mx-1 flex w-[calc(100%-8px)] min-w-0 items-center gap-1.5 rounded-md py-1 pr-1.5 text-[12px] leading-tight transition-colors';

const indent = (depth: number) => ({ paddingLeft: 8 + depth * 16 });
const viewPath = (v: View) => `${v.group ? `${v.group}/` : ''}${v.name}`;

// The deployed site has no dev server, so the tree is the prototype's views, from the manifest.
function viewsAsNodes(proto: Prototype): FileNode[] {
  const top = proto.views.filter((v) => !v.group).map((v) => ({ name: v.name, path: v.name, dir: false }));
  const groups = [...new Set(proto.views.flatMap((v) => (v.group ? [v.group] : [])))];
  return [...top, ...groups.map((g) => ({
    name: g, path: g, dir: true,
    children: proto.views.filter((v) => v.group === g).map((v) => ({ name: v.name, path: viewPath(v), dir: false })),
  }))];
}

// While filtering, keep files whose name matches, and folders with a match inside.
function filterNodes(nodes: FileNode[], q: string): FileNode[] {
  return nodes.flatMap((n) => {
    if (!n.dir) return n.name.toLowerCase().includes(q) || viewLabel(n.name).toLowerCase().includes(q) ? [n] : [];
    const children = filterNodes(n.children ?? [], q);
    return children.length || n.name.toLowerCase().includes(q) ? [{ ...n, children }] : [];
  });
}

const allDirs = (nodes: FileNode[]): string[] => nodes.flatMap((n) => (n.dir ? [n.path, ...allDirs(n.children ?? [])] : []));

type TreeProps = {
  proto: Prototype;
  views: Map<string, View>;
  current: View | undefined;
  live: boolean;                 // real files (dev) rather than views (deployed)
  isOpen: (dir: string) => boolean;
  setOpen: (dir: string, open: boolean) => void;
};

// Right-click menu for a row, in dev.
function RowMenu({ proto, node, live, children }: { proto: Prototype; node: FileNode; live: boolean; children: ReactNode }) {
  if (!live) return <>{children}</>;
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-44">
        {!node.dir && (
          <ContextMenuItem onClick={() => openInEditor(proto, node.path)}>
            <HugeiconsIcon icon={FileEditIcon} /> Open in editor
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => revealInFinder(proto, node.path)}>
          <HugeiconsIcon icon={Folder01Icon} /> Reveal in Finder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(repoPath(proto, node.path))}>
          <HugeiconsIcon icon={Copy01Icon} /> Copy path
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// A file name with its extension dimmed: "main" + ".tsx".
function FileName({ name }: { name: string }) {
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return <span className="min-w-0 flex-1 truncate">{name}</span>;
  return <span className="min-w-0 flex-1 truncate">{name.slice(0, dot)}<span className="text-muted-foreground/70">{name.slice(dot)}</span></span>;
}

function TreeItems({ nodes, depth, ...tree }: TreeProps & { nodes: FileNode[]; depth: number }) {
  const { proto, views, current, live, isOpen, setOpen } = tree;
  return nodes.map((node) => {
    if (node.dir) {
      const open = isOpen(node.path);
      return (
        <Collapsible key={node.path} open={open} onOpenChange={(o) => setOpen(node.path, o)}>
          <RowMenu proto={proto} node={node} live={live}>
            <CollapsibleTrigger style={indent(depth)} className={cn(row, 'text-left font-medium text-sidebar-foreground hover:bg-sidebar-foreground/5')}>
              <HugeiconsIcon icon={ArrowDown01Icon} size={14} className={cn('shrink-0 text-muted-foreground transition-transform', !open && '-rotate-90')} />
              <span className="min-w-0 flex-1 truncate">{live ? node.name : viewLabel(node.name)}</span>
            </CollapsibleTrigger>
          </RowMenu>
          <CollapsibleContent>
            <TreeItems nodes={node.children ?? []} depth={depth + 1} {...tree} />
          </CollapsibleContent>
        </Collapsible>
      );
    }
    const view = views.get(node.path);
    const label = live ? <FileName name={node.name} /> : <span className="min-w-0 flex-1 truncate">{viewLabel(node.name)}</span>;
    // Views open in the app.
    if (view) {
      const active = view === current;
      return (
        <RowMenu key={node.path} proto={proto} node={node} live={live}>
          <Link
            {...viewLink(proto, view)}
            aria-current={active ? 'page' : undefined}
            style={indent(depth)}
            className={cn(row, active
              ? 'bg-sidebar-foreground/10 font-medium text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/80 hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground')}
          >
            <HugeiconsIcon icon={CodeIcon} size={14} className="shrink-0 text-muted-foreground" />
            {label}
          </Link>
        </RowMenu>
      );
    }
    // Everything else (meta.json, components/, images) opens in your editor.
    return (
      <RowMenu key={node.path} proto={proto} node={node} live={live}>
        <button type="button" title="Open in editor" onClick={() => openInEditor(proto, node.path)} style={indent(depth)}
          className={cn(row, 'text-left text-muted-foreground hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground')}>
          <HugeiconsIcon icon={File01Icon} size={14} className="shrink-0 opacity-70" />
          {label}
        </button>
      </RowMenu>
    );
  });
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

  const files = useFileTree(proto);
  const live = files !== null;
  const nodes = files ?? viewsAsNodes(proto);
  const views = new Map(proto.views.map((v) => [viewPath(v), v]));
  const q = filter.trim().toLowerCase();
  const shown = q ? filterNodes(nodes, q) : nodes;
  const dirs = allDirs(nodes);
  // While filtering, every folder with a match shows open.
  const isOpen = (d: string) => Boolean(q) || !closedGroups.has(d);
  const allOpen = dirs.every((d) => !closedGroups.has(d));
  const toggleAll = () => setClosedGroups(allOpen ? new Set(dirs) : new Set());
  const setOpen = (d: string, open: boolean) => setClosedGroups((prev) => {
    const next = new Set(prev);
    if (open) next.delete(d); else next.add(d);
    return next;
  });
  const noun = live ? 'files' : 'views';
  const { width, resizing, handleProps } = useSectionNavWidth();
  return (
    <aside aria-label="Prototype navigation" style={{ width }} className="relative flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 px-2 pt-3">
        <p className="flex h-8 items-center truncate px-2.5 text-sm font-semibold leading-tight">{proto.title}</p>
      </div>
      <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2 pt-3 pb-3">
        <div className="flex h-7 items-center justify-between gap-1 px-2.5 pr-0.5">
          <p className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-none">{live ? 'Files' : 'Views'}</p>
          <div className="flex items-center gap-0.5">
            <IconButton label={`Filter ${noun}`} pressed={filterOpen} onClick={() => setFilterOpen((o) => !o)}>
              <HugeiconsIcon icon={Search01Icon} size={14} />
            </IconButton>
            {dirs.length > 0 && (
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
              placeholder={`Filter ${noun}…`}
              aria-label={`Filter ${noun}`}
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
          {q && shown.length === 0 && <p className="px-2.5 py-1 text-[12px] text-muted-foreground">No matching {noun}.</p>}
          <TreeItems nodes={shown} depth={0} proto={proto} views={views} current={current} live={live} isOpen={isOpen} setOpen={setOpen} />
        </div>
      </nav>
      <About proto={proto} />
      {/* The resize handle: a thin strip over the right border that highlights on hover. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize prototype navigation"
        aria-valuenow={width}
        aria-valuemin={NAV_WIDTH.min}
        aria-valuemax={NAV_WIDTH.max}
        title="Drag to resize. Double-click to reset."
        tabIndex={0}
        {...handleProps}
        className={cn(
          'absolute inset-y-0 right-0 z-20 w-1.5 cursor-col-resize touch-none',
          'after:absolute after:inset-y-0 after:right-0 after:w-px after:transition-colors',
          'hover:after:bg-sidebar-ring focus-visible:outline-none focus-visible:after:bg-sidebar-ring',
          resizing && 'after:bg-sidebar-ring',
        )}
      />
    </aside>
  );
}
