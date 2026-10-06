import { useState } from 'react';
import { FileText, GitBranch, Layout, Layers, MousePointer2, Sparkles } from 'lucide-react';
import { Button } from '@/systems/studio/components/button';
import { CONFIG } from '@/platform/core/api';

const systemParts = [
  { title: 'Toolkit', icon: Layers, description: 'Theme and components give your prototypes their look and reusable building blocks.', example: 'Colors · Typography · Buttons · Forms' },
  { title: 'Context', icon: FileText, description: 'Your audience, product, and design principles help your agent make decisions that fit.', example: 'Personas · Product goals · Design principles' },
  { title: 'Skills', icon: Sparkles, description: 'Skills guide your agent through tasks specific to your system.', example: 'Write in your brand’s voice · Apply your design patterns' },
];
const artifacts = [
  { module: 'view', title: 'Views', icon: MousePointer2, description: 'Interactive screens to click through and try.', example: 'An inbox screen with filters, messages, and an open conversation.' },
  { module: 'document', title: 'Documents', icon: FileText, description: 'Briefs, notes, and decisions that explain your idea.', example: 'A brief describing who the inbox is for and what they need.' },
  { module: 'diagrams', title: 'Diagrams', icon: GitBranch, description: 'Flows and relationships that make an idea easier to follow.', example: 'New message → Review → Reply → Resolve' },
  { module: 'canvas', title: 'Canvases', icon: Layout, description: 'Arrange screens, documents, diagrams, and notes together.', example: 'A shared space to compare screens alongside your brief and flow.' },
].filter(type => CONFIG.modules[type.module] === true);

type Choice = { title: string; icon: typeof Layers; description: string; example: string };
function ConceptPreview({ choices, label, id }: { choices: Choice[]; label: string; id: string }) {
  const [index, setIndex] = useState(0);
  const choice = choices[index];
  if (!choice) return null;
  const Icon = choice.icon;
  return <div className="space-y-4">
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {choices.map((item, i) => <Button key={item.title} variant={index === i ? 'secondary' : 'ghost'} size="sm" aria-pressed={index === i} aria-controls={id} onClick={() => setIndex(i)}>{item.title}</Button>)}
    </div>
    <div id={id} className="space-y-4 rounded-xl border bg-muted/30 p-5" aria-live="polite" aria-atomic="true">
      <Icon className="size-6" aria-hidden="true" />
      <p className="font-medium">{choice.title}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{choice.description}</p>
      <p className="rounded-lg border bg-background p-3 text-sm">{choice.example}</p>
    </div>
  </div>;
}
export const SystemPreview = () => <ConceptPreview choices={systemParts} label="Explore the parts of a system" id="onboarding-system-preview" />;
export const ArtifactPreview = () => <ConceptPreview choices={artifacts} label="Explore prototype artifacts" id="onboarding-artifact-preview" />;
