import { ContributorAvatar } from '@/platform/app/shell/ContributorAvatar';
import { CollectionCard } from '@/platform/app/items/CollectionCard';
import { formatDate, prototypeLink } from '@/platform/app/data/manifest';
import type { PrototypeInfo } from '@/platform/app/data/types';
import PrototypeCardMenu from './PrototypeCardMenu';

// A prototype's card, on the gallery and on the front page.
export default function PrototypeCard({ prototype: p }: { prototype: PrototypeInfo }) {
  const name = p.contributor || p.contributorKey;
  return (
    <CollectionCard
      link={prototypeLink(p)}
      id={p.id}
      title={p.title}
      description={p.description}
      archived={p.status === 'archived'}
      meta={<><ContributorAvatar name={name} /><span className="truncate">{name.split(' ')[0]}</span>{p.created && <span>· {formatDate(p.created)}</span>}</>}
      menu={<PrototypeCardMenu proto={p} triggerClassName="bg-background/70 backdrop-blur-sm" />}
    />
  );
}
