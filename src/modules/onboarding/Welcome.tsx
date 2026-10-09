import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/systems/studio/components/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/systems/studio/components/dialog';
import { APP_NAME, CONFIG } from '@/platform/core/api';
import { useManifest } from '@/platform/app/data/useManifest';
import { useMe } from '@/platform/app/data/files';
import { prototypeLink } from '@/platform/app/data/manifest';
import { claimIntroduction, complete, progressKey, recordIntroduction } from './progress';
import { ArtifactPreview, SharingPreview, SystemPreview } from './ConceptPreview';
import { AgentSketch } from './Illustrations';

const steps = [
  { id: 'welcome', title: `Welcome to ${APP_NAME}` },
  ...(['view', 'document', 'diagrams', 'canvas'].some(module => CONFIG.modules[module]) ? [{ id: 'artifacts', title: 'Keep the whole idea together' }] : []),
  ...(CONFIG.modules.systems ? [{ id: 'systems', title: 'Make the work feel like yours' }] : []),
  { id: 'share', title: 'Share the work' },
  { id: 'modules', title: 'Add what you need' },
  { id: 'next', title: 'Start by exploring' },
];

export default function Welcome() {
  const manifest = useManifest();
  const navigate = useNavigate();
  const me = useMe();
  const key = progressKey(import.meta.env.BASE_URL, me);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (me === undefined) return;
    let active = true;
    void claimIntroduction(key).then(show => {
      if (!active) return;
      setOpen(show);
      if (show) recordIntroduction(key);
    });
    return () => { active = false; };
  }, [key, me]);
  const [step, setStep] = useState(0);
  const current = steps[Math.min(step, steps.length - 1)];
  const examples = manifest.prototypes.filter(p => p.status !== 'archived' && p.contributorKey === 'patrick' && ['feedback-inbox', 'design-studio-marketing'].includes(p.id)).sort((a, b) => Number(b.system === 'product') - Number(a.system === 'product'));
  const finish = () => { complete(key); setOpen(false); };
  return <Dialog open={open} onOpenChange={value => { if (!value) finish(); }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto gap-6 p-6 sm:max-w-xl sm:p-8" showCloseButton={false}>
      <p className="text-xs font-medium text-muted-foreground" aria-live="polite">{step + 1} of {steps.length}</p>
      <DialogTitle className="text-2xl font-semibold leading-tight tracking-tight" aria-live="polite">{current.title}</DialogTitle>
      <div className="min-h-64 flex flex-col justify-center">
        {current.id === 'welcome' && <div className="space-y-6">
          <AgentSketch />
          <DialogDescription className="text-base leading-relaxed">Describe your idea to your agent. Try what it builds here, then guide the next iteration.</DialogDescription>
        </div>}
        {current.id === 'artifacts' && <ArtifactPreview />}
        {current.id === 'systems' && <SystemPreview />}
        {current.id === 'share' && <SharingPreview />}
        {current.id === 'modules' && <DialogDescription className="text-lg leading-relaxed">Modules add capabilities to your studio. Enable installed modules in Studio settings, or ask your agent to add one you need.</DialogDescription>}
        {current.id === 'next' && <div className="space-y-6">
          <DialogDescription className="text-base leading-relaxed">{examples.length ? 'Try a learning example below, or describe your own idea to your agent to start a prototype.' : 'Describe your idea, who it’s for, and what you want to learn. Ask your agent for a first prototype you can try.'}</DialogDescription>
          {!!examples.length && <div className="flex flex-wrap gap-2">{examples.map(p => <Button key={p.id} variant="outline" onClick={() => { finish(); void navigate(prototypeLink(p)); }}>{p.system === 'product' ? 'Product example' : p.system === 'marketing' ? 'Marketing example' : p.title}<HugeiconsIcon icon={ArrowRight01Icon} /></Button>)}</div>}
        </div>}
      </div>
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={finish}>Skip introduction</Button>
        <div className="flex justify-end gap-2">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button onClick={() => step === steps.length - 1 ? finish() : setStep(step + 1)}>{step === 0 ? 'Show me around' : step === steps.length - 1 ? 'Explore my studio' : 'Next'}<HugeiconsIcon icon={ArrowRight01Icon} /></Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
