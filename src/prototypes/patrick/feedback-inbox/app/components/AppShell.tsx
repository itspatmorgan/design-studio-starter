// The frame every screen shares: a sidebar and a page. Screens are separate files so each has its
// own address, and this keeps them looking like one product.
import type { ReactNode } from 'react';
import { Inbox, LayoutDashboard, MessageSquareText } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/systems/product/components/avatar';
import { Button } from '@/systems/product/components/button';
import { cn } from '@/lib/utils';
import { ScreenLink, useIsOn } from './nav';
import { resetData, useStore } from './store';

function NavItem({ to, icon, children, count }: { to: string; icon: ReactNode; children: ReactNode; count?: number }) {
  const on = useIsOn(to);
  return (
    <ScreenLink
      to={to}
      className={cn('flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', on && 'bg-sidebar-accent text-sidebar-accent-foreground')}
    >
      {icon}
      <span className="flex-1">{children}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </ScreenLink>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { items } = useStore();
  return (
    <div className="flex min-h-full bg-background text-foreground">
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3">
        <div className="mb-4 flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"><MessageSquareText className="size-3.5" /></div>
          <span className="text-sm font-semibold">Echo</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          <NavItem to="app/overview" icon={<LayoutDashboard className="size-4" />}>Overview</NavItem>
          <NavItem to="app/inbox" icon={<Inbox className="size-4" />} count={items.filter((f) => f.status === 'new').length}>Inbox</NavItem>
        </nav>
        <div className="mt-auto space-y-3">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={resetData}>Reset sample data</Button>
          <div className="flex items-center gap-2 border-t border-sidebar-border px-2 pt-3">
            <Avatar size="sm"><AvatarFallback>PM</AvatarFallback></Avatar>
            <span className="text-sm">Pat Morgan</span>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
