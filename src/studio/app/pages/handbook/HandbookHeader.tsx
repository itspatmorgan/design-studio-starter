// The top of a Handbook section's navigation: the Handbook's sections as tabs, and a "+" menu for
// making what the open section holds. (A prototype's header, with its menus for editing, is
// PrototypeHeader.tsx.) The tree below is the section's files, so what you add is that section's kind of file.
import { Link, getRouteApi } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, File01Icon, FolderAddIcon, MagicWand01Icon } from '@hugeicons/core-free-icons';
import type { Prototype } from '@/studio/app/data/types';
import { prototypeLink } from '@/studio/app/data/manifest';
import { creatableIn, type NewKind } from '@/studio/handbookRules';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/studio/components/dropdown-menu';
import { cn } from '@/lib/utils';

const rootApi = getRouteApi('__root__');

// What each kind of "New" is called, and how it looks in a menu.
export const NEW_KINDS: Record<NewKind, { label: string; icon: typeof File01Icon }> = {
  document: { label: 'New document', icon: File01Icon },
  folder: { label: 'New folder', icon: FolderAddIcon },
  skill: { label: 'New skill', icon: MagicWand01Icon },
  file: { label: 'New file', icon: File01Icon },
};

export default function HandbookHeader({ proto, onNew }: { proto: Prototype; onNew: (kind: NewKind) => void }) {
  const { handbook } = rootApi.useLoaderData();
  // Files can be made only while the app runs locally: this is false in the deployed site.
  const kinds = import.meta.env.DEV ? creatableIn(proto.id, '') : [];
  return (
    <div className="shrink-0 px-2 pt-3">
      <div className="-mr-2 flex min-h-8 items-center gap-0.5 px-2.5">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">Handbook</h2>
        {kinds.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="New"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              {kinds.map((kind) => (
                <DropdownMenuItem key={kind} onClick={() => setTimeout(() => onNew(kind))}>
                  <HugeiconsIcon icon={NEW_KINDS[kind].icon} /> {NEW_KINDS[kind].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <nav aria-label="Handbook sections" className="mt-1 flex gap-1 px-1">
        {handbook.map((section) => (
          <Link
            key={section.id}
            {...prototypeLink(section)}
            aria-current={section.id === proto.id ? 'page' : undefined}
            className={cn(
              'rounded-md px-2 py-1 text-xs text-sidebar-foreground/80 transition-colors',
              'hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground',
              section.id === proto.id && 'bg-sidebar-foreground/10 font-medium text-sidebar-accent-foreground',
            )}
          >
            {section.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
