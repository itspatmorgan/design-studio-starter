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
import { ArtifactPreview, SystemPreview } from './ConceptPreview';
import { AgentSketch } from './Illustrations';

const steps = [
  { id: 'welcome', title: `Welcome to ${APP_NAME}`, description: 'Work with your agent to turn an idea into something you can try, discuss, and refine.' },
  ...(CONFIG.modules.systems ? [{ id: 'systems', title: 'Make it yours', description: 'Give your agent the components, theme, and product knowledge that make the work feel like yours.' }] : []),
  { id: 'build', title: 'Shape your first idea', description: 'Tell your agent who it’s for, what problem it solves, and what you want to explore. Choose the artifacts that help you think it through.' },
  { id: 'share', title: 'Share the work', description: 'Let others try your prototype, understand your thinking, and build on the code.' },
  { id: 'next', title: 'Choose where to start', description: 'Explore an example or describe your own idea to your agent. You can shape your studio as your needs grow.' },
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
  const sampleSystems = ['product', 'marketing'].filter(system => Object.hasOwn(manifest.systems, system));
  const finish = () => { complete(key); setOpen(false); };
  return <Dialog open={open} onOpenChange={value => { if (!value) finish(); }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto gap-6 p-6 sm:max-w-xl sm:p-8" showCloseButton={false}>
      <p className="text-xs font-medium text-muted-foreground" aria-live="polite">{step + 1} of {steps.length}</p>
      <div className="space-y-3" aria-live="polite" aria-atomic="true">
        <DialogTitle className="text-2xl font-semibold leading-tight tracking-tight">{current.title}</DialogTitle>
        <DialogDescription className="text-base leading-relaxed">{current.description}</DialogDescription>
      </div>
      <div className="min-h-64">
        {current.id === 'welcome' && <div className="space-y-4">
          <AgentSketch />
          <p className="text-sm leading-relaxed text-muted-foreground">Share your idea with your agent and let it handle the code. Then explore the result here and use your design judgment to guide what comes next.</p>
        </div>}
        {current.id === 'systems' && <div className="space-y-4">
          <SystemPreview />
          <p className="text-sm leading-relaxed text-muted-foreground">Start with an available system, curate a toolkit around your idea, or ask your agent to assess your team’s React components and theme. Importing a system is optional.</p>
          {!!sampleSystems.length && <p className="text-sm leading-relaxed text-muted-foreground">{sampleSystems.map(system => system === 'product' ? 'Product' : 'Marketing').join(' and ')} {sampleSystems.length === 1 ? 'is a learning example' : 'are learning examples'}. Customize, replace, or remove {sampleSystems.length === 1 ? 'it' : 'them'} to fit your needs.</p>}
        </div>}
        {current.id === 'build' && <div className="space-y-4">
          <ArtifactPreview />
          <p className="text-sm leading-relaxed text-muted-foreground">You don’t need every kind of artifact. Start with what helps answer your question, try it, and ask your agent to refine it.</p>
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
            <h3 className="text-sm font-medium">Try telling your agent</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">“Help me explore a feedback inbox for a support team. We want to make new messages easier to review. Suggest a small first version we can try.”</p>
          </div>
        </div>}
        {current.id === 'share' && <div className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Publish a viewing link</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Ask your agent to help choose a host, who can view the work, and a domain if you want one. People explore the published site while editing stays in the source folder.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Share a prototype</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Open the prototype on your published site and use Copy link. Local preview links only work where your development server is accessible.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Share the code and context</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Share the source repository so teammates and their agents can inspect, adapt, and continue the work. The code and thinking travel together.</p>
          </div>
        </div>}
        {current.id === 'next' && <div className="space-y-4">
          {!!examples.length && <p className="text-sm leading-relaxed text-muted-foreground">These prototypes are learning examples. After exploring, ask your agent to customize, replace, or remove them to fit your own needs.</p>}
          {!!examples.length && <div className="flex flex-wrap gap-2">{examples.map(p => <Button key={p.id} variant="outline" onClick={() => { finish(); void navigate(prototypeLink(p)); }}>{p.system === 'product' ? 'Product example' : p.system === 'marketing' ? 'Marketing example' : p.title}<HugeiconsIcon icon={ArrowRight01Icon} /></Button>)}</div>}
          <div className="space-y-4 rounded-xl border bg-muted/30 p-5">
            {CONFIG.modules.contributors && <div className="space-y-1">
              <h3 className="text-sm font-medium">Work with contributors</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{CONFIG.usage === 'team' ? 'Ask your agent to help someone join. Admins use Contributors to assign studio and system permissions.' : 'When you’re ready to collaborate, switch to Team in Studio settings. Your agent can help teammates join, and Admins can assign studio and system permissions.'} Share repository access separately.</p>
            </div>}
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Extend with modules</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Enable installed modules in Studio settings, or ask your agent to help add a capability. Start with what you need and grow from there.</p>
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
