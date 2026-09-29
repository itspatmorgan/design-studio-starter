// Edits a prototype's title and description from the app, in dev. (Which item it opens on is set
// from the file tree: right-click, Set as start.) Saving writes meta.json (scripts/vite-files-plugin.js),
// the same file an agent would edit, and a new title renames the folder to match. The app updates live.
import { useState } from 'react';
import { useRenamePrototype } from '@/studio/app/pages/prototype/useRenamePrototype';
import type { Prototype } from '@/studio/app/data/types';
import { Button } from '@/studio/components/button';
import { Input } from '@/studio/components/input';
import { Textarea } from '@/studio/components/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';

type Props = { proto: Prototype; open: boolean; onOpenChange: (open: boolean) => void };

export default function EditPrototypeDialog({ proto, open, onOpenChange }: Props) {
  const applyRename = useRenamePrototype(proto);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(form: FormData) {
    setSaving(true);
    setError(null);
    try {
      await applyRename({ title: String(form.get('title') ?? ''), description: String(form.get('description') ?? '') });
      onOpenChange(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setError(null); onOpenChange(o); }}>
      <DialogContent>
        {/* key: reset the fields to the saved values each time it opens */}
        <form key={String(open)} action={save} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Edit prototype</DialogTitle>
            <DialogDescription>A new title also renames the prototype's folder, so its link changes.</DialogDescription>
          </DialogHeader>
          <label className="grid gap-1.5 text-sm font-medium">
            Title
            <Input name="title" defaultValue={proto.title} required autoFocus />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Description
            <Textarea name="description" defaultValue={proto.description} rows={3} placeholder="What is it exploring?" />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
