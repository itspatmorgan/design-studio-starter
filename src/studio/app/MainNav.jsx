import { HugeiconsIcon } from '@hugeicons/react';
import { Layers01Icon, Shapes01Icon } from '@hugeicons/core-free-icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { cn } from '@/lib/utils';
import { Link } from './navigate.jsx';

// One square button on the rail: a link with a tooltip to its right.
function RailLink({ to, label, active, children, className }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex size-8 items-center justify-center rounded-md text-sidebar-foreground transition-colors',
            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
            active && 'bg-sidebar-accent-active text-sidebar-accent-foreground',
            className,
          )}
        >
          {children}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

// Main navigation: a narrow icon rail, visible on every page.
export default function MainNav({ page }) {
  return (
    <nav
      aria-label="Main"
      data-testid="main-nav"
      className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-3"
    >
      <RailLink to={{}} label="Prototype Sandbox" className="mb-3 active:scale-95">
        {/* Placeholder mark. Swap in your own logo. */}
        <span className="grid size-4 place-items-center rounded-[5px] bg-foreground">
          <span className="size-1.5 rounded-full bg-background" />
        </span>
      </RailLink>
      <RailLink to={{}} label="Prototypes" active={page !== 'systems'}>
        <HugeiconsIcon icon={Layers01Icon} size={16} />
      </RailLink>
      <RailLink to={{ page: 'systems' }} label="Systems" active={page === 'systems'}>
        <HugeiconsIcon icon={Shapes01Icon} size={16} />
      </RailLink>
    </nav>
  );
}
