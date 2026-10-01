import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon, Layers01Icon, Moon02Icon, Notebook01Icon, PanelLeftCloseIcon, PanelLeftOpenIcon, Search01Icon, Shapes01Icon, Sun01Icon, Wrench01Icon,
} from '@hugeicons/core-free-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Link, useMatchRoute, useRouterState, type LinkProps } from '@tanstack/react-router';
import { useOpenPalette } from '@/studio/app/shell/CommandPalette';

const railButton = cn(
  'flex size-8 items-center justify-center rounded-md text-sidebar-foreground transition-colors',
  'hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
);

// One square button on the rail: a link with a tooltip to its right.
type RailLinkProps = { to: LinkProps['to']; label: string; active?: boolean; children: ReactNode; className?: string };

function RailLink({ to, label, active, children, className }: RailLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            to={to}
            aria-label={label}
            activeOptions={{ exact: true }}
            aria-current={active ? 'page' : undefined}
            className={cn(railButton, active && 'bg-sidebar-foreground/10 text-sidebar-accent-foreground', className)}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

// One square button on the rail that runs an action, like opening search.
function RailButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<button type="button" onClick={onClick} aria-label={label} className={railButton} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

// Main navigation: a narrow icon rail, visible on every page.
// Top: the parts of the environment (Prototypes, Tools, Systems, Handbook). Bottom: the Guide about the
// tool itself, then the theme toggle. sectionNav is set only while a page has a section
// navigation (shell/nav/), to show or hide it.
type MainNavProps = {
  colorMode: string;
  onToggleColorMode: () => void;
  sectionNav: { open: boolean; toggle: () => void } | null;
};

export default function MainNav({ colorMode, onToggleColorMode, sectionNav }: MainNavProps) {
  const openPalette = useOpenPalette();
  const matchRoute = useMatchRoute();
  const onSystems = Boolean(matchRoute({ to: '/systems', fuzzy: true }));
  const onGuide = Boolean(matchRoute({ to: '/guide', fuzzy: true }));
  // /handbook and its sections (/handbook/docs/...), which open through the prototype routes.
  const onHandbook = useRouterState({ select: (s) => s.location.pathname === '/handbook' || s.location.pathname.startsWith('/handbook/') });
  // /tools and the tools themselves (/tools/<id>), which open through the prototype routes.
  const onTools = useRouterState({ select: (s) => s.location.pathname === '/tools' || s.location.pathname.startsWith('/tools/') });
  return (
    <nav
      aria-label="Main"
      data-testid="main-nav"
      className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-3"
    >
      <RailLink to="/" label="Design Studio" className="active:scale-95">
        {/* Placeholder mark. Swap in your own logo. */}
        <span className="grid size-4 place-items-center rounded-[5px] bg-foreground">
          <span className="size-1.5 rounded-full bg-background" />
        </span>
      </RailLink>
      <RailButton label="Search (⌘K)" onClick={openPalette}>
        <HugeiconsIcon icon={Search01Icon} size={16} />
      </RailButton>
      <div className="h-2" />
      <RailLink to="/" label="Prototypes" active={!onSystems && !onGuide && !onHandbook && !onTools}>
        <HugeiconsIcon icon={Layers01Icon} size={16} />
      </RailLink>
      <RailLink to="/tools" label="Tools" active={onTools}>
        <HugeiconsIcon icon={Wrench01Icon} size={16} />
      </RailLink>
      <RailLink to="/systems" label="Systems" active={onSystems}>
        <HugeiconsIcon icon={Shapes01Icon} size={16} />
      </RailLink>
      <RailLink to="/handbook" label="Handbook" active={onHandbook}>
        <HugeiconsIcon icon={Notebook01Icon} size={16} />
      </RailLink>

      <div className="mt-auto" />
      {sectionNav && (
        <RailButton label={`${sectionNav.open ? 'Hide' : 'Show'} navigation (⌘;)`} onClick={sectionNav.toggle}>
          <HugeiconsIcon icon={sectionNav.open ? PanelLeftCloseIcon : PanelLeftOpenIcon} size={16} />
        </RailButton>
      )}
      <RailLink to="/guide" label="Guide" active={onGuide}>
        <HugeiconsIcon icon={BookOpen01Icon} size={16} />
      </RailLink>
      <RailButton label={colorMode === 'dark' ? 'Light mode' : 'Dark mode'} onClick={onToggleColorMode}>
        <HugeiconsIcon icon={colorMode === 'dark' ? Sun01Icon : Moon02Icon} size={16} />
      </RailButton>
    </nav>
  );
}
