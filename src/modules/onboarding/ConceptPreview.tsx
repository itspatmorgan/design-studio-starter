import { useState } from 'react';
import { DialogDescription } from '@/systems/studio/components/dialog';
import { Button } from '@/systems/studio/components/button';
import { CONFIG } from '@/platform/core/api';
import { ArtifactSketch, SystemSketch, StorySketch } from './Illustrations';

const systemParts = [
  { title: 'Theme & components', kind: 'toolkit', description: 'Start with an available system, or ask your agent to bring in your team’s components and theme.' },
  { title: 'Context', kind: 'context', description: 'Give your agent product knowledge and design principles so its decisions fit your audience.' },
  { title: 'Skills', kind: 'skills', description: 'Skills teach your agent how to do repeatable tasks.' },
];
const artifacts = [
  { module: 'diagrams', title: 'Diagram', kind: 'diagrams', description: 'Map the journey or logic with your agent before filling in the screens.' },
  { module: 'view', title: 'Lo-fi wireframe', kind: 'lofi', description: 'Explore layout, content, and navigation with a simple wireframe.' },
  { module: 'view', title: 'Hi-fi prototype', kind: 'view', description: 'Try a clickable prototype, then guide your agent through refinements.' },
  { module: 'canvas', title: 'Canvas', kind: 'canvas', description: 'Arrange screens, flows, and notes together to explore connections or compare ideas.' },
].filter(type => CONFIG.modules[type.module] === true);
const collaboration = [
  { title: 'Share the source', kind: 'source', description: 'Share the repository so teammates and their agents can adapt the code and continue the work with its context.' },
  ...(CONFIG.modules.contributors ? [{ title: 'Contributor permissions', kind: 'permissions', description: CONFIG.usage === 'team'
    ? 'Ask your agent to help teammates join. Admins assign their studio and system permissions in Contributors. Repository access is separate.'
    : 'Switch to Team in Studio settings, then ask your agent to help teammates join. Admins assign permissions. Repository access is separate.' }] : []),
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
      {system ? <SystemSketch selected={index} /> : ['source', 'permissions', 'lofi'].includes(choice.kind) ? <StorySketch kind={choice.kind} /> : <ArtifactSketch kind={choice.kind} />}
      <DialogDescription className="text-base leading-relaxed">{choice.description}</DialogDescription>
    </div>
  </div>;
}
export const SystemPreview = () => <ConceptPreview choices={systemParts} label="Explore the parts of a system" id="onboarding-system-preview" system />;
export const ArtifactPreview = () => <ConceptPreview choices={artifacts} label="Explore prototype artifacts" id="onboarding-artifact-preview" />;

export const CollaborationPreview = () => <ConceptPreview choices={collaboration} label="Explore ways to build together" id="onboarding-collaboration-preview" />;
