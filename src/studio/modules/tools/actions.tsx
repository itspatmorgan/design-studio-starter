// What Tools adds to a prototype's "…" menu: Publish as tool, on your own prototype, and Unpublish, on a tool
// you maintain. Both ask the dev server (server.ts), which moves the folder, so the address changes.
import { useNavigate, useRouter } from '@tanstack/react-router';
import { ArrowTurnBackwardIcon, Wrench01Icon } from '@hugeicons/core-free-icons';
import { toast } from '@/studio/components/toast';
import { callModule } from '@/studio/app/data/files';
import { setManifest } from '@/studio/app/data/manifest';
import type { Manifest, PrototypeInfo } from '@/studio/app/data/types';
import type { PrototypeAction } from '@/studio/app/modules';
import { staleLinksMessage } from './staleLinks';

export const TOOLS_KEY = 'tools';

type Moved = { contributor: string; id: string; linkedFrom: string[]; manifest: Manifest };
// Publishes one of your prototypes as a tool, or moves a tool you maintain back into your prototypes.
// `linkedFrom` lists other files that link to the old address.
export const publishTool = (p: PrototypeInfo) => callModule<Moved>('tools', 'publish', { prototype: p.id });
export const unpublishTool = (p: PrototypeInfo) => callModule<Moved>('tools', 'unpublish', { prototype: p.id });

export function useToolActions(proto: PrototypeInfo, { editable }: { editable: boolean }): PrototypeAction[] {
  const router = useRouter();
  const navigate = useNavigate();
  const isTool = proto.contributorKey === TOOLS_KEY;

  async function move() {
    try {
      const result = await (isTool ? unpublishTool : publishTool)(proto);
      setManifest(result.manifest);
      await router.invalidate();
      navigate({ to: '/$contributor/$prototype', params: { contributor: result.contributor, prototype: result.id } });
      toast.add({ title: isTool ? 'Moved back to your prototypes' : 'Published as a tool' });
      // Links in other prototypes still point at the old address.
      if (result.linkedFrom.length) toast.add({ type: 'error', title: staleLinksMessage(result.linkedFrom) });
    } catch (e) {
      toast.add({ type: 'error', title: (e as Error).message });
    }
  }

  if (!editable) return [];
  return [isTool
    ? { label: 'Unpublish', icon: ArrowTurnBackwardIcon, onSelect: move }
    : { label: 'Publish as tool', icon: Wrench01Icon, onSelect: move }];
}
