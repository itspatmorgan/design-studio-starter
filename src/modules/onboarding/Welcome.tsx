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
  { title: 'Keep the whole idea together', description: 'A prototype brings your screens, flows, and ideas together as artifacts. They’re files you own, saved in open formats for use with compatible tools.' },
  { title: 'Give your prototypes a shared foundation', description: 'A system brings your design toolkit and product knowledge together, helping your agent build prototypes that feel like your product.' },
  { title: 'Start by exploring', description: 'Open an example prototype, try its screens, and look through its artifacts. You’ll see how a prototype and its system work together.' },
];

export default function Welcome() {
  const manifest = useManifest();
  const navigate = useNavigate();
  const key = progressKey(import.meta.env.BASE_URL);
  const [open, setOpen] = useState(() => !isComplete(key));
  const [step, setStep] = useState(0);
  const examples = manifest.prototypes.filter(p => p.status !== 'archived' && p.contributorKey === 'patrick' && ['feedback-inbox', 'design-studio-marketing'].includes(p.id)).sort((a, b) => Number(b.system === 'product') - Number(a.system === 'product'));
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
          <p className="text-sm leading-relaxed text-muted-foreground">Share your idea with your agent and let it handle the code. Then explore the result here and use your design judgment to guide what comes next.</p>
        </div>}
        {step === 1 && <ArtifactPreview />}
        {step === 2 && <SystemPreview />}
        {step === 3 && <div className="space-y-4">
          {!!examples.length && <div className="flex flex-wrap gap-2">{examples.map(p => <Button key={p.id} variant="outline" onClick={() => { finish(); void navigate(prototypeLink(p)); }}>{p.system === 'product' ? 'Product example' : p.system === 'marketing' ? 'Marketing example' : p.title}<HugeiconsIcon icon={ArrowRight01Icon} /></Button>)}</div>}
          <div className="space-y-4 rounded-xl border bg-muted/30 p-5">
            <p className="text-sm font-medium">When you’re ready to make something, work with your agent to:</p>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Try your own prototype</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Describe an idea and who it’s for. Use an existing system to build a first version you can try and refine.</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Set up your own system</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Start with the included components from shadcn/ui and Untitled UI. Your agent can also help bring in and adapt your team’s custom components.</p>
            </div>
          </div>
        </div>}
      </div>
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={finish}>Skip introduction</Button>
        <div className="flex gap-2">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === 0 ? 'Show me around' : step === steps.length - 1 ? 'Explore my studio' : 'Next'}<HugeiconsIcon icon={ArrowRight01Icon} /></Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
