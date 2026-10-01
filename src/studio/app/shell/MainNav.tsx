import { HugeiconsIcon } from '@hugeicons/react';
import {
  Layers01Icon, Moon02Icon, PanelLeftCloseIcon, PanelLeftOpenIcon, Search01Icon, Sun01Icon,
} from '@hugeicons/core-free-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Link, useRouterState, type LinkProps } from '@tanstack/react-router';
import { useOpenPalette } from '@/studio/app/shell/CommandPalette';
import { Logo } from '@/studio/app/shell/Logo';
import { inSection, moduleApps, sectionPath } from '@/studio/app/modules';
import { APP_NAME } from '@/studio/app/data/config';

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
// Top: Prototypes, then the modules that sit at the top (Tools, Systems, Handbook). Bottom: the modules that
// sit at the bottom (the Guide about the tool itself), then the theme toggle. The modules come from
// src/studio/modules/<id>/app.tsx, so the rail has exactly the ones installed and on. sectionNav is set only
// while a page has a section navigation (shell/nav/), to show or hide it.
type MainNavProps = {
  colorMode: string;
  onToggleColorMode: () => void;
  sectionNav: { open: boolean; toggle: () => void } | null;
};

export default function MainNav({ colorMode, onToggleColorMode, sectionNav }: MainNavProps) {
  const openPalette = useOpenPalette();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onModule = moduleApps.some(({ spec }) => inSection(spec, pathname));
  const moduleLinks = (place: 'top' | 'bottom') => moduleApps.filter(({ app }) => app.rail === place).map(({ spec, app }) => (
    <RailLink key={spec.id} to={sectionPath(spec) as never} label={spec.label} active={inSection(spec, pathname)}>
      <HugeiconsIcon icon={app.icon} size={16} />
    </RailLink>
  ));
  return (
    <nav
      aria-label="Main"
      data-testid="main-nav"
      className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-3"
    >
      <RailLink to="/" label={APP_NAME} className="active:scale-95">
        <Logo className="h-3.5 w-auto" />
      </RailLink>
      <RailButton label="Search (⌘K)" onClick={openPalette}>
        <HugeiconsIcon icon={Search01Icon} size={16} />
      </RailButton>
      <div className="h-2" />
      <RailLink to="/" label="Prototypes" active={!onModule}>
        <HugeiconsIcon icon={Layers01Icon} size={16} />
      </RailLink>
      {moduleLinks('top')}

      <div className="mt-auto" />
      {sectionNav && (
        <RailButton label={`${sectionNav.open ? 'Hide' : 'Show'} navigation (⌘;)`} onClick={sectionNav.toggle}>
          <HugeiconsIcon icon={sectionNav.open ? PanelLeftCloseIcon : PanelLeftOpenIcon} size={16} />
        </RailButton>
      )}
      {moduleLinks('bottom')}
      <RailButton label={colorMode === 'dark' ? 'Light mode' : 'Dark mode'} onClick={onToggleColorMode}>
        <HugeiconsIcon icon={colorMode === 'dark' ? Sun01Icon : Moon02Icon} size={16} />
      </RailButton>
    </nav>
  );
}
