// The prototype's files, in its navigation: a filterable tree with expand/collapse all.
//
// In `pnpm dev`, it's the prototype's real files and folders, live from the dev server
// (data/files.ts). Views open in the app; other files open in your editor. In your own
// prototypes you can also create, rename (F2), move (drag and drop), and delete (to the
// Trash) files and folders, like a file browser. Every change is a plain file change, so
// agents see the same thing. On the deployed site, it lists the prototype's views, from
// the manifest.
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon, Cancel01Icon, CodeIcon, Copy01Icon, Delete02Icon, File01Icon, FileAddIcon, FileEditIcon,
  Folder01Icon, FolderAddIcon, PencilEdit02Icon, Search01Icon, UnfoldLessIcon, UnfoldMoreIcon,
} from '@hugeicons/core-free-icons';
import { prototypeLink, setManifest, viewLabel, viewLink } from '@/studio/app/data/manifest';
import {
  fileOp, openInEditor, repoPath, revealInFinder, useFileTree, useMe, type FileNode, type FileOp,
} from '@/studio/app/data/files';
import type { Prototype, View } from '@/studio/app/data/types';
import { Button } from '@/studio/components/button';
import { Input } from '@/studio/components/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/studio/components/context-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';
import { cn } from '@/lib/utils';

const row = 'mx-1 flex w-[calc(100%-8px)] min-w-0 items-center gap-1.5 rounded-md py-1 pr-1.5 text-[12px] leading-tight transition-colors';
const indent = (depth: number) => ({ paddingLeft: 8 + depth * 16 });
const viewPath = (v: View) => `${v.group ? `${v.group}/` : ''}${v.name}`;
const parentOf = (p: string) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
const within = (p: string, dir: string) => p === dir || p.startsWith(`${dir}/`);

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

// A file name with its extension dimmed: "main" + ".tsx".
function FileName({ name }: { name: string }) {
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return <span className="min-w-0 flex-1 truncate">{name}</span>;
  return <span className="min-w-0 flex-1 truncate">{name.slice(0, dot)}<span className="text-muted-foreground/70">{name.slice(dot)}</span></span>;
}

// An inline name field, for renaming or creating. Enter or leaving the field saves; Escape cancels.
// The name is selected without its extension, like in Finder.
function NameInput({ initial, depth, onDone }: { initial: string; depth: number; onDone: (name: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  const finish = (name: string | null) => { if (!done.current) { done.current = true; onDone(name); } };
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const dot = initial.lastIndexOf('.');
    el.setSelectionRange(0, dot > 0 ? dot : initial.length);
  }, [initial]);
  return (
    <div style={indent(depth)} className="mx-1 py-0.5 pr-1.5">
      <Input
        ref={ref}
        defaultValue={initial}
        aria-label="Name"
        className="h-6 rounded-sm px-1.5 text-[12px] shadow-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); finish(e.currentTarget.value.trim()); }
          if (e.key === 'Escape') { e.preventDefault(); finish(null); }
        }}
        onBlur={(e) => finish(e.currentTarget.value.trim())}
      />
    </div>
  );
}

type Editing = { kind: 'rename'; path: string } | { kind: 'create'; parent: string; dir: boolean } | null;

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

export default function FileTree({ proto, current }: { proto: Prototype; current: View | undefined }) {
  const { files, reload } = useFileTree(proto);
  const me = useMe();
  const router = useRouter();
  const navigate = useNavigate();
  const live = import.meta.env.DEV && files !== null;
  const editable = live && me === proto.contributorKey;
  const nodes = files ?? viewsAsNodes(proto);
  const views = new Map(proto.views.map((v) => [viewPath(v), v]));

  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [closed, setClosed] = useState(() => new Set<string>());
  const [editing, setEditing] = useState<Editing>(null);
  const [confirmDelete, setConfirmDelete] = useState<FileNode | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (filterOpen) filterRef.current?.focus(); }, [filterOpen]);
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(t);
  }, [status]);

  const q = filter.trim().toLowerCase();
  const shown = q ? filterNodes(nodes, q) : nodes;
  const dirs = allDirs(nodes);
  // While filtering, every folder with a match shows open.
  const isOpen = (d: string) => Boolean(q) || !closed.has(d);
  const allOpen = dirs.every((d) => !closed.has(d));
  const setOpen = (d: string, open: boolean) => setClosed((prev) => {
    const next = new Set(prev);
    if (open) next.delete(d); else next.add(d);
    return next;
  });
  const noun = live ? 'files' : 'views';

  // Runs a change, then takes the new manifest. If it moved or removed the open view, go to
  // its new place (or the prototype's first view) first, so the old address is never reloaded.
  async function run(op: FileOp) {
    try {
      const result = await fileOp(proto, op);
      setManifest(result.manifest);
      const open = current && viewPath(current);
      if (open && (op.op === 'rename' || op.op === 'move' || op.op === 'delete') && within(open, op.path)) {
        const moved = result.path && `${result.path}${open.slice(op.path.length)}`;
        const next = moved && result.manifest.prototypes
          .find((p) => p.contributorKey === proto.contributorKey && p.id === proto.id)?.views
          .find((v) => viewPath(v) === moved);
        await navigate(next ? viewLink(proto, next) : prototypeLink(proto));
      }
      await router.invalidate();
      reload();
      if (result.trashedTo) setStatus({ text: `Moved to ${result.trashedTo}.` });
      return result;
    } catch (e) {
      setStatus({ text: (e as Error).message, error: true });
    }
  }

  const startCreate = (parent: string, dir: boolean) => {
    if (parent) setOpen(parent, true);
    setEditing({ kind: 'create', parent, dir });
  };

  // Drag and drop: drag a row onto a folder (or the empty space below the tree, for the top level).
  const dragProps = (node: FileNode) => (editable && node.path !== 'meta.json' ? {
    draggable: true,
    onDragStart: (e: DragEvent) => { e.dataTransfer.setData('application/x-studio-path', node.path); e.dataTransfer.effectAllowed = 'move'; },
    onDragEnd: () => setDropTarget(null),
  } : {});
  const dropProps = (folder: string) => (editable ? {
    onDragOver: (e: DragEvent) => {
      if (!e.dataTransfer.types.includes('application/x-studio-path')) return;
      e.preventDefault();
      e.stopPropagation();
      setDropTarget(folder);
    },
    onDragLeave: (e: DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null); },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDropTarget(null);
      const path = e.dataTransfer.getData('application/x-studio-path');
      if (path && parentOf(path) !== folder && !within(folder, path)) run({ op: 'move', path, to: folder });
    },
  } : {});

  // F2 renames, Delete (or ⌘⌫) moves to the Trash, on the focused row.
  const keyProps = (node: FileNode) => (editable && node.path !== 'meta.json' ? {
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); setEditing({ kind: 'rename', path: node.path }); }
      if (e.key === 'Delete' || (e.key === 'Backspace' && e.metaKey)) { e.preventDefault(); setConfirmDelete(node); }
    },
  } : {});

  // Called as functions, not rendered as components, so rows keep their identity across
  // renders (a drag in progress would be cancelled otherwise).
  // Menu actions run after the menu has closed, so a dialog or field they open isn't
  // dismissed by the same click.
  function rowMenu(key: string, node: FileNode, children: ReactNode) {
    // import.meta.env.DEV is false in the build, so the menu isn't in the deployed site.
    if (!import.meta.env.DEV || !live) return <div key={key}>{children}</div>;
    const changeable = editable && node.path !== 'meta.json';
    return (
      <ContextMenu key={key}>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="min-w-44">
          {node.dir && editable && (
            <>
              <ContextMenuItem onClick={() => setTimeout(() => startCreate(node.path, false))}><HugeiconsIcon icon={FileAddIcon} /> New file</ContextMenuItem>
              <ContextMenuItem onClick={() => setTimeout(() => startCreate(node.path, true))}><HugeiconsIcon icon={FolderAddIcon} /> New folder</ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          {!node.dir && (
            <ContextMenuItem onClick={() => setTimeout(() => openInEditor(proto, node.path))}><HugeiconsIcon icon={FileEditIcon} /> Open in editor</ContextMenuItem>
          )}
          {changeable && (
            <>
              <ContextMenuItem onClick={() => setTimeout(() => setEditing({ kind: 'rename', path: node.path }))}><HugeiconsIcon icon={PencilEdit02Icon} /> Rename</ContextMenuItem>
              <ContextMenuItem variant="destructive" onClick={() => setTimeout(() => setConfirmDelete(node))}><HugeiconsIcon icon={Delete02Icon} /> Delete</ContextMenuItem>
            </>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setTimeout(() => revealInFinder(proto, node.path))}><HugeiconsIcon icon={Folder01Icon} /> Reveal in Finder</ContextMenuItem>
          <ContextMenuItem onClick={() => setTimeout(() => navigator.clipboard.writeText(repoPath(proto, node.path)))}><HugeiconsIcon icon={Copy01Icon} /> Copy path</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // The new-file or new-folder field, at the top of the folder it's being created in.
  const createField = (parent: string, depth: number) =>
    editing?.kind === 'create' && editing.parent === parent && (
      <NameInput
        initial={editing.dir ? 'new-folder' : 'untitled.tsx'}
        depth={depth}
        onDone={(name) => {
          const { dir } = editing;
          setEditing(null);
          if (name) run({ op: 'create', path: parent, name, dir }).then((r) => {
            // A new view opens right away.
            const v = r?.path && r.manifest.prototypes.find((p) => p.contributorKey === proto.contributorKey && p.id === proto.id)?.views.find((x) => viewPath(x) === r.path);
            if (v) navigate(viewLink(proto, v));
          });
        }}
      />
    );

  function items(list: FileNode[], depth: number): ReactNode {
    return list.map((node) => {
      if (editing?.kind === 'rename' && editing.path === node.path) {
        return (
          <NameInput key={node.path} initial={node.name} depth={depth} onDone={(name) => {
            setEditing(null);
            if (name && name !== node.name) run({ op: 'rename', path: node.path, name });
          }} />
        );
      }
      if (node.dir) {
        const open = isOpen(node.path);
        return (
          <Collapsible key={node.path} open={open} onOpenChange={(o) => setOpen(node.path, o)}>
            <div {...dropProps(node.path)} className={cn('rounded-md', dropTarget === node.path && 'bg-sidebar-foreground/10')}>
              {rowMenu(node.path, node, (
                <CollapsibleTrigger {...dragProps(node)} {...keyProps(node)} style={indent(depth)}
                  className={cn(row, 'text-left font-medium text-sidebar-foreground hover:bg-sidebar-foreground/5')}>
                  <HugeiconsIcon icon={ArrowDown01Icon} size={14} className={cn('shrink-0 text-muted-foreground transition-transform', !open && '-rotate-90')} />
                  <span className="min-w-0 flex-1 truncate">{live ? node.name : viewLabel(node.name)}</span>
                </CollapsibleTrigger>
              ))}
              <CollapsibleContent>
                {createField(node.path, depth + 1)}
                {items(node.children ?? [], depth + 1)}
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      }
      const view = views.get(node.path);
      const label = live ? <FileName name={node.name} /> : <span className="min-w-0 flex-1 truncate">{viewLabel(node.name)}</span>;
      // Views open in the app.
      if (view) {
        const active = view === current;
        return (
          rowMenu(node.path, node, (
            <Link
              {...viewLink(proto, view)}
              {...dragProps(node)}
              {...keyProps(node)}
              aria-current={active ? 'page' : undefined}
              style={indent(depth)}
              className={cn(row, active
                ? 'bg-sidebar-foreground/10 font-medium text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground')}
            >
              <HugeiconsIcon icon={CodeIcon} size={14} className="shrink-0 text-muted-foreground" />
              {label}
            </Link>
          ))
        );
      }
      // Everything else (meta.json, components/, images) opens in your editor.
      return (
        rowMenu(node.path, node, (
          <button type="button" title="Open in editor" onClick={() => openInEditor(proto, node.path)}
            {...dragProps(node)} {...keyProps(node)} style={indent(depth)}
            className={cn(row, 'text-left text-muted-foreground hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground')}>
            <HugeiconsIcon icon={File01Icon} size={14} className="shrink-0 opacity-70" />
            {label}
          </button>
        ))
      );
    });
  }

  return (
    <nav className="flex min-h-0 flex-1 flex-col space-y-1.5 overflow-y-auto px-2 pt-3 pb-3">
      <div className="flex h-7 shrink-0 items-center justify-between gap-1 px-2.5 pr-0.5">
        <p className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-none">{live ? 'Files' : 'Views'}</p>
        <div className="flex items-center gap-0.5">
          {editable && (
            <>
              <IconButton label="New file" onClick={() => startCreate('', false)}><HugeiconsIcon icon={FileAddIcon} size={14} /></IconButton>
              <IconButton label="New folder" onClick={() => startCreate('', true)}><HugeiconsIcon icon={FolderAddIcon} size={14} /></IconButton>
            </>
          )}
          <IconButton label={`Filter ${noun}`} pressed={filterOpen} onClick={() => setFilterOpen((o) => !o)}>
            <HugeiconsIcon icon={Search01Icon} size={14} />
          </IconButton>
          {dirs.length > 0 && (
            <IconButton label={allOpen ? 'Collapse all' : 'Expand all'} onClick={() => setClosed(allOpen ? new Set(dirs) : new Set())}>
              <HugeiconsIcon icon={allOpen ? UnfoldLessIcon : UnfoldMoreIcon} size={14} />
            </IconButton>
          )}
        </div>
      </div>
      {filterOpen && (
        <div className="relative shrink-0 px-1">
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
      {status && (
        <p role="status" className={cn('shrink-0 px-2.5 text-[12px] leading-snug', status.error ? 'text-destructive' : 'text-muted-foreground')}>{status.text}</p>
      )}
      {/* The whole list is the drop target for the top level. */}
      <div {...dropProps('')} className={cn('min-h-0 flex-1 space-y-1 rounded-md', dropTarget === '' && 'bg-sidebar-foreground/5')}>
        {q && shown.length === 0 && <p className="px-2.5 py-1 text-[12px] text-muted-foreground">No matching {noun}.</p>}
        {createField('', 0)}
        {items(shown, 0)}
      </div>

      <Dialog open={confirmDelete !== null} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete {confirmDelete?.name}?</DialogTitle>
            <DialogDescription>
              {confirmDelete?.dir ? 'The folder and everything in it go' : 'It goes'} to the Trash, so you can put it back from there.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              const node = confirmDelete;
              setConfirmDelete(null);
              if (node) run({ op: 'delete', path: node.path });
            }}>Move to Trash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
