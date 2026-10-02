import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { cardTint, monogram } from './cardArt';

// The row on the front page for a prototype or a tool (HomeSection.tsx). `link` is a link from manifest.ts (prototypeLink).

// A small tile marked with the title's first letter, the title with a muted detail after it, and one
// line of what it is. `menu` is drawn beside the link (PrototypeCardMenu), so the row sits in a "card-wrap" group.
export function HomeRow({ link, id, title, description, meta, menu }: { link: object; id: string; title: string; description?: string; meta?: ReactNode; menu?: ReactNode }) {
  return (
    <li className="group/card-wrap relative">
      <Link {...(link as { to: never })} className="flex items-center gap-3 px-4 py-2.5 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg text-sm font-semibold text-foreground/75" style={cardTint(id)} aria-hidden>{monogram(title)}</span>
        <span className="min-w-0 flex-1 pr-7">
          <span className="flex items-baseline gap-1.5">
            <span className="truncate text-sm font-medium text-foreground">{title}</span>
            {meta && <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>}
          </span>
          {description && <span className="block truncate text-xs text-muted-foreground">{description}</span>}
        </span>
      </Link>
      {menu}
    </li>
  );
}
