import { CollectionCard } from '@/platform/app/items/CollectionCard';
import PrototypeCardMenu from '@/platform/modules/prototypes/gallery/PrototypeCardMenu';
import { prototypeLink } from '@/platform/app/data/manifest';
import type { PrototypeInfo } from '@/platform/app/data/types';

// A tool's card: the same shape as a prototype's, with the people who maintain it.
export default function ToolCard({ tool }: { tool: PrototypeInfo }) {
  return (
    <CollectionCard
      link={prototypeLink(tool)}
      id={tool.id}
      title={tool.title}
      description={tool.description}
      archived={tool.status === 'archived'}
      meta={tool.contributor ? <span className="truncate">{tool.contributor}</span> : undefined}
      menu={<PrototypeCardMenu proto={tool} triggerClassName="bg-background/70 backdrop-blur-sm" />}
    />
  );
}
