import { useState } from 'react';
import { Button } from '@/systems/studio/components/button';
import { CONFIG } from '@/platform/core/api';
import { ArtifactSketch, SystemSketch } from './Illustrations';

const systemParts = [
  { title: 'Theme & components', kind: 'toolkit', description: 'The colors, type, and reusable components that make your prototypes look and feel like your product.', example: 'Use your team’s buttons, forms, and other building blocks.' },
  { title: 'Context', kind: 'context', description: 'What your agent should know about your product, your audience, and your design principles.', example: '“Our users review feedback every morning. Help them find what needs attention.”' },
  { title: 'Skills', kind: 'skills', description: 'Instructions that help your agent carry out tasks in the way your team wants.', example: 'Write in your brand’s voice, or follow a familiar design pattern.' },
];
const artifacts = [
  { module: 'view', title: 'Views', kind: 'view', description: 'Working screens you can click through to explore how an idea feels.', example: 'Try filtering an inbox or opening a message.' },
  { module: 'document', title: 'Documents', kind: 'document', description: 'The brief, notes, and decisions that explain what you’re exploring and why.', example: 'Keep the problem and audience alongside your screens.' },
  { module: 'diagrams', title: 'Diagrams', kind: 'diagrams', description: 'Flows that help you and your team see how the experience fits together.', example: 'Follow a message from arrival to review to resolution.' },
  { module: 'canvas', title: 'Canvases', kind: 'canvas', description: 'An open space to sketch, compare, and arrange your artifacts and notes together.', example: 'Put your screens beside a flow and discuss the whole idea.' },
].filter(type => CONFIG.modules[type.module] === true);

type Choice = { title: string; kind: string; description: string; example: string };
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
      <p className="text-xs leading-relaxed text-muted-foreground">{choice.example}</p>
    </div>
  </div>;
}
export const SystemPreview = () => <ConceptPreview choices={systemParts} label="Explore the parts of a system" id="onboarding-system-preview" system />;
export const ArtifactPreview = () => <ConceptPreview choices={artifacts} label="Explore prototype artifacts" id="onboarding-artifact-preview" />;
