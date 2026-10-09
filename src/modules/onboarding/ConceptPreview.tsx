import { useState } from 'react';
import { Button } from '@/systems/studio/components/button';
import { CONFIG } from '@/platform/core/api';
import { ArtifactSketch, SystemSketch } from './Illustrations';

const systemParts = [
  { title: 'Theme & components', kind: 'toolkit', description: 'Bring your colors, typography, and reusable components into one toolkit, so every prototype starts with familiar building blocks like your team’s buttons and forms.' },
  { title: 'Context', kind: 'context', description: 'Share who your product is for, what they need, and the principles behind your decisions. Your agent uses that knowledge to make choices that fit your audience.' },
  { title: 'Skills', kind: 'skills', description: 'Give your agent reusable instructions for tasks your team does often, from writing in your brand’s voice to following a familiar design pattern.' },
];
const artifacts = [
  { module: 'document', title: 'Brief', kind: 'document', description: 'Define the problem, audience, and what you want to learn. Keep your brief and decisions alongside the work.' },
  { module: 'diagrams', title: 'Flow', kind: 'diagrams', description: 'Map the journey or logic before filling in the screens. Create a diagram your agent can edit with you.' },
  { module: 'view', title: 'Lo-fi', kind: 'view', description: 'Ask your agent for a lo-fi wireframe to explore layout, content, and navigation. Keep visual detail light while you try the structure.' },
  { module: 'view', title: 'Hi-fi', kind: 'view', description: 'Build a clickable prototype with your system’s components and theme. Try the interactions, then guide your agent through refinements. The code is yours to take with you.' },
  { module: 'canvas', title: 'Canvas', kind: 'canvas', description: 'Sketch and arrange screens, flows, and notes together. Use a canvas to explore connections or compare ideas with your agent.' },
].filter(type => CONFIG.modules[type.module] === true);

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
      {system ? <SystemSketch selected={index} /> : <ArtifactSketch kind={choice.kind} />}
      <p className="text-sm leading-relaxed text-muted-foreground">{choice.description}</p>
    </div>
  </div>;
}
export const SystemPreview = () => <ConceptPreview choices={systemParts} label="Explore the parts of a system" id="onboarding-system-preview" system />;
export const ArtifactPreview = () => <ConceptPreview choices={artifacts} label="Explore prototype artifacts" id="onboarding-artifact-preview" />;
