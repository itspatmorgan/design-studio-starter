// The top of the prototype navigation: everything about the prototype, in one place.
// Its title and a "…" menu (also on right-click). Making new things is in the file tree below.
// Who made it, when, and its description are occasional reference, so they stay hidden until
// you choose Show details.
//
// In dev, on your own prototypes, the "…" menu can edit its
// info or delete it, and double-clicking the title renames it in place. Everywhere else, the
// "…" menu copies its link and shows details.
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive02Icon, InformationCircleIcon, MoreHorizontalIcon, ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { useShowAllFiles } from '@/studio/app/shell/appPrefs';
import { formatDate } from '@/studio/app/data/manifest';
import type { Prototype } from '@/studio/app/data/types';
import { ContributorAvatar } from '@/studio/app/shell/ContributorAvatar';
import { Input } from '@/studio/components/input';
import { toast } from '@/studio/components/toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/studio/components/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/studio/components/dropdown-menu';
import { useRenamePrototype } from '@/studio/app/pages/prototype/useRenamePrototype';
import { usePrototypeActions, type Action } from '@/studio/app/pages/prototype/usePrototypeActions';
import { NavHeader } from '@/studio/app/shell/nav';
import { menuGroups } from '@/studio/app/shell/menuGroups';
import { cn } from '@/lib/utils';

const INFO_KEY = 'design-studio:prototype-info'; // "shown" | "hidden"

// The title, renamed in place: Enter or leaving the field saves, Escape cancels.
function TitleInput({ initial, onDone }: { initial: string; onDone: (title: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  const finish = (t: string | null) => { if (!done.current) { done.current = true; onDone(t); } };
  useEffect(() => { ref.current?.select(); }, []);
  return (
    <Input
      ref={ref}
      defaultValue={initial}
      aria-label="Prototype title"
      className="h-7 rounded-sm px-1.5 text-sm font-semibold shadow-none"
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); finish(e.currentTarget.value.trim()); }
        if (e.key === 'Escape') { e.preventDefault(); finish(null); }
      }}
      onBlur={(e) => finish(e.currentTarget.value.trim())}
    />
  );
}

export default function PrototypeHeader({ proto }: { proto: Prototype }) {
  const applyRename = useRenamePrototype(proto);
  const actions = usePrototypeActions(proto);
  const { local, editable } = actions;
  const [renaming, setRenaming] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Shown or hidden for every prototype, and remembered.
  const [showInfo, setShowInfo] = useState(() => localStorage.getItem(INFO_KEY) === 'shown');
  const toggleInfo = () => setShowInfo((v) => { localStorage.setItem(INFO_KEY, v ? 'hidden' : 'shown'); return !v; });
  const [showAll, toggleShowAll] = useShowAllFiles();

  async function rename(title: string | null) {
    setRenaming(false);
    if (!title || title === proto.title) return;
    try {
      await applyRename({ title });
    } catch (e) {
      toast.add({ type: 'error', title: (e as Error).message });
    }
  }

  // Groups, in this order, with a line between them (the file menu follows the same rule, FileTree.tsx):
  // how this panel looks; reach the prototype (open it elsewhere, then copy where it is); change it;
  // delete it, last and alone. A group with nothing in it leaves no line. The last three are shared
  // with the prototype's card (usePrototypeActions.ts).
  const [reach, change, remove] = actions.groups;
  const groups = menuGroups<Action>([
    [
      { label: showInfo ? 'Hide details' : 'Show details', icon: InformationCircleIcon, onSelect: toggleInfo },
      local && { label: showAll ? 'Hide other files' : 'Show all files', icon: showAll ? ViewOffSlashIcon : ViewIcon, onSelect: toggleShowAll },
    ],
    reach,
    change,
    remove,
  ]);
  // Actions run after the menu has closed, so a dialog they open isn't closed by the same click.
  const menuItems = (Item: typeof DropdownMenuItem | typeof ContextMenuItem, Separator: typeof DropdownMenuSeparator) =>
    groups.map((group, g) => (
      <Fragment key={g}>
        {g > 0 && <Separator />}
        {group.map((a) => <Item key={a.label} variant={a.destructive ? 'destructive' : 'default'} onClick={() => setTimeout(a.onSelect)}><HugeiconsIcon icon={a.icon} /> {a.label}</Item>)}
      </Fragment>
    ));

  // Right-click anywhere on the header opens the same menu, in dev.
  const withContextMenu = (children: ReactNode) => (!local ? children : (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-44">{menuItems(ContextMenuItem, ContextMenuSeparator)}</ContextMenuContent>
    </ContextMenu>
  ));

  return (
    <NavHeader className={showInfo ? 'border-b border-sidebar-border pb-3' : 'pb-0'}>
      {withContextMenu(
        <div className="pl-3 pr-2.5">
          <div className="-mr-2 flex min-h-8 items-center gap-0.5">
            {renaming ? (
              <div className="min-w-0 flex-1"><TitleInput initial={proto.title} onDone={rename} /></div>
            ) : (
              <h2
                className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight"
                title={editable ? 'Double-click to rename' : proto.title}
                onDoubleClick={editable ? () => setRenaming(true) : undefined}
              >
                {proto.title}
              </h2>
            )}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger
                  render={<DropdownMenuTrigger
                    aria-label="Prototype actions"
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground"
                  />}
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} size={14} />
                </TooltipTrigger>
                <TooltipContent side="bottom">Prototype actions</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="min-w-44">{menuItems(DropdownMenuItem, DropdownMenuSeparator)}</DropdownMenuContent>
            </DropdownMenu>
          </div>
          {proto.status === 'archived' && (
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground" title="The deployed site leaves this prototype out">
              <HugeiconsIcon icon={Archive02Icon} size={12} /> Archived
            </p>
          )}
          {showInfo && (proto.contributor || proto.created) && (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] text-muted-foreground">
              {proto.contributor && <ContributorAvatar name={proto.contributor} />}
              <span className="truncate" title={proto.contributor}>{[proto.contributor.split(' ')[0], formatDate(proto.created)].filter(Boolean).join(' · ')}</span>
            </p>
          )}
          {showInfo && proto.description && (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((x) => !x)}
              className={cn('mt-2 block w-full rounded-sm text-left text-[12px] leading-relaxed text-muted-foreground outline-none hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring', !expanded && 'line-clamp-2')}
            >
              {proto.description}
            </button>
          )}
        </div>,
      )}
      {actions.dialogs}
    </NavHeader>
  );
}
