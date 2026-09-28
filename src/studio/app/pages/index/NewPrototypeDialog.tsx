// "New prototype" on the Prototypes page, in dev: the same as pnpm new, from the app.
// It creates the folder in your space (scripts/create-prototype.js) and opens it.
import { useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { createPrototype, useMe } from '@/studio/app/data/files';
import { setManifest } from '@/studio/app/data/manifest';
import { Button } from '@/studio/components/button';
import { Input } from '@/studio/components/input';
import { Textarea } from '@/studio/components/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';

export default function NewPrototypeButton() {
  const me = useMe();
  const router = useRouter();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Only while the app runs locally, for contributors.
  if (!me) return null;

  async function create(form: FormData) {
    setSaving(true);
    setError(null);
    try {
      const result = await createPrototype(String(form.get('title') ?? ''), String(form.get('description') ?? ''));
      setManifest(result.manifest);
      await router.invalidate();
      setOpen(false);
      navigate({ to: '/$contributor/$prototype', params: { contributor: result.contributor, prototype: result.prototype } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" /> New prototype
      </Button>
      <Dialog open={open} onOpenChange={(o) => { setError(null); setOpen(o); }}>
        <DialogContent>
          <form key={String(open)} action={create} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>New prototype</DialogTitle>
              <DialogDescription>It goes in your folder, src/prototypes/{me}/, and opens right away.</DialogDescription>
            </DialogHeader>
            <label className="grid gap-1.5 text-sm font-medium">
              Title
              <Input name="title" required autoFocus placeholder="Agent Config" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Description
              <Textarea name="description" rows={3} placeholder="What is it exploring?" />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
