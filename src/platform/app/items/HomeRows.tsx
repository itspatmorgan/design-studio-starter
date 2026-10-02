import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';
import { cardTint, monogram } from './cardArt';

// The rows on the front page (HomeSection.tsx). `link` is a link from manifest.ts (prototypeLink, itemLink). Every row is one
// line high, with its mark in a 28px slot, so the titles of all the sections start at the same place.

// A prototype or a tool: a small tile marked with the title's first letter, and the title with a muted detail after it.
// `menu` is drawn beside the link (PrototypeCardMenu), so the row sits in a "card-wrap" group.
export function HomeRow({ link, id, title, meta, menu }: { link: object; id: string; title: string; meta?: ReactNode; menu?: ReactNode }) {
  return (
    <li className="group/card-wrap relative">
      <Link {...(link as { to: never })} className="flex items-center gap-3 px-4 py-2 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50">
        <span className="grid size-7 shrink-0 place-items-center rounded-md text-xs font-semibold text-foreground/75" style={cardTint(id)} aria-hidden>{monogram(title)}</span>
        <span className="flex min-w-0 flex-1 items-baseline gap-1.5 pr-7">
          <span className="truncate text-sm text-foreground">{title}</span>
          {meta && <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>}
        </span>
      </Link>
      {menu}
    </li>
  );
}

// A doc, a design system, or anything that is just a title: a small icon in the same slot instead of a tile.
export function HomeLinkRow({ link, title, icon = File01Icon }: { link: object; title: string; icon?: IconSvgElement }) {
  return (
    <li>
      <Link {...(link as { to: never })} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50">
        <span className="grid size-7 shrink-0 place-items-center"><HugeiconsIcon icon={icon} size={16} className="text-muted-foreground" /></span>
        <span className="truncate">{title}</span>
      </Link>
    </li>
  );
}
