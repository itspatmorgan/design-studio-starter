// Edits a prototype's meta.json from the app, in dev: its title, description, and the view
// it opens on. Saving writes meta.json (scripts/vite-files-plugin.js), the same file an agent
// would edit, and the app updates live. The prototype can also be deleted from here.
import { useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { deletePrototype, fileOp } from '@/studio/app/data/files';
import { setManifest, viewSlug } from '@/studio/app/data/manifest';
import type { Prototype } from '@/studio/app/data/types';
import { Button } from '@/studio/components/button';
import { Input } from '@/studio/components/input';
import { Textarea } from '@/studio/components/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';

// A view's name in meta.json "start": its path without the extension ("lofi/main").
const startKey = (v: { name: string; group: string | null }) => [v.group, viewSlug(v.name)].filter(Boolean).join('/');

type Props = { proto: Prototype; open: boolean; onOpenChange: (open: boolean) => void };

export default function EditPrototypeDialog({ proto, open, onOpenChange }: Props) {
  const router = useRouter();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const start = proto.start ? startKey(proto.start) : '';

  async function save(form: FormData) {
    setSaving(true);
    setError(null);
    try {
      const result = await fileOp(proto, {
        op: 'meta',
        title: String(form.get('title') ?? ''),
        description: String(form.get('description') ?? ''),
        start: String(form.get('start') ?? ''),
      });
      setManifest(result.manifest);
      await router.invalidate();
      onOpenChange(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    setError(null);
    try {
      const result = await deletePrototype(proto);
      setManifest(result.manifest);
      setConfirmingDelete(false);
      onOpenChange(false);
      // Leave first, so the deleted prototype's page is never reloaded.
      await navigate({ to: '/' });
      await router.invalidate();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={(o) => { setError(null); onOpenChange(o); }}>
      <DialogContent>
        {/* key: reset the fields to the saved values each time it opens */}
        <form key={String(open)} action={save} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Edit prototype</DialogTitle>
            <DialogDescription>Saved to its meta.json.</DialogDescription>
          </DialogHeader>
          <label className="grid gap-1.5 text-sm font-medium">
            Title
            <Input name="title" defaultValue={proto.title} required autoFocus />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Description
            <Textarea name="description" defaultValue={proto.description} rows={3} placeholder="What is it exploring?" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Opens on
            <select
              name="start"
              defaultValue={start}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">The default (prototype.tsx, or the first view)</option>
              {proto.views.map((v) => {
                const key = startKey(v);
                return <option key={key} value={key}>{key}</option>;
              })}
            </select>
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" className="mr-auto text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
              Delete prototype
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete {proto.title}?</DialogTitle>
          <DialogDescription>
            The whole prototype, src/prototypes/{proto.contributorKey}/{proto.id}/, goes to the Trash, so you can put it back from there. Its link stops working.
          </DialogDescription>
        </DialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
          <Button variant="destructive" disabled={saving} onClick={remove}>{saving ? 'Deleting…' : 'Move to Trash'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
