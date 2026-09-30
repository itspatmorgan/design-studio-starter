// "New component" in a prototype system's navigation: a name (lowercase words joined by hyphens,
// which is also its file's name) and a short description. The file layer creates the component,
// its examples, and its page from templates (src/studio/systemScaffold.ts). The name is checked
// as you type, and again by the file layer.
import { useState } from 'react';
import { COMPONENT_NAME_MAX, componentNameProblem } from '@/studio/systemScaffold';
import { Button } from '@/studio/components/button';
import { Input } from '@/studio/components/input';
import { Textarea } from '@/studio/components/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taken: string[]; // the pages the system already has
  onCreate: (name: string, description: string) => Promise<void>;
};

export default function NewComponentDialog({ open, onOpenChange, taken, onCreate }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Remounted each time it opens, so it starts empty. */}
        <Form key={String(open)} taken={taken} onCreate={onCreate} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Form({ taken, onCreate, onCancel }: Pick<Props, 'taken' | 'onCreate'> & { onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // A problem shows once there's something to be wrong about.
  const nameError = name ? componentNameProblem(name, taken) : null;
  const ready = !componentNameProblem(name, taken);

  async function submit() {
    if (!ready || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onCreate(name, description.trim());
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>New component</DialogTitle>
      </DialogHeader>
      <label className="grid gap-1.5 text-sm font-medium">
        Name
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="icon-button"
          maxLength={COMPONENT_NAME_MAX + 8}
          aria-invalid={Boolean(nameError)}
          className="font-mono"
        />
        {nameError && <span className="text-xs font-normal text-destructive">A component's name {nameError}</span>}
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Description
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={1024}
          placeholder="A button that shows only an icon."
        />
        <span className="text-xs font-normal text-muted-foreground">Optional. One or two sentences on what it is.</span>
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!ready || saving}>{saving ? 'Creating…' : 'Create component'}</Button>
      </DialogFooter>
    </form>
  );
}
