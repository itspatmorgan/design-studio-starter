// "New skill" in the Handbook's Skills tab. A skill has to follow the Agent Skills format
// (https://agentskills.io/specification): a name in lowercase words joined by hyphens, which is
// also its folder's name, and a description that says what it does and when to use it. Those are
// checked here as you type (src/studio/skills.ts), and again by the file layer.
import { useState } from 'react';
import { DESCRIPTION_MAX, NAME_MAX, descriptionProblem, nameProblem } from '@/studio/skills';
import { Button } from '@/studio/components/button';
import { Input } from '@/studio/components/input';
import { Textarea } from '@/studio/components/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';

type Props = { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (name: string, description: string) => Promise<void> };

export default function NewSkillDialog({ open, onOpenChange, onCreate }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Remounted each time it opens, so it starts empty. */}
        <Form key={String(open)} onCreate={onCreate} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function Form({ onCreate, onCancel }: { onCreate: Props['onCreate']; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Problems show once there's something to be wrong about.
  const nameError = name ? nameProblem(name) : null;
  const descriptionError = description ? descriptionProblem(description) : null;
  const ready = !nameProblem(name) && !descriptionProblem(description);

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
        <DialogTitle>New skill</DialogTitle>
        <DialogDescription>A procedure your agent follows when you ask. It's created as a folder in src/handbook/skills/, with a SKILL.md that your agent reads to decide when to use it.</DialogDescription>
      </DialogHeader>
      <label className="grid gap-1.5 text-sm font-medium">
        Name
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="review-design"
          maxLength={NAME_MAX + 8}
          aria-invalid={Boolean(nameError)}
          className="font-mono"
        />
        <span className={nameError ? 'text-xs font-normal text-destructive' : 'text-xs font-normal text-muted-foreground'}>
          {nameError ? `A skill's name ${nameError}` : 'Lowercase letters, numbers, and hyphens. It\'s also the folder\'s name.'}
        </span>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Description
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Reviews a design against the team's principles. Use when someone asks for a critique or a principles check."
          aria-invalid={Boolean(descriptionError)}
        />
        <span className={descriptionError ? 'text-xs font-normal text-destructive' : 'text-xs font-normal text-muted-foreground'}>
          {descriptionError ? `The description ${descriptionError}` : `What it does and when to use it, up to ${DESCRIPTION_MAX} characters. Agents read this to decide when to use the skill.`}
        </span>
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!ready || saving}>{saving ? 'Creating…' : 'Create skill'}</Button>
      </DialogFooter>
    </form>
  );
}
