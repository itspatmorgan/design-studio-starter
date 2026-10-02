import { Fragment, useSyncExternalStore, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { GridViewIcon, LeftToRightListBulletIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { ItemGrid } from './ItemGrid';

// A collection's index (/prototypes, /tools, ...) can be read as cards or as a plain list. Which one is saved in this
// browser and shared by every index, so you choose once. Cards are the default.
const KEY = 'design-studio:collection-view';
export type CollectionView = 'cards' | 'list';
const read = (): CollectionView => (localStorage.getItem(KEY) === 'list' ? 'list' : 'cards');
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => { listeners.delete(listener); window.removeEventListener('storage', listener); };
};

export function useCollectionView() {
  const view = useSyncExternalStore(subscribe, read, () => 'cards' as CollectionView);
  const setView = (next: CollectionView) => { localStorage.setItem(KEY, next); listeners.forEach((l) => l()); };
  return [view, setView] as const;
}

// The two-button switch for the header of an index.
export function ViewToggle() {
  const [view, setView] = useCollectionView();
  const choices = [['cards', 'Cards', GridViewIcon], ['list', 'List', LeftToRightListBulletIcon]] as const;
  return (
    <div role="group" aria-label="View as" className="inline-flex h-8 shrink-0 items-center rounded-lg border border-input p-0.5">
      {choices.map(([value, label, icon]) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          aria-label={label}
          title={label}
          onClick={() => setView(value)}
          className={cn('grid size-6 place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring', view === value && 'bg-muted text-foreground')}
        >
          <HugeiconsIcon icon={icon} size={14} />
        </button>
      ))}
    </div>
  );
}

// The items as a grid of cards (each in an <li>) or a list of rows (ItemRow draws its own <li>), as the reader chose.
export function Collection<T>({ items, keyOf, card, row }: { items: T[]; keyOf: (item: T) => string; card: (item: T) => ReactNode; row: (item: T) => ReactNode }) {
  const [view] = useCollectionView();
  if (view === 'list') return <ul className="rounded-xl border border-border bg-card p-2">{items.map((item) => <Fragment key={keyOf(item)}>{row(item)}</Fragment>)}</ul>;
  return <ItemGrid>{items.map((item) => <li key={keyOf(item)}>{card(item)}</li>)}</ItemGrid>;
}
