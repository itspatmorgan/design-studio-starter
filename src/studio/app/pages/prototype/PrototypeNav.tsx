// Prototype navigation: the prototype's title, its files (FileTree.tsx), and About at the
// bottom. Drag the right edge to resize it.
import { useState } from 'react';
import { firstView, formatDate, viewSlug } from '@/studio/app/data/manifest';
import { useMe } from '@/studio/app/data/files';
import type { Prototype, View } from '@/studio/app/data/types';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { ContributorAvatar } from '@/studio/app/shell/ContributorAvatar';
import { NAV_WIDTH, useSectionNavWidth } from '@/studio/app/shell/appPrefs';
import FileTree from '@/studio/app/pages/prototype/FileTree';
import EditPrototypeDialog from '@/studio/app/pages/prototype/EditPrototypeDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { cn } from '@/lib/utils';

// About: the prototype's meta.json, collapsed at the bottom of its navigation.
// In dev, your own prototypes get an Edit button (EditPrototypeDialog).
function About({ proto }: { proto: Prototype }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const me = useMe();
  const editable = import.meta.env.DEV && me === proto.contributorKey;
  const opensOn = firstView(proto);
  const labelClass = 'text-[11px] text-muted-foreground';
  const valueClass = 'mt-0.5 text-[12px] leading-snug text-sidebar-foreground';
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="shrink-0 border-t border-sidebar-border">
      <div className="flex items-center">
        <CollapsibleTrigger
          aria-label={open ? 'Collapse prototype info' : 'Expand prototype info'}
          className="flex h-9 min-w-0 flex-1 items-center gap-1.5 px-2.5 text-left hover:bg-sidebar-foreground/5"
        >
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-none">About</span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} className={cn('shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </CollapsibleTrigger>
        {editable && (
          <Tooltip>
            <TooltipTrigger
              render={<button type="button" aria-label="Edit prototype" onClick={() => setEditing(true)}
                className="mr-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground" />}
            >
              <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
            </TooltipTrigger>
            <TooltipContent side="top">Edit prototype</TooltipContent>
          </Tooltip>
        )}
      </div>
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
            {opensOn && (
              <div>
                <dt className={labelClass}>Opens on</dt>
                <dd className={cn(valueClass, 'truncate')}>{[opensOn.group, viewSlug(opensOn.name)].filter(Boolean).join('/')}</dd>
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
      {editable && <EditPrototypeDialog proto={proto} open={editing} onOpenChange={setEditing} />}
    </Collapsible>
  );
}

export default function PrototypeNav({ proto, current }: { proto: Prototype; current: View | undefined }) {
  const { width, resizing, handleProps } = useSectionNavWidth();
  return (
    <aside aria-label="Prototype navigation" style={{ width }} className="relative flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 px-2 pt-3">
        <p className="flex h-8 items-center truncate px-2.5 text-sm font-semibold leading-tight">{proto.title}</p>
      </div>
      <FileTree proto={proto} current={current} />
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
