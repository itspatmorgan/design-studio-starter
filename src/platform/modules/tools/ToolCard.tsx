import { Wrench01Icon } from '@hugeicons/core-free-icons';
import { CollectionCard } from '@/platform/app/items/CollectionCard';
import { ItemRow } from '@/platform/app/items/ItemRow';
import PrototypeCardMenu from '@/platform/modules/prototypes/gallery/PrototypeCardMenu';
import { prototypeLink } from '@/platform/app/data/manifest';
import type { PrototypeInfo } from '@/platform/app/data/types';

// A tool's card: the same shape as a prototype's, with the people who maintain it.
export default function ToolCard({ tool }: { tool: PrototypeInfo }) {
  return (
    <CollectionCard
      link={prototypeLink(tool)}
      icon={Wrench01Icon}
      title={tool.title}
      description={tool.description}
      archived={tool.status === 'archived'}
      meta={tool.contributor ? <span className="truncate">{tool.contributor}</span> : undefined}
      menu={<PrototypeCardMenu proto={tool} />}
    />
  );
}

// A tool's row, in the Tools page's list view and on the front page.
export function ToolRow({ tool }: { tool: PrototypeInfo }) {
  return (
    <ItemRow
      link={prototypeLink(tool)}
      icon={Wrench01Icon}
      title={tool.title}
      meta={tool.contributor || undefined}
      archived={tool.status === 'archived'}
      menu={<PrototypeCardMenu proto={tool} inline />}
    />
  );
}
