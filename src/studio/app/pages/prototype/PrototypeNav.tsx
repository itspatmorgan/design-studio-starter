// Prototype navigation: everything about the prototype at the top (PrototypeHeader.tsx), then its files (FileTree.tsx). Drag the right edge to resize it.
import { useRef } from 'react';
import type { Item, Prototype } from '@/studio/app/data/types';
import { NAV_WIDTH, useSectionNavWidth } from '@/studio/app/shell/appPrefs';
import PrototypeHeader from '@/studio/app/pages/prototype/PrototypeHeader';
import FileTree, { type FileTreeHandle } from '@/studio/app/pages/prototype/FileTree';
import { cn } from '@/lib/utils';

export default function PrototypeNav({ proto, current }: { proto: Prototype; current: Item | undefined }) {
  const { width, resizing, handleProps } = useSectionNavWidth();
  // The header's "+" menu creates in the tree.
  const tree = useRef<FileTreeHandle>(null);
  return (
    <aside aria-label="Prototype navigation" style={{ width }} className="relative flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <PrototypeHeader proto={proto} onNew={(target) => tree.current?.startCreate('', target)} />
      <FileTree proto={proto} current={current} handle={tree} />
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
