// The prototype's files, in its navigation: a filterable tree with expand/collapse all, and a
// button that switches the open item between its page and its source (SourcePane.tsx).
//
// In `pnpm dev`, it's the prototype's real files and folders, live from the dev server
// (data/files.ts). It shows what you open and organize: items (views, at any depth; see
// src/studio/fileTypes/) and their folders. Everything else in the folder (meta.json, which the header
// edits; components/ helpers; images and other files) is hidden until you choose Show all
// files (in the header's … menu), and then opens in your editor. In your own prototypes you can also create, rename (F2), move
// (drag and drop), and delete (to the Trash) files and folders, like a file browser, and
// choose which item the prototype opens on (Set as start; it shows a star). Every change
// is a plain file change, so agents see the same thing. On the deployed site, it lists the
// prototype's items, from the manifest.
import { useEffect, useImperativeHandle, useRef, useState, type DragEvent, type ReactNode, type Ref } from 'react';
import { Link, useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon, Cancel01Icon, CodeIcon, Copy01Icon, Delete02Icon, File01Icon, FileEditIcon, Link01Icon,
  Folder01Icon, FolderAddIcon, StarIcon, SourceCodeIcon, BrowserIcon, PencilEdit02Icon, Search01Icon, UnfoldLessIcon, UnfoldMoreIcon,
} from '@hugeicons/core-free-icons';
import { firstItem, itemLabel, itemLink, itemSlug, prototypeLink, setManifest } from '@/studio/app/data/manifest';
import {
  fileOp, openInEditor, repoPath, revealInFinder, useFileTree, useMe, type FileNode, type FileOp,
} from '@/studio/app/data/files';
import type { Item, Manifest, Prototype } from '@/studio/app/data/types';
import { HELPER_FOLDER } from '@/studio/fileTypes';
import { itemUrl } from '@/studio/app/items/itemLinks';
import { creatableTypes, FILE_TYPES, fileTypeModules } from '@/studio/app/data/fileTypes';
import { useShowAllFiles } from '@/studio/app/shell/appPrefs';
import { Button } from '@/studio/components/button';
import { Input } from '@/studio/components/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { toast } from '@/studio/components/toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/studio/components/context-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';
import { cn } from '@/lib/utils';

const row = 'mx-1 flex w-[calc(100%-8px)] min-w-0 items-center gap-1.5 rounded-md py-1 pr-1.5 text-[12px] leading-tight transition-colors';
const indent = (depth: number) => ({ paddingLeft: 8 + depth * 16 });
const parentOf = (p: string) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
const within = (p: string, dir: string) => p === dir || p.startsWith(`${dir}/`);

// The deployed site has no dev server, so the tree is the prototype's items, from the
// manifest, with their folders.
function itemsAsNodes(proto: Prototype): FileNode[] {
  const root: FileNode[] = [];
  for (const item of proto.items) {
    const parts = item.path.split('/');
    let level = root;
    parts.slice(0, -1).forEach((name, i) => {
      const path = parts.slice(0, i + 1).join('/');
      let folder = level.find((n) => n.dir && n.path === path);
      if (!folder) { folder = { name, path, dir: true, children: [] }; level.push(folder); }
      level = folder.children!;
    });
    level.push({ name: parts.at(-1)!, path: item.path, dir: false });
  }
  // Files first, then folders, like the dev server's tree (the manifest is already in order).
  const order = (nodes: FileNode[]): FileNode[] => [...nodes.filter((n) => !n.dir), ...nodes.filter((n) => n.dir).map((n) => ({ ...n, children: order(n.children ?? []) }))];
  return order(root);
}

// The items of a prototype in a manifest.
const itemsOf = (m: Manifest, p: Prototype) => m.prototypes.find((x) => x.contributorKey === p.contributorKey && x.id === p.id)?.items ?? [];

// While filtering, keep files whose name matches, and folders with a match inside.
function filterNodes(nodes: FileNode[], q: string): FileNode[] {
  return nodes.flatMap((n) => {
    if (!n.dir) return n.name.toLowerCase().includes(q) || itemLabel(n.name).toLowerCase().includes(q) ? [n] : [];
    const children = filterNodes(n.children ?? [], q);
    return children.length || n.name.toLowerCase().includes(q) ? [{ ...n, children }] : [];
  });
}

// What the nav shows by default: items, folders with an item inside, and empty folders (you
// made those to organize, so they stay). Helpers, meta.json, and assets are hidden.
function visibleNodes(nodes: FileNode[], items: Map<string, Item>): FileNode[] {
  return nodes.flatMap((n) => {
    if (!n.dir) return items.has(n.path) ? [n] : [];
    if (n.name === HELPER_FOLDER) return [];
    const children = visibleNodes(n.children ?? [], items);
    return children.length || !n.children?.length ? [{ ...n, children }] : [];
  });
}

// The files inside a folder the nav isn't showing, for the delete confirmation.
function hiddenInside(node: FileNode, items: Map<string, Item>): string[] {
  const all = (n: FileNode): string[] => (n.dir ? (n.children ?? []).flatMap(all) : [n.path]);
  return all(node).filter((p) => !items.has(p)).map((p) => p.slice(node.path.length + 1));
}

const findNode = (nodes: FileNode[], path: string): FileNode | undefined =>
  nodes.map((n) => (n.path === path ? n : n.dir ? findNode(n.children ?? [], path) : undefined)).find(Boolean);

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

// What "+" makes: a folder, or a file of a type (its id, like "view" or "document").
type NewTarget = 'folder' | string;

type Editing = { kind: 'rename'; path: string } | { kind: 'create'; parent: string; target: NewTarget } | null;

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

// What the prototype's header can ask of the tree: its "+" menu creates at the top level.
export type FileTreeHandle = { startCreate: (parent: string, target: NewTarget) => void };

type FileTreeProps = { proto: Prototype; current: Item | undefined; handle?: Ref<FileTreeHandle> };

export default function FileTree({ proto, current, handle }: FileTreeProps) {
  const { files, reload } = useFileTree(proto);
  const me = useMe();
  const router = useRouter();
  const navigate = useNavigate();
  const live = import.meta.env.DEV && files !== null;
  const editable = live && me === proto.contributorKey;
  const items = new Map(proto.items.map((i) => [i.path, i]));
  // Switched in the header's "…" menu, and remembered for every prototype.
  const [showAll] = useShowAllFiles();
  // The open item's Source view (?mode=source, SourcePane.tsx), for types that have source.
  const { mode } = useSearch({ strict: false }) as { mode?: 'source' };
  const hasSource = live && Boolean(current && FILE_TYPES[current.fileType]?.language);
  const sourceOn = hasSource && mode === 'source';
  const toggleSource = () => navigate({ to: '.', search: ((prev: object) => ({ ...prev, mode: sourceOn ? undefined : 'source' })) as never });
  const nodes = !files ? itemsAsNodes(proto) : showAll ? files : visibleNodes(files, items);
  // The item the prototype opens on: its start, or its first item. It gets a star.
  const opensOn = firstItem(proto);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [closed, setClosed] = useState(() => new Set<string>());
  const [editing, setEditing] = useState<Editing>(null);
  const [confirmDelete, setConfirmDelete] = useState<FileNode | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (filterOpen) filterRef.current?.focus(); }, [filterOpen]);

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
  const noun = live ? 'files' : 'pages';

  // Runs a change, then takes the new manifest. If it moved or removed the open view, go to
  // its new place (or the prototype's first view) first, so the old address is never reloaded.
  async function run(op: FileOp) {
    // What a delete removed, named the way the tree shows it, for the message after.
    const base = 'path' in op ? op.path.split('/').pop() ?? '' : '';
    const deleted = op.op === 'delete' ? (findNode(files ?? [], op.path)?.dir || items.has(op.path) ? itemLabel(base) : base) : '';
    try {
      const result = await fileOp(proto, op);
      setManifest(result.manifest);
      const open = current?.path;
      if (open && (op.op === 'rename' || op.op === 'move' || op.op === 'delete') && within(open, op.path)) {
        const moved = result.path && `${result.path}${open.slice(op.path.length)}`;
        const next = moved && itemsOf(result.manifest, proto).find((i) => i.path === moved);
        await navigate(next ? itemLink(proto, next) : prototypeLink(proto));
      }
      await router.invalidate();
      reload();
      if (result.trashedTo) {
        toast.add({ title: `Moved “${deleted}” to ${result.trashedTo === 'the Trash' ? 'the Trash' : `${result.trashedTo} (no Trash on this computer)`}` });
      }
      return result;
    } catch (e) {
      const message = (e as Error).message;
      // The name may belong to a file the nav is hiding.
      const clash = message.match(/“(.+?)”/)?.[1];
      const named = (list: FileNode[], name: string): boolean => list.some((n) => n.name === name || named(n.children ?? [], name));
      const hint = clash && files && named(files, clash) && !named(nodes, clash) ? " It's hidden: choose Show all files in the … menu." : '';
      toast.add({ type: 'error', title: message + hint });
    }
  }

  const startCreate = (parent: string, target: NewTarget) => {
    if (parent) setOpen(parent, true);
    setEditing({ kind: 'create', parent, target });
  };
  useImperativeHandle(handle, () => ({ startCreate }));

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
              {creatableTypes.map((t) => (
                <ContextMenuItem key={t.id} onClick={() => setTimeout(() => startCreate(node.path, t.id))}><HugeiconsIcon icon={t.icon} /> New {t.label.toLowerCase()}</ContextMenuItem>
              ))}
              <ContextMenuItem onClick={() => setTimeout(() => startCreate(node.path, 'folder'))}><HugeiconsIcon icon={FolderAddIcon} /> New folder</ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          {!node.dir && (
            <ContextMenuItem onClick={() => setTimeout(() => openInEditor(proto, node.path))}><HugeiconsIcon icon={FileEditIcon} /> Open in editor</ContextMenuItem>
          )}
          {items.has(node.path) && (
            <ContextMenuItem onClick={() => setTimeout(() => { navigator.clipboard.writeText(itemUrl(proto, proto.items.find((i) => i.path === node.path)!)); toast.add({ title: 'Link copied' }); })}><HugeiconsIcon icon={Link01Icon} /> Copy link</ContextMenuItem>
          )}
          {editable && items.has(node.path) && (
            proto.start === node.path
              ? <ContextMenuItem onClick={() => setTimeout(() => run({ op: 'meta', start: '' }))}><HugeiconsIcon icon={StarIcon} /> Remove as start</ContextMenuItem>
              : opensOn?.path !== node.path && <ContextMenuItem onClick={() => setTimeout(() => run({ op: 'meta', start: itemSlug(node.path) }))}><HugeiconsIcon icon={StarIcon} /> Set as start</ContextMenuItem>
          )}
          {changeable && (
            <>
              <ContextMenuItem onClick={() => setTimeout(() => setEditing({ kind: 'rename', path: node.path }))}><HugeiconsIcon icon={PencilEdit02Icon} /> Rename</ContextMenuItem>
              <ContextMenuItem variant="destructive" onClick={() => setTimeout(() => setConfirmDelete(node))}><HugeiconsIcon icon={Delete02Icon} /> Delete</ContextMenuItem>
            </>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setTimeout(() => revealInFinder(proto, node.path))}><HugeiconsIcon icon={Folder01Icon} /> Reveal in Finder</ContextMenuItem>
          <ContextMenuItem onClick={() => setTimeout(() => { navigator.clipboard.writeText(repoPath(proto, node.path)); toast.add({ title: 'Path copied' }); })}><HugeiconsIcon icon={Copy01Icon} /> Copy path</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // The new-file or new-folder field, at the top of the folder it's being created in. A new
  // file starts with its type's extension, and gets it back if you delete it from the name.
  const createField = (parent: string, depth: number) => {
    if (editing?.kind !== 'create' || editing.parent !== parent) return null;
    const { target } = editing;
    const dir = target === 'folder';
    const extension = FILE_TYPES[target]?.extensions[0] ?? '';
    return (
      <NameInput
        initial={dir ? 'new-folder' : `untitled${extension}`}
        depth={depth}
        onDone={(name) => {
          setEditing(null);
          if (!name) return;
          const fileName = dir || name.lastIndexOf('.') > 0 ? name : name + extension;
          run({ op: 'create', path: parent, name: fileName, dir }).then((r) => {
            // A new item opens right away.
            const item = r?.path && itemsOf(r.manifest, proto).find((i) => i.path === r.path);
            if (item) navigate(itemLink(proto, item));
          });
        }}
      />
    );
  };

  function rows(list: FileNode[], depth: number): ReactNode {
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
                  <span className="min-w-0 flex-1 truncate" title={live ? node.name : undefined}>{itemLabel(node.name)}</span>
                </CollapsibleTrigger>
              ))}
              <CollapsibleContent>
                {createField(node.path, depth + 1)}
                {rows(node.children ?? [], depth + 1)}
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      }
      const item = items.get(node.path);
      // Items and folders show readable names ("user-settings.tsx" → "User Settings"), like the
      // rest of the app; the file name is in the tooltip and the rename field. Other files, shown
      // with Show all files (in the header's … menu), keep their real names, since they open in your editor.
      const label = item
        ? <span className="min-w-0 flex-1 truncate" title={live ? node.name : undefined}>{itemLabel(node.name)}</span>
        : <FileName name={node.name} />;
      // Items open in the app.
      if (item) {
        const active = item === current;
        return (
          rowMenu(node.path, node, (
            <Link
              {...itemLink(proto, item)}
              search={(prev: { mode?: 'source' }) => ({ mode: prev.mode })} // stay in Source view while moving between items
              {...dragProps(node)}
              {...keyProps(node)}
              aria-current={active ? 'page' : undefined}
              style={indent(depth)}
              className={cn(row, active
                ? 'bg-sidebar-foreground/10 font-medium text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground')}
            >
              <HugeiconsIcon icon={fileTypeModules[item.fileType]?.icon ?? CodeIcon} size={14} className="shrink-0 text-muted-foreground" />
              {label}
              {item === opensOn && (
                <span title="The prototype opens on this" className="shrink-0 text-muted-foreground">
                  <HugeiconsIcon icon={StarIcon} size={12} aria-label="Opens first" />
                </span>
              )}
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
    <nav className="group/tree flex min-h-0 flex-1 flex-col space-y-1.5 overflow-y-auto px-2 pt-3 pb-3">
      <div className="flex h-7 shrink-0 items-center justify-between gap-1 px-2.5 pr-0.5">
        <p className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-none">{live ? 'Files' : 'Pages'}</p>
        {/* Shown while the pointer is over the list or focus is in it, so the heading stays quiet. */}
        <div className={cn('flex items-center gap-0.5 transition-opacity', !filterOpen && !sourceOn && 'opacity-0 group-hover/tree:opacity-100 group-focus-within/tree:opacity-100')}>
          <IconButton label={`Filter ${noun}`} pressed={filterOpen} onClick={() => setFilterOpen((o) => !o)}>
            <HugeiconsIcon icon={Search01Icon} size={14} />
          </IconButton>
          {hasSource && (
            <IconButton label={sourceOn ? 'Show preview' : 'Show source'} onClick={toggleSource}>
              <HugeiconsIcon icon={sourceOn ? BrowserIcon : SourceCodeIcon} size={14} />
            </IconButton>
          )}
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
      {/* The whole list is the drop target for the top level. */}
      <div {...dropProps('')} className={cn('min-h-0 flex-1 space-y-1 rounded-md', dropTarget === '' && 'bg-sidebar-foreground/5')}>
        {q && shown.length === 0 && <p className="px-2.5 py-1 text-[12px] text-muted-foreground">No matching {noun}.</p>}
        {createField('', 0)}
        {rows(shown, 0)}
      </div>

      <Dialog open={confirmDelete !== null} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete “{confirmDelete && (confirmDelete.dir || items.has(confirmDelete.path) ? itemLabel(confirmDelete.name) : confirmDelete.name)}”?</DialogTitle>
            <DialogDescription>
              {confirmDelete?.dir ? 'The folder and everything in it move' : 'It moves'} to the Trash, where you can restore it.
              {confirmDelete?.dir && !showAll && (() => {
                const full = findNode(files ?? [], confirmDelete.path);
                const hidden = full ? hiddenInside(full, items) : [];
                if (!hidden.length) return null;
                const names = [...new Set(hidden.map((p) => (p.includes('/') ? `${p.split('/')[0]}/` : p)))];
                return ` This includes ${hidden.length} ${hidden.length === 1 ? 'file' : 'files'} not shown in the nav: ${names.slice(0, 3).join(', ')}${names.length > 3 ? ', …' : ''}.`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              const node = confirmDelete;
              setConfirmDelete(null);
              if (node) run({ op: 'delete', path: node.path });
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
