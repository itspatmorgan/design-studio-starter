// Prototype navigation: everything about the prototype at the top (PrototypeHeader.tsx, or the
// Docs / Rules / Skills tabs for a Handbook section), then its files (FileTree.tsx). It is a
// SectionNav (shell/nav/), so it resizes like every section's navigation.
import type { Artifact, Prototype } from '@/platform/app/data/types';
import { SectionNav } from '@/platform/app/shell/nav';
import PrototypeHeader from '@/platform/modules/prototypes/viewer/PrototypeHeader';
import HandbookHeader from '@/platform/modules/handbook/pages/HandbookHeader';
import { HANDBOOK_KEY } from '@/platform/core/roots';
import FileTree from '@/platform/modules/prototypes/viewer/FileTree';

export default function PrototypeNav({ proto, current }: { proto: Prototype; current: Artifact | undefined }) {
  return (
    <SectionNav label="Prototype navigation">
      {proto.contributorKey === HANDBOOK_KEY
        ? <HandbookHeader proto={proto} />
        : <PrototypeHeader proto={proto} />}
      <FileTree proto={proto} current={current} />
    </SectionNav>
  );
}
