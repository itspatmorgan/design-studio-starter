import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wrench01Icon } from '@hugeicons/core-free-icons';
import { Card, CardContent } from '@/platform/components/card';
import PrototypeCardMenu from '@/platform/modules/prototypes/gallery/PrototypeCardMenu';
import { prototypeLink } from '@/platform/app/data/manifest';
import type { PrototypeInfo } from '@/platform/app/data/types';
import { toolArt } from './toolArt';
import { cn } from '@/lib/utils';

// A tool's card: a coloured header with the tool's mark, then its name and what it does. Prototypes' cards
// are plainer; this one says "open me and use me".
export default function ToolCard({ tool }: { tool: PrototypeInfo }) {
  return (
    <div className="group/card-wrap relative h-full">
      <Link
        {...prototypeLink(tool)}
        className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Card className={cn('h-full gap-0 pt-0 transition-colors hover:bg-muted/40', tool.status === 'archived' && 'opacity-60')}>
          <div className="grid aspect-[16/10] place-items-center overflow-hidden" style={toolArt(tool.id)}>
            <span className="grid size-14 place-items-center rounded-2xl bg-background/90 shadow-sm ring-1 ring-foreground/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
              <HugeiconsIcon icon={Wrench01Icon} size={28} strokeWidth={1.75} className="text-foreground/80" />
            </span>
          </div>
          <CardContent className="flex flex-1 flex-col gap-1.5 pt-4">
            <div className="text-base font-semibold leading-snug text-foreground">{tool.title}</div>
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{tool.description || 'No description'}</p>
          </CardContent>
        </Card>
      </Link>
      <PrototypeCardMenu proto={tool} triggerClassName="bg-background/70 backdrop-blur-sm" />
    </div>
  );
}
