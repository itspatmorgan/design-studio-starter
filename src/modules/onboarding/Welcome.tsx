import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Copy, Layers, MousePointer2, Sparkles } from 'lucide-react';
import { Button } from '@/systems/studio/components/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/systems/studio/components/dialog';
import { APP_NAME } from '@/platform/core/api';
import { useManifest } from '@/platform/app/data/useManifest';
import { prototypeLink } from '@/platform/app/data/manifest';
import { complete, isComplete, progressKey } from './progress';
import { ArtifactPreview, SystemPreview } from './ConceptPreview';

const firstRequest = 'Help me make this studio my own. Ask me what I want to design, then help me decide whether to customize an example system or bring in my own. Once the system fits, help me start my first prototype.';
const steps = [
  { title: `Welcome to ${APP_NAME}`, description: 'Turn your ideas into something you can try. Here’s a quick introduction before you explore.' },
  { title: 'Systems are your foundation', description: 'A system brings together your design toolkit and what your agent needs to know about your product.' },
  { title: 'Prototypes bring ideas to life', description: 'A prototype is a place to explore an idea using a system’s toolkit and guidance. The pieces inside it are called artifacts.' },
  { title: 'Make the studio your own', description: 'Explore the examples, then work with your agent to customize them or bring in your own systems. You can adapt a prototype or start fresh.' },
];

export default function Welcome() {
  const manifest = useManifest();
  const navigate = useNavigate();
  const key = progressKey(import.meta.env.BASE_URL);
  const [open, setOpen] = useState(() => !isComplete(key));
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const examples = manifest.prototypes.filter(p => p.status !== 'archived' && p.contributorKey === 'patrick' && ['feedback-inbox', 'design-studio-marketing'].includes(p.id));
  const finish = () => { complete(key); setOpen(false); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(firstRequest); setCopied(true); setCopyFailed(false); }
    catch { setCopyFailed(true); }
  };
  return <Dialog open={open} onOpenChange={value => { if (!value) finish(); }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto gap-6 p-6 sm:max-w-xl sm:p-8" showCloseButton={false}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground" aria-live="polite">{step + 1} of {steps.length} · A quick introduction</p>
        <Button variant="ghost" size="sm" onClick={finish}>Skip introduction</Button>
      </div>
      <div className="space-y-3" aria-live="polite" aria-atomic="true">
        <DialogTitle className="text-2xl font-semibold leading-tight tracking-tight">{steps[step].title}</DialogTitle>
        <DialogDescription className="text-base leading-relaxed">{steps[step].description}</DialogDescription>
      </div>
      <div className="min-h-64">
        {step === 0 && <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-5">
            <div className="flex-1 space-y-3"><Layers className="size-6" /><p className="font-medium">Your system</p><p className="text-sm text-muted-foreground">The foundation</p></div>
            <ArrowRight className="size-5 text-muted-foreground" aria-hidden="true" />
            <div className="flex-1 space-y-3"><MousePointer2 className="size-6" /><p className="font-medium">Your prototypes</p><p className="text-sm text-muted-foreground">Ideas you can try</p></div>
          </div>
          <div className="flex gap-3 px-1"><Sparkles className="mt-1 size-5 shrink-0" aria-hidden="true" /><p className="text-sm leading-relaxed text-muted-foreground">You direct the work. Your coding agent builds it. Review the results here and tell your agent what to refine.</p></div>
        </div>}
        {step === 1 && <SystemPreview />}
        {step === 2 && <ArtifactPreview />}
        {step === 3 && <div className="space-y-4">
          {!!examples.length && <div className="flex flex-wrap gap-2">{examples.map(p => <Button key={p.id} variant="outline" onClick={() => { finish(); void navigate(prototypeLink(p)); }}>{p.title}<ArrowRight /></Button>)}</div>}
          <p className="text-sm text-muted-foreground">When you’re ready, copy this into your agent’s chat in the studio folder:</p>
          <blockquote className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed select-text">{firstRequest}</blockquote>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => void copy()}>{copied ? <Check /> : <Copy />}{copied ? 'Copied' : 'Copy request'}</Button>
            <p aria-live="polite" className="text-xs text-muted-foreground">{copyFailed ? 'Select the request above and copy it into your chat.' : copied ? 'Paste this into your agent’s chat.' : 'Your agent handles the technical steps.'}</p>
          </div>
        </div>}
      </div>
      <div className="flex items-center justify-between gap-3 border-t pt-5">
        <div className="flex gap-1.5" aria-hidden="true">{steps.map((_, index) => <span key={index} className={`h-1.5 w-5 rounded-full ${index === step ? 'bg-foreground' : 'bg-muted'}`} />)}</div>
        <div className="flex gap-2">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === 0 ? 'Show me around' : step === steps.length - 1 ? 'Explore my studio' : 'Next'}<ArrowRight /></Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
