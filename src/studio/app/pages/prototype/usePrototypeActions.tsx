// What you can do to a prototype (or tool) from a menu: the prototype's "…" menu in its navigation
// (PrototypeHeader.tsx) and the "…" on its card (PrototypeCardMenu.tsx) share this, so they offer the same
// things. Reaching it (copy its link; locally, open it in your editor) is open to everyone. Changing it
// (edit, archive, publish, delete) is only for its owner, or a tool's maintainers (ownsPrototype). That
// only decides what is shown: the dev server checks ownership again on every change.
import { useState, type ReactNode } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import {
  Archive02Icon, ArchiveRestoreIcon, ArrowTurnBackwardIcon, Copy01Icon, Delete02Icon, FileEditIcon, Folder01Icon, Link01Icon, PencilEdit02Icon, Wrench01Icon,
} from '@hugeicons/core-free-icons';
import { fileOp, openInEditor, ownsPrototype, publishTool, repoPath, revealInFinder, unpublishTool, useMe } from '@/studio/app/data/files';
import { prototypeLink, setManifest } from '@/studio/app/data/manifest';
import type { PrototypeInfo } from '@/studio/app/data/types';
import { TOOLS_KEY } from '@/studio/roots';
import { toast } from '@/studio/components/toast';
import EditPrototypeDialog from '@/studio/app/pages/prototype/EditPrototypeDialog';
import DeletePrototypeDialog from '@/studio/app/pages/prototype/DeletePrototypeDialog';
type Icon = typeof Link01Icon;

export type Action = { label: string; icon: Icon; onSelect: () => void; destructive?: boolean };

export function usePrototypeActions(proto: PrototypeInfo) {
  const router = useRouter();
  const navigate = useNavigate();
  const me = useMe();
  // import.meta.env.DEV is false in the build, so editing isn't in the deployed site.
  const local = import.meta.env.DEV && me !== null;
  const isTool = proto.contributorKey === TOOLS_KEY;
  const editable = local && ownsPrototype(proto, me);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Archiving leaves the whole prototype out of the deployed site. Here it stays, marked, so it can be opened and brought back.
  async function setArchived(archived: boolean) {
    try {
      const result = await fileOp(proto, { op: 'meta', status: archived ? 'archived' : 'active' });
      setManifest(result.manifest);
      await router.invalidate();
      toast.add({ title: archived ? 'Archived. The deployed site leaves it out.' : 'Unarchived' });
    } catch (e) {
      toast.add({ type: 'error', title: (e as Error).message });
    }
  }

  // Publishing moves the prototype's folder into src/tools/, so its address changes (and back, for Unpublish).
  async function moveTool() {
    try {
      const result = await (isTool ? unpublishTool : publishTool)(proto);
      setManifest(result.manifest);
      await router.invalidate();
      navigate({ to: '/$contributor/$prototype', params: { contributor: result.contributor, prototype: result.id } });
      toast.add({ title: isTool ? 'Moved back to your prototypes' : 'Published as a tool' });
      // Links in other prototypes still point at the old address.
      if (result.linkedFrom.length) {
        toast.add({ type: 'error', title: `${result.linkedFrom.length === 1 ? 'A file links' : `${result.linkedFrom.length} files link`} to the old address and need updating: ${result.linkedFrom.slice(0, 2).join(', ')}${result.linkedFrom.length > 2 ? ', …' : ''}` });
      }
    } catch (e) {
      toast.add({ type: 'error', title: (e as Error).message });
    }
  }

  const copyLink = () => {
    const href = router.buildLocation(prototypeLink(proto)).href;
    navigator.clipboard.writeText(new URL(href, location.origin).href);
    toast.add({ title: 'Link copied' });
  };

  // The groups of a menu, in the order they appear (see menuGroups.ts): reach it; change it; delete it, last and alone.
  const groups: (Action | false)[][] = [
    [
      local && { label: 'Open in editor', icon: FileEditIcon, onSelect: () => openInEditor(proto, '') },
      local && { label: 'Reveal in Finder', icon: Folder01Icon, onSelect: () => revealInFinder(proto, '') },
      { label: 'Copy link', icon: Link01Icon, onSelect: copyLink },
      local && { label: 'Copy path', icon: Copy01Icon, onSelect: () => { navigator.clipboard.writeText(repoPath(proto, '')); toast.add({ title: 'Path copied' }); } },
    ],
    [
      editable && { label: 'Edit', icon: PencilEdit02Icon, onSelect: () => setEditing(true) },
      editable && (proto.status === 'archived'
        ? { label: 'Unarchive', icon: ArchiveRestoreIcon, onSelect: () => setArchived(false) }
        : { label: 'Archive', icon: Archive02Icon, onSelect: () => setArchived(true) }),
      editable && (isTool
        ? { label: 'Unpublish', icon: ArrowTurnBackwardIcon, onSelect: moveTool }
        : { label: 'Publish as tool', icon: Wrench01Icon, onSelect: moveTool }),
    ],
    [editable && { label: 'Delete', icon: Delete02Icon, onSelect: () => setDeleting(true), destructive: true }],
  ];

  // The dialogs those actions open. Render them anywhere under the menu.
  const dialogs: ReactNode = editable ? (
    <>
      <EditPrototypeDialog proto={proto} open={editing} onOpenChange={setEditing} />
      <DeletePrototypeDialog proto={proto} open={deleting} onOpenChange={setDeleting} />
    </>
  ) : null;

  return { local, editable, isTool, groups, dialogs };
}
