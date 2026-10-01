import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/platform/components/card';
import { cn } from '@/lib/utils';
import { cardArt, monogram } from './cardArt';

// The card for anything in a collection (a prototype, a tool, a doc), on the front page and on each collection's
// index, so they all have one shape: a picture worked out from `id` with the title's first letter on it (so no two
// cards repeat an icon), then the title, what it is, and a line of detail. `link` is a link from manifest.ts (prototypeLink, itemLink). `menu` is drawn beside the
// link, not inside it (PrototypeCardMenu), so the card must sit in a "card-wrap" group.
export function CollectionCard({ link, id, title, description, meta, archived, menu }: {
  link: object; id: string; title: string; description?: string; meta?: ReactNode; archived?: boolean; menu?: ReactNode;
}) {
  return (
    <div className="group/card-wrap relative h-full">
      <Link
        {...(link as { to: never })}
        className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Card className={cn('h-full gap-0 pt-0 transition-colors hover:bg-muted/40', archived && 'opacity-60')}>
          <div className="grid aspect-[16/7] place-items-center overflow-hidden" style={cardArt(id)}>
            <span className="grid size-11 place-items-center rounded-xl bg-background/90 text-lg font-semibold text-foreground/80 shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
              {monogram(title)}
            </span>
          </div>
          <CardContent className="flex flex-1 flex-col gap-1.5 pt-3.5">
            <div className="text-sm font-semibold leading-snug text-foreground">{title}</div>
            {description !== undefined && <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description || 'No description'}</p>}
            {meta && <div className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">{meta}</div>}
          </CardContent>
        </Card>
      </Link>
      {menu}
    </div>
  );
}
