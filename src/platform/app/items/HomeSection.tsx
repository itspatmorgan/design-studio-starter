import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

// A block on the front page: a heading that links to the module's own page (the chevron says so), and what the
// module chose to show. A module's `overview` (src/platform/app/modules.ts) draws one of these.
export function HomeSection({ title, to, children }: { title: string; to: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold text-foreground">
        <Link to={to as never} className="group/title -mx-1 inline-flex items-center gap-0.5 rounded px-1 outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
          {title}
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="transition-transform group-hover/title:translate-x-0.5 motion-reduce:transition-none" />
        </Link>
      </h2>
      {children}
    </section>
  );
}
