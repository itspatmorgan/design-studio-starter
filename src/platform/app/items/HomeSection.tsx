import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

// The heading of a block of the front page's panel: it links to the module's own page (the chevron says so).
function Heading({ title, to }: { title: string; to: string }) {
  return (
    <h2 className="shrink-0 text-xs font-medium text-muted-foreground">
      <Link to={to as never} className="group/title -mx-1 inline-flex items-center gap-0.5 rounded px-1 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
        {title}
        <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="transition-transform group-hover/title:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
    </h2>
  );
}

// A block with a few rows under its heading (HomeRows.tsx). A module's `overview` (src/platform/app/modules.ts) draws
// one of these, or a HomeLinksSection.
export function HomeSection({ title, to, children }: { title: string; to: string; children: ReactNode }) {
  return (
    <section className="border-b border-border py-2.5 last:border-b-0">
      <div className="px-4 pb-1"><Heading title={title} to={to} /></div>
      {children}
    </section>
  );
}

// A block of nothing but links, on one line after its heading, for things with no more to say than a name:
// "Docs ›  Personas · Principles".
export function HomeLinksSection({ title, to, links }: { title: string; to: string; links: { label: string; link: object }[] }) {
  return (
    <section className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border px-4 py-3 last:border-b-0">
      {/* The same width for every heading, so the links of one block start where the next block's do. */}
      <div className="w-28"><Heading title={title} to={to} /></div>
      <ul className="flex flex-wrap items-baseline gap-x-2 text-sm">
        {links.map((l, i) => (
          <li key={l.label} className="flex items-baseline gap-2">
            {i > 0 && <span aria-hidden className="text-muted-foreground/60">·</span>}
            <Link {...(l.link as { to: never })} className="rounded text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">{l.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
