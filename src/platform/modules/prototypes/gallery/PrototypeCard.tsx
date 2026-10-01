import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/platform/components/card';
import { ContributorAvatar } from '@/platform/app/shell/ContributorAvatar';
import { formatDate, prototypeLink } from '@/platform/app/data/manifest';
import type { PrototypeInfo } from '@/platform/app/data/types';
import { cn } from '@/lib/utils';
import PrototypeCardMenu from './PrototypeCardMenu';

// A prototype's card, on the gallery and on the front page.
export default function PrototypeCard({ prototype: p }: { prototype: PrototypeInfo }) {
  const name = p.contributor || p.contributorKey;
  return (
    <div className="group/card-wrap relative h-full">
      <Link {...prototypeLink(p)} className="block h-full">
        <Card className={cn('h-full transition-colors hover:bg-muted/40', p.status === 'archived' && 'opacity-60')}>
          <CardContent className="flex flex-1 flex-col gap-2.5">
            <div className="flex h-7 items-center gap-2">
              <ContributorAvatar name={name} />
              <span className="truncate text-xs font-medium text-muted-foreground">{name.split(' ')[0]}</span>
            </div>
            <div className="text-sm font-semibold leading-snug text-foreground">{p.title}</div>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.description || 'No description'}</p>
            <span className="mt-auto pt-0.5 text-xs text-muted-foreground">{formatDate(p.created)}</span>
          </CardContent>
        </Card>
      </Link>
      <PrototypeCardMenu proto={p} />
    </div>
  );
}
