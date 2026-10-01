import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

// A block on the front page: a heading, a link to the module's own page, and what the module chose to show.
// A module's `overview` (src/platform/app/modules.ts) draws one of these.
export function HomeSection({ title, to, linkLabel, children }: { title: string; to: string; linkLabel: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Link to={to as never} className="text-sm text-primary hover:underline">{linkLabel}</Link>
      </div>
      {children}
    </section>
  );
}
