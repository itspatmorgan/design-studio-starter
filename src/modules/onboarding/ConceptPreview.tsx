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
  { module: 'view', title: 'Views', kind: 'view', description: 'Explore how your idea feels with working screens, from filtering an inbox to opening a message. Views are saved as React code you can reuse in other React projects.' },
  { module: 'document', title: 'Documents', kind: 'document', description: 'Keep your brief, notes, and decisions alongside your screens so the thinking stays with the work. Documents use Markdown, a plain text format that many writing tools support.' },
  { module: 'diagrams', title: 'Diagrams', kind: 'diagrams', description: 'Show how an experience fits together, from a message arriving to its resolution. Diagrams use Mermaid, a text format you can edit and display in other compatible tools.' },
  { module: 'canvas', title: 'Canvases', kind: 'canvas', description: 'Use Excalidraw’s drawing tools to sketch ideas, connect them with arrows, and add notes. Arrange your sketches alongside screens and flows to explore the whole idea.' },
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
