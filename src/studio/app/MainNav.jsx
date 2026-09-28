import { HugeiconsIcon } from '@hugeicons/react';
import {
  Layers01Icon, Moon02Icon, PanelLeftCloseIcon, PanelLeftOpenIcon, Search01Icon, Shapes01Icon, Sun01Icon,
} from '@hugeicons/core-free-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { cn } from '@/lib/utils';
import { Link } from './navigate.jsx';
import { useOpenPalette } from './CommandPalette.jsx';

const railButton = cn(
  'flex size-8 items-center justify-center rounded-md text-sidebar-foreground transition-colors',
  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
);

// One square button on the rail: a link with a tooltip to its right.
function RailLink({ to, label, active, children, className }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          className={cn(railButton, active && 'bg-sidebar-accent-active text-sidebar-accent-foreground', className)}
        >
          {children}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

// One square button on the rail that runs an action, like opening search.
function RailButton({ label, onClick, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" onClick={onClick} aria-label={label} className={railButton}>{children}</button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

// Main navigation: a narrow icon rail, visible on every page.
// sectionNav is set only while a prototype is open, to show/hide its navigation.
export default function MainNav({ page, colorMode, onToggleColorMode, sectionNav }) {
  const openPalette = useOpenPalette();
  return (
    <nav
      aria-label="Main"
      data-testid="main-nav"
      className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-3"
    >
      <RailLink to={{}} label="Prototype Sandbox" className="active:scale-95">
        {/* Placeholder mark. Swap in your own logo. */}
        <span className="grid size-4 place-items-center rounded-[5px] bg-foreground">
          <span className="size-1.5 rounded-full bg-background" />
        </span>
      </RailLink>
      <RailButton label="Search (⌘K)" onClick={openPalette}>
        <HugeiconsIcon icon={Search01Icon} size={16} />
      </RailButton>
      <div className="h-2" />
      <RailLink to={{}} label="Prototypes" active={page !== 'systems'}>
        <HugeiconsIcon icon={Layers01Icon} size={16} />
      </RailLink>
      <RailLink to={{ page: 'systems' }} label="Systems" active={page === 'systems'}>
        <HugeiconsIcon icon={Shapes01Icon} size={16} />
      </RailLink>

      <div className="mt-auto" />
      {sectionNav && (
        <RailButton label={`${sectionNav.open ? 'Hide' : 'Show'} prototype navigation (⌘;)`} onClick={sectionNav.toggle}>
          <HugeiconsIcon icon={sectionNav.open ? PanelLeftCloseIcon : PanelLeftOpenIcon} size={16} />
        </RailButton>
      )}
      <RailButton label={colorMode === 'dark' ? 'Light mode' : 'Dark mode'} onClick={onToggleColorMode}>
        <HugeiconsIcon icon={colorMode === 'dark' ? Sun01Icon : Moon02Icon} size={16} />
      </RailButton>
    </nav>
  );
}
