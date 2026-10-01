// "New prototype" on the Prototypes page, in dev: the same as pnpm new, from the app.
// It creates the folder in your space (scripts/create-prototype.js) and opens it. The menu beside it
// starts a tool prototype instead: the same prototype, from a starter for something people will use
// (publish it as a tool when it's ready: see src/studio/tools.ts).
import { useState } from 'react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { createPrototype, useMe } from '@/studio/app/data/files';
import { setManifest } from '@/studio/app/data/manifest';
import { Button, buttonVariants } from '@/studio/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/studio/components/dropdown-menu';
import { cn } from '@/lib/utils';
import { Input } from '@/studio/components/input';
import { Textarea } from '@/studio/components/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';

export default function NewPrototypeButton() {
  // Dev only: in the build, this is false and the rest is left out of the deployed site.
  if (!import.meta.env.DEV) return null;
  return <NewPrototype />;
}

function NewPrototype() {
  const me = useMe();
  const router = useRouter();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  // Whether the dialog makes a tool prototype (from the menu beside the button).
  const [tool, setTool] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Only while the app runs locally, for contributors.
  if (!me) return null;

  async function create(form: FormData) {
    setSaving(true);
    setError(null);
    try {
      const result = await createPrototype(String(form.get('title') ?? ''), String(form.get('description') ?? ''), tool);
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
      <div className="flex">
        <Button className="rounded-r-none" onClick={() => { setTool(false); setOpen(true); }}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" /> New prototype
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="More ways to start" className={cn(buttonVariants(), 'rounded-l-none border-l border-primary-foreground/25 px-2')}>
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuItem onClick={() => setTimeout(() => { setTool(false); setOpen(true); })}>New design prototype</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeout(() => { setTool(true); setOpen(true); })}>New tool prototype</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={open} onOpenChange={(o) => { setError(null); setOpen(o); }}>
        <DialogContent>
          <form key={String(open)} action={create} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{tool ? 'New tool prototype' : 'New prototype'}</DialogTitle>
              <DialogDescription>
                It's created in your folder, src/prototypes/{me}/, and opens when it's ready.
                {tool && ' Publish it as a tool when people are ready to use it.'}
              </DialogDescription>
            </DialogHeader>
            <label className="grid gap-1.5 text-sm font-medium">
              Title
              <Input name="title" required autoFocus placeholder="Agent Config" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Description
              <Textarea name="description" rows={3} placeholder={tool ? 'What does it make, and who uses it?' : 'What is it exploring?'} />
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
