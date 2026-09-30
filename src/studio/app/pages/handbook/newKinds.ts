// What each kind of "New" in the Handbook is called, and how it looks in a menu. What can be made
// where is src/studio/handbookRules.ts.
import { File01Icon, FolderAddIcon, MagicWand01Icon } from '@hugeicons/core-free-icons';
import type { NewKind } from '@/studio/handbookRules';

export const NEW_KINDS: Record<NewKind, { label: string; icon: typeof File01Icon }> = {
  document: { label: 'New document', icon: File01Icon },
  folder: { label: 'New folder', icon: FolderAddIcon },
  skill: { label: 'New skill', icon: MagicWand01Icon },
  file: { label: 'New file', icon: File01Icon },
};
