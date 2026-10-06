import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { Button } from '@/systems/studio/components/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/systems/studio/components/dialog';
import { APP_NAME } from '@/platform/core/api';
import { useManifest } from '@/platform/app/data/useManifest';
import { prototypeLink } from '@/platform/app/data/manifest';
import { complete, isComplete, progressKey } from './progress';
import { ArtifactPreview, SystemPreview } from './ConceptPreview';
import { AgentSketch } from './Illustrations';

const firstRequest = 'Help me turn an idea into a prototype. Ask me what I want to explore and who it’s for. Help me choose an example system or bring in my own, then build a first version I can try and refine.';
const steps = [
  { title: `Welcome to ${APP_NAME}`, description: 'A place to turn product ideas into working prototypes you can explore, discuss, and refine.' },
  { title: 'Keep the whole idea together', description: 'A prototype holds the screens, the flow, and the thinking behind an idea. Each piece is an artifact. Explore the different kinds below.' },
  { title: 'Build on a system that fits', description: 'A system gives your prototypes a shared design toolkit and gives your agent guidance about your product. Use it across as many prototypes as you need.' },
  { title: 'Explore first. Then make it yours.', description: 'Try an example and look through its artifacts. When you’re ready, ask your agent to help you make something of your own.' },
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
        {step === 0 && <div className="space-y-4">
          <AgentSketch />
          <p className="text-sm leading-relaxed text-muted-foreground">Describe what you want to explore in your agent’s chat. Your agent builds it; you try the result here and guide what happens next.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">Bring your design judgment and product knowledge. Your agent handles the code.</p>
        </div>}
        {step === 1 && <ArtifactPreview />}
        {step === 2 && <SystemPreview />}
        {step === 3 && <div className="space-y-4">
          {!!examples.length && <div className="flex flex-wrap gap-2">{examples.map(p => <Button key={p.id} variant="outline" onClick={() => { finish(); void navigate(prototypeLink(p)); }}>{p.title}<ArrowRight /></Button>)}</div>}
          <p className="text-sm leading-relaxed text-muted-foreground">This is your studio. Keep and adapt the example systems, or replace them with your own components and product context. You can change the example prototypes or start fresh.</p>
          <p className="text-sm text-muted-foreground">To start your first idea, copy this into your agent’s chat:</p>
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
