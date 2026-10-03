import { useRouter } from '@tanstack/react-router';
import { renamePrototype } from '@/platform/app/data/files';
import { toast } from '@/platform/components/toast';
import { setManifest } from '@/platform/app/data/manifest';
import { addressOf } from '@/platform/core/roots';
import type { PrototypeInfo } from '@/platform/app/data/types';

// Saves a prototype's new title. A new title renames its folder, so its link
// changes; this follows it, staying on the same item, so the old address is never reloaded.
// Throws the server's message.
export function useRenamePrototype(proto: PrototypeInfo) {
  const router = useRouter();
  return async (change: { title: string }) => {
    const result = await renamePrototype(proto, change);
    setManifest(result.manifest);
    const { pathname, search, hash } = router.state.location;
    const oldBase = addressOf(proto.contributorKey, proto.id);
    const newBase = addressOf(proto.contributorKey, result.prototype);
    // Only a page inside the renamed prototype moves with it. From the Prototypes page, stay put.
    if (result.prototype !== proto.id && pathname.startsWith(oldBase)) {
      await router.navigate({
        to: `${newBase}${pathname.slice(oldBase.length)}` as never,
        search: search as never,
        hash,
        replace: true,
      });
    }
    await router.invalidate();
    if (result.prototype !== proto.id) {
      toast.add({ title: `Its link is now ${newBase}` });
    }
  };
}
