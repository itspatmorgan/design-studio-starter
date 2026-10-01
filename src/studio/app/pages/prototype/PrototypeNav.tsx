// Prototype navigation: everything about the prototype at the top (PrototypeHeader.tsx, or the
// Docs / Rules / Skills tabs for a Handbook section), then its files (FileTree.tsx). It is a
// SectionNav (shell/nav/), so it resizes like every section's navigation.
import type { Item, Prototype } from '@/studio/app/data/types';
import { SectionNav } from '@/studio/app/shell/nav';
import PrototypeHeader from '@/studio/app/pages/prototype/PrototypeHeader';
import HandbookHeader from '@/studio/app/pages/handbook/HandbookHeader';
import { HANDBOOK_KEY } from '@/studio/core/roots';
import FileTree from '@/studio/app/pages/prototype/FileTree';

export default function PrototypeNav({ proto, current }: { proto: Prototype; current: Item | undefined }) {
  return (
    <SectionNav label="Prototype navigation">
      {proto.contributorKey === HANDBOOK_KEY
        ? <HandbookHeader proto={proto} />
        : <PrototypeHeader proto={proto} />}
      <FileTree proto={proto} current={current} />
    </SectionNav>
  );
}
