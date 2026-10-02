import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';

// The row on the front page for anything in a section (HomeSection.tsx). `link` is a link from manifest.ts (prototypeLink,
// itemLink). Every row is one line high and starts with a 28px neutral tile holding the module's rail icon, so all of a
// section's rows look alike. The row is inset from the panel's edge and rounded, so its hover is a pill and not a stripe.
// `menu` is drawn beside the link (PrototypeCardMenu), so the row sits in a "card-wrap" group.
export function HomeRow({ link, icon, title, meta, menu }: { link: object; icon: IconSvgElement; title: string; meta?: ReactNode; menu?: ReactNode }) {
  return (
    <li className="group/card-wrap relative">
      <Link {...(link as { to: never })} className="flex items-center gap-3 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-foreground/70" aria-hidden>
          <HugeiconsIcon icon={icon} size={15} strokeWidth={1.75} />
        </span>
        <span className="flex min-w-0 flex-1 items-baseline gap-1.5 pr-7">
          <span className="truncate text-sm text-foreground">{title}</span>
          {meta && <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>}
        </span>
      </Link>
      {menu}
    </li>
  );
}
