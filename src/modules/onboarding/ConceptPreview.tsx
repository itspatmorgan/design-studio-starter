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
  { module: 'view', title: 'Views', kind: 'view', description: 'Explore how your idea feels with working screens, from filtering an inbox to opening a message. Views are saved as React code you can reuse in other React projects.' },
  { module: 'document', title: 'Documents', kind: 'document', description: 'Keep your brief, notes, and decisions alongside your screens so the thinking stays with the work. Documents use Markdown, a plain text format that many writing tools support.' },
  { module: 'diagrams', title: 'Diagrams', kind: 'diagrams', description: 'Show how an experience fits together, from a message arriving to its resolution. Diagrams use Mermaid, a text format you can edit and display in other compatible tools.' },
  { module: 'canvas', title: 'Canvases', kind: 'canvas', description: 'Use Excalidraw’s drawing tools to sketch ideas, connect them with arrows, and add notes. Arrange your sketches alongside screens and flows to explore the whole idea.' },
].filter(type => CONFIG.modules[type.module] === true);

type Choice = { title: string; kind: string; description: string; example?: string };
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
      {choice.example && <p className="text-xs leading-relaxed text-muted-foreground">{choice.example}</p>}
    </div>
  </div>;
}
export const SystemPreview = () => <ConceptPreview choices={systemParts} label="Explore the parts of a system" id="onboarding-system-preview" system />;
export const ArtifactPreview = () => <ConceptPreview choices={artifacts} label="Explore prototype artifacts" id="onboarding-artifact-preview" />;
