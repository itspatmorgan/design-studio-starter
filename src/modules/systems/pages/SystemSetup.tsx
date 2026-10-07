import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/systems/studio/components/button';

export default function SystemSetup({ system }: { system: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const paths = [
    { id: 'curate', label: 'Curate a toolkit', description: 'Start with an idea. Your agent helps choose the components and visual style you need.', prompt: `Help me curate a toolkit for the system at src/systems/${system}/. Ask what I want to prototype, then propose a small set of components, theme tokens, and assets from shadcn or Untitled UI. Add only what we need. Preserve other systems and prototypes, and keep the current default.` },
    { id: 'import', label: 'Bring my product system', description: 'Start with your existing React components and theme. Your agent assesses what can be brought in faithfully.', prompt: `Help me bring my product’s React design system into src/systems/${system}/. Ask for the source and first prototype. Assess components, props, theme, fonts, icons, and dependencies. Preserve component APIs and theme fidelity. Explain required adaptations before importing a focused subset. Preserve other systems and prototypes, and keep the current default.` },
  ];
  async function copy(id: string, prompt: string) {
    try { await navigator.clipboard.writeText(prompt); setError(''); setCopied(id); }
    catch { setError('Could not copy. Select the prompt and paste it into your agent’s chat.'); }
  }
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Copy either prompt and paste it into your coding agent’s chat.</p>
    {paths.map(path => <section key={path.id} aria-labelledby={`setup-${path.id}`} className="rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`setup-${path.id}`} className="text-base font-semibold">{path.label}</h2>
        <Button variant="outline" size="sm" onClick={() => void copy(path.id, path.prompt)} aria-label={`Copy prompt: ${path.label}`}><HugeiconsIcon icon={Copy01Icon} data-icon="inline-start" />{copied === path.id ? 'Copied' : 'Copy prompt'}</Button>
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{path.description}</p>
      <p className="mt-4 select-text rounded-lg border border-border/50 bg-muted/40 p-4 text-sm leading-6">{path.prompt}</p>
    </section>)}
    <p role="status" className="text-sm text-muted-foreground">{error || (copied ? 'Prompt copied. Paste it into your coding agent’s chat to continue.' : '')}</p>
  </div>;
}
