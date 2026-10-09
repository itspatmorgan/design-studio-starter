import { useState } from 'react';
import { DialogDescription } from '@/systems/studio/components/dialog';
import { Button } from '@/systems/studio/components/button';
import { CONFIG } from '@/platform/core/api';
import { ArtifactSketch, SystemSketch } from './Illustrations';

const systemParts = [
  { title: 'Theme & components', kind: 'toolkit', description: 'Start with an available system, or ask your agent to bring in your team’s components and theme.' },
  { title: 'Context', kind: 'context', description: 'Give your agent product knowledge and design principles so its decisions fit your audience.' },
  { title: 'Skills', kind: 'skills', description: 'Give your agent reusable instructions for tasks your team does often.' },
];
const artifacts = [
  { module: 'document', title: 'Brief', kind: 'document', description: 'Define the problem, audience, and what you want to learn. Keep that thinking alongside the work.' },
  { module: 'diagrams', title: 'Flow', kind: 'diagrams', description: 'Map the journey or logic with your agent before filling in the screens.' },
  { module: 'view', title: 'Lo-fi', kind: 'view', description: 'Explore layout, content, and navigation with a simple wireframe.' },
  { module: 'view', title: 'Hi-fi', kind: 'view', description: 'Try a clickable prototype, then guide your agent through refinements.' },
  { module: 'canvas', title: 'Canvas', kind: 'canvas', description: 'Arrange screens, flows, and notes together to explore connections or compare ideas.' },
].filter(type => CONFIG.modules[type.module] === true);
const sharing = [
  { title: 'Viewing link', kind: 'sharing', description: 'Ask your agent to publish your studio. Use Copy link on the published prototype so others can try it.' },
  { title: 'Source code', kind: 'sharing', description: 'Share the repository so teammates and their agents can adapt the code and continue the work with its context.' },
  ...(CONFIG.modules.contributors ? [{ title: 'Contributors', kind: 'sharing', description: CONFIG.usage === 'team'
    ? 'Give teammates repository access, then ask your agent to help them join. Admins assign their studio and system permissions in Contributors.'
    : 'Switch to Team in Studio settings to collaborate. Share repository access, then ask your agent to help teammates join and assign permissions.' }] : []),
];

type Choice = { title: string; kind: string; description: string };
function ConceptPreview({ choices, label, id, system = false }: { choices: Choice[]; label: string; id: string; system?: boolean }) {
  const [index, setIndex] = useState(0);
  const choice = choices[index];
  if (!choice) return null;
  return <div className="space-y-4">
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {choices.map((item, i) => <Button key={item.title} variant={index === i ? 'secondary' : 'ghost'} size="sm" aria-pressed={index === i} aria-controls={id} onClick={() => setIndex(i)}>{item.title}</Button>)}
    </div>
    <div id={id} className="space-y-3 rounded-xl border bg-muted/30 p-4" aria-live="polite" aria-atomic="true">
      {system ? <SystemSketch selected={index} /> : choice.kind !== 'sharing' && <ArtifactSketch kind={choice.kind} />}
      <DialogDescription className="text-base leading-relaxed">{choice.description}</DialogDescription>
    </div>
  </div>;
}
export const SystemPreview = () => <ConceptPreview choices={systemParts} label="Explore the parts of a system" id="onboarding-system-preview" system />;
export const ArtifactPreview = () => <ConceptPreview choices={artifacts} label="Explore prototype artifacts" id="onboarding-artifact-preview" />;

export const SharingPreview = () => <ConceptPreview choices={sharing} label="Explore ways to share your work" id="onboarding-sharing-preview" />;
