import { useState } from 'react';
import { Shapes } from 'lucide-react';
import { Button } from '@/systems/studio/components/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/systems/studio/components/empty';

export default function SystemSetup({ system }: { system: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const prompts = [
    { id: 'curate', label: 'Curate a toolkit', description: 'Start with what you want to prototype and choose a small set of components, theme choices, and assets.', prompt: `Help me curate the system at src/systems/${system}/ for my first prototype. Ask what I want to make, then propose the smallest useful toolkit, theme, and assets. Preserve existing systems and prototypes. Keep the current default system until I choose to change it.` },
    { id: 'import', label: 'Bring my product system', description: 'Assess your existing React components, theme, and assets before importing them.', prompt: `Help me assess my existing React components, theme, and assets for the system at src/systems/${system}/. Ask for the source and first intended prototype. Check component APIs, exact theme values, assets, and application dependencies. Propose a maintainable subset and explain fidelity gaps before importing. Preserve existing systems and prototypes.` },
  ];
  async function copy(id: string, prompt: string) {
    try { await navigator.clipboard.writeText(prompt); setError(''); setCopied(id); }
    catch { setError('Could not copy. Select the prompt below and paste it into your agent’s chat.'); }
  }
  return <Empty className="mb-8 min-h-[16rem] border border-solid border-border/50 bg-muted/40">
    <EmptyHeader><EmptyMedia variant="icon"><Shapes /></EmptyMedia><EmptyTitle>Build your system with your agent</EmptyTitle><EmptyDescription>No components have been added yet. Bring in your product’s toolkit or curate one for what you want to prototype. The scaffold includes a starting theme you can replace.</EmptyDescription></EmptyHeader>
    <EmptyContent className="max-w-none text-left">
      {prompts.map(item => <div key={item.id} className="w-full rounded-lg border border-border bg-background p-4"><h3 className="text-sm font-semibold">{item.label}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p><details className="mt-2 text-sm"><summary className="cursor-pointer">View prompt</summary><p className="mt-2 select-text leading-6">{item.prompt}</p></details><Button variant="outline" size="sm" className="mt-3" onClick={() => void copy(item.id, item.prompt)} aria-label={`Copy prompt: ${item.label}`}>{copied === item.id ? 'Copied' : 'Copy prompt'}</Button></div>)}
      <p role="status" className="text-sm text-muted-foreground">{error || (copied ? 'Paste the prompt into your coding agent’s chat to continue.' : 'Copy a prompt and paste it into your coding agent’s chat.')}</p>
    </EmptyContent>
  </Empty>;
}
