import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/systems/studio/components/button';

export default function SystemSetup({ system, label }: { system: string; label: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const paths = [
    { id: 'curate', label: 'Curate a toolkit from open libraries', description: 'Start with an idea. Your agent helps choose the components and visual style you need.', prompt: `Help me build the “${label}” system (system ID: ${system}) from open libraries such as shadcn or Untitled UI. Ask what I want to prototype, then suggest a small set of components, styles, and assets. Let’s review the choices before adding only what we need. Leave other systems, prototypes, and the default unchanged.` },
    { id: 'import', label: 'Bring your own system', description: 'Your agent audits your existing React components, theme, and assets, then proposes a plan for bringing them into Studio.', prompt: `Help me audit my existing React design system and plan how to bring it into the “${label}” system (system ID: ${system}). Ask where the source is. Review its components, theme, fonts, icons, images, and dependencies. Propose an import plan that preserves component properties and visual styling. Explain required adaptations and any gaps. Review the plan with me before importing. Leave other systems, prototypes, and the default unchanged.` },
  ];
  async function copy(id: string, prompt: string) {
    try { await navigator.clipboard.writeText(prompt); setError(''); setCopied(id); }
    catch { setError('Could not copy. Select the prompt and paste it into your agent’s chat.'); }
  }
  return <div className="space-y-4">
    <div className="space-y-2 text-sm leading-6 text-muted-foreground">
      <p>Build and manage your system in collaboration with your agent. Your agent does the setup work. Use Design Studio to review the results, give feedback, and guide the next steps.</p>
      <p>Choose a starting point below. Copy its prompt into your coding agent’s chat to begin.</p>
    </div>
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
