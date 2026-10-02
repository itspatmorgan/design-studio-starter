import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

// A block of the front page's panel: a heading that links to the module's own page (the chevron says so), then
// the rows the module chose to show (HomeRows.tsx). A module's `overview` (src/platform/app/modules.ts) draws one of these.
export function HomeSection({ title, to, children }: { title: string; to: string; children: ReactNode }) {
  return (
    <section className="border-b border-border py-2 last:border-b-0">
      <h2 className="px-4 pt-1 pb-1 text-xs font-medium text-muted-foreground">
        <Link to={to as never} className="group/title -mx-1 inline-flex items-center gap-0.5 rounded px-1 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          {title}
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="transition-transform group-hover/title:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </h2>
      {children}
    </section>
  );
}
