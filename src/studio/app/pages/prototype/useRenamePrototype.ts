import { useRouter } from '@tanstack/react-router';
import { renamePrototype } from '@/studio/app/data/files';
import { toast } from '@/studio/components/toast';
import { setManifest } from '@/studio/app/data/manifest';
import type { PrototypeInfo } from '@/studio/app/data/types';

// Saves a prototype's new title (and description). A new title renames its folder, so its link
// changes; this follows it, staying on the same item, so the old address is never reloaded.
// Throws the server's message.
export function useRenamePrototype(proto: PrototypeInfo) {
  const router = useRouter();
  return async (change: { title: string; description?: string }) => {
    const result = await renamePrototype(proto, change);
    setManifest(result.manifest);
    const { pathname, search, hash } = router.state.location;
    const oldBase = `/${proto.contributorKey}/${proto.id}`;
    // Only a page inside the renamed prototype moves with it. From the Prototypes page, stay put.
    if (result.prototype !== proto.id && pathname.startsWith(oldBase)) {
      await router.navigate({
        to: `/${proto.contributorKey}/${result.prototype}${pathname.slice(oldBase.length)}` as never,
        search: search as never,
        hash,
        replace: true,
      });
    }
    await router.invalidate();
    if (result.prototype !== proto.id) {
      toast.add({ title: `Its link is now /${proto.contributorKey}/${result.prototype}` });
    }
  };
}
