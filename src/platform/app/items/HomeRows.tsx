import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { cardTint, monogram } from './cardArt';

// The row on the front page for anything in a section (HomeSection.tsx). `link` is a link from manifest.ts (prototypeLink,
// itemLink). Every row is one line high and starts with a 28px tile filled with a quiet tint of the item's own colour, so
// the sections weigh the same and all the titles start at the same place. The tile holds the title's first letter, or an
// `icon` where the item is a kind of thing rather than a named piece of work (a doc, a design system). `menu` is drawn
// beside the link (PrototypeCardMenu), so the row sits in a "card-wrap" group.
export function HomeRow({ link, id, title, icon, meta, menu }: { link: object; id: string; title: string; icon?: IconSvgElement; meta?: ReactNode; menu?: ReactNode }) {
  return (
    <li className="group/card-wrap relative">
      <Link {...(link as { to: never })} className="flex items-center gap-3 px-4 py-1.5 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50">
        <span className="grid size-7 shrink-0 place-items-center rounded-md text-xs font-semibold text-foreground/75" style={cardTint(id)} aria-hidden>
          {icon ? <HugeiconsIcon icon={icon} size={15} strokeWidth={1.75} /> : monogram(title)}
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
