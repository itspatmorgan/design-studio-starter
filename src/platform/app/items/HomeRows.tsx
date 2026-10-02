import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { cardTint } from './cardArt';

// The row on the front page for anything in a section (HomeSection.tsx). `link` is a link from manifest.ts (prototypeLink,
// itemLink). Every row is one line high and starts with a 28px tile in a quiet tint. The tile and its icon belong to the
// module, not the item: `tint` is the module's id, so all of a section's rows look alike and each section has its own
// colour, the module's rail icon. `menu` is drawn beside the link (PrototypeCardMenu), so the row sits in a "card-wrap" group.
export function HomeRow({ link, tint, icon, title, meta, menu }: { link: object; tint: string; icon: IconSvgElement; title: string; meta?: ReactNode; menu?: ReactNode }) {
  return (
    <li className="group/card-wrap relative">
      <Link {...(link as { to: never })} className="flex items-center gap-3 px-4 py-1.5 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50">
        <span className="grid size-7 shrink-0 place-items-center rounded-md text-foreground/75" style={cardTint(tint)} aria-hidden>
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
