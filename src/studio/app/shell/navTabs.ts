// How a tab looks in a navigation header: the Handbook's Docs / Rules / Skills, and the Systems
// page's Product / Studio. Small text links, the open one raised.
import { cn } from '@/lib/utils';

export const navTabClass = (active: boolean) => cn(
  'rounded-md px-2 py-1 text-xs text-sidebar-foreground/80 transition-colors',
  'hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground',
  active && 'bg-sidebar-foreground/10 font-medium text-sidebar-accent-foreground',
);
