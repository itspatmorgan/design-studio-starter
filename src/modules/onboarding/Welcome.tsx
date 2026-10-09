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
import { ArtifactPreview, CollaborationPreview, SystemPreview } from './ConceptPreview';
import { AgentSketch, StorySketch } from './Illustrations';

const steps = [
  { id: 'welcome', title: `Welcome to ${APP_NAME}` },
  ...(CONFIG.modules.systems ? [{ id: 'systems', title: 'Make it yours' }] : []),
  { id: 'brief', title: 'Start with a brief' },
  ...(['view', 'diagrams', 'canvas'].some(module => CONFIG.modules[module]) ? [{ id: 'artifacts', title: 'Give your idea shape' }] : []),
  { id: 'publish', title: 'Publish your prototype' },
  { id: 'share', title: 'Share it for feedback' },
  { id: 'collaborate', title: 'Build together' },
  { id: 'modules', title: 'Extend when you need to' },
  { id: 'next', title: 'Start exploring' },
];
const stories = {
  brief: { kind: CONFIG.modules.document ? 'brief' : 'brief-chat', description: CONFIG.modules.document
    ? 'Save your brief as a Markdown document in your prototype with your agent. It becomes lasting context for the work.'
    : 'Tell your agent the problem, who it’s for, and what you want to learn.' },
  publish: { kind: 'publish', description: 'Ask your agent to publish your studio so others can view it online. A custom domain is optional.' },
  share: { kind: 'share', description: 'Use Copy link on your published prototype so someone else can try it and give feedback.' },
  modules: { kind: 'modules', description: 'Modules add capabilities to your studio. Enable installed modules in Studio settings, or ask your agent to add one you need.' },
};

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
  const story = stories[current.id as keyof typeof stories];
  const finish = () => { complete(key); setOpen(false); };
  return <Dialog open={open} onOpenChange={value => { if (!value) finish(); }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto gap-6 p-6 sm:max-w-xl sm:p-8" showCloseButton={false}>
      <div role="progressbar" aria-label="Introduction progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1} aria-valuetext={current.title} className="flex items-center gap-2 h-2">
        {steps.map((item, i) => <span key={item.id} aria-hidden="true" className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-foreground' : i < step ? 'w-1.5 bg-foreground/40' : 'w-1.5 bg-muted-foreground/20'}`} />)}
      </div>
      <DialogTitle className="text-2xl font-semibold leading-tight tracking-tight" aria-live="polite">{current.title}</DialogTitle>
      <div className="min-h-64 flex flex-col justify-center">
        {current.id === 'welcome' && <div className="space-y-6">
          <AgentSketch />
          <DialogDescription className="text-base leading-relaxed">Let’s walk through making Studio yours, shaping your first prototype, and sharing the work with others.</DialogDescription>
        </div>}
        {current.id === 'artifacts' && <ArtifactPreview />}
        {current.id === 'systems' && <SystemPreview />}
        {current.id === 'collaborate' && <CollaborationPreview />}
        {story && <div className="space-y-6">
          <StorySketch kind={story.kind} />
          <DialogDescription className="text-base leading-relaxed">{story.description}</DialogDescription>
        </div>}
        {current.id === 'next' && <div className="space-y-6">
          <StorySketch kind="explore" />
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
