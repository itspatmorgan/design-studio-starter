// How an item appears where it can't be shown itself (on a canvas, for a type with no embed):
// its icon, name and type, and a link that opens it. `missing` is for a link that points at
// nothing.
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { FileNotFoundIcon } from '@hugeicons/core-free-icons';
import { FILE_TYPES, fileTypeModules } from '@/studio/app/data/fileTypes';
import { itemLabel, itemLink } from '@/studio/app/data/manifest';
import type { Item, Prototype } from '@/studio/app/data/types';
import { cn } from '@/lib/utils';

export const ITEM_CARD_HEIGHT = 88;

export default function ItemCard({ proto, item, className }: { proto?: Prototype; item?: Item; className?: string }) {
  const icon = item && fileTypeModules[item.fileType]?.icon;
  const found = proto && item;
  return (
    <div className={cn('flex h-full w-full items-center gap-3 overflow-hidden rounded-xl border border-border bg-background px-4 text-left', className)}>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon icon={found && icon ? icon : FileNotFoundIcon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{found ? itemLabel(item.path) : 'Not found'}</div>
        <div className="truncate text-xs text-muted-foreground">
          {found ? FILE_TYPES[item.fileType]?.label ?? 'File' : "This file was moved or deleted. Ask your agent to fix the link."}
        </div>
      </div>
      {found && (
        <Link {...itemLink(proto, item)} data-open className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-foreground hover:bg-muted">
          Open
        </Link>
      )}
    </div>
  );
}
