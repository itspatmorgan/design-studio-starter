import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/systems/studio/components/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/systems/studio/components/dialog';
import { APP_NAME } from '@/platform/core/api';
import { useManifest } from '@/platform/app/data/useManifest';
import { prototypeLink } from '@/platform/app/data/manifest';
import { complete, isComplete, progressKey } from './progress';
import { ArtifactPreview, SystemPreview } from './ConceptPreview';
import { AgentSketch } from './Illustrations';

const steps = [
  { title: `Welcome to ${APP_NAME}`, description: 'A place to turn product ideas into working prototypes you can explore, discuss, and refine.' },
  { title: 'Keep the whole idea together', description: 'A prototype holds the screens, the flow, and the thinking behind an idea. Each piece is an artifact. Explore the different kinds below.' },
  { title: 'Build on a system that fits', description: 'A system gives your prototypes a shared design toolkit and gives your agent guidance about your product. Use it across as many prototypes as you need.' },
  { title: 'Start by exploring', description: 'Open an example, try its screens, and look through its artifacts. You’ll see how a prototype and its system work together.' },
];

export default function Welcome() {
  const manifest = useManifest();
  const navigate = useNavigate();
  const key = progressKey(import.meta.env.BASE_URL);
  const [open, setOpen] = useState(() => !isComplete(key));
  const [step, setStep] = useState(0);
  const examples = manifest.prototypes.filter(p => p.status !== 'archived' && p.contributorKey === 'patrick' && ['feedback-inbox', 'design-studio-marketing'].includes(p.id));
  const finish = () => { complete(key); setOpen(false); };
  return <Dialog open={open} onOpenChange={value => { if (!value) finish(); }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto gap-6 p-6 sm:max-w-xl sm:p-8" showCloseButton={false}>
      <p className="text-xs font-medium text-muted-foreground" aria-live="polite">{step + 1} of {steps.length}</p>
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
          {!!examples.length && <div className="flex flex-wrap gap-2">{examples.map(p => <Button key={p.id} variant="outline" onClick={() => { finish(); void navigate(prototypeLink(p)); }}>{p.title}<HugeiconsIcon icon={ArrowRight01Icon} /></Button>)}</div>}
          <div className="space-y-4 rounded-xl border bg-muted/30 p-5">
            <p className="text-sm font-medium">When you’re ready to make something, work with your agent to:</p>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Try your own prototype</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Describe an idea and who it’s for. Use an existing system to build a first version you can try and refine.</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Set up your own system</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Bring your team’s components and product context. Adapt an example system or replace it with your own.</p>
            </div>
          </div>
        </div>}
      </div>
      <div className="flex items-center justify-between gap-3 border-t pt-5">
        <Button variant="ghost" onClick={finish}>Skip introduction</Button>
        <div className="flex gap-2">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === 0 ? 'Show me around' : step === steps.length - 1 ? 'Explore my studio' : 'Next'}<HugeiconsIcon icon={ArrowRight01Icon} /></Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
