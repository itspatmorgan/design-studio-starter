// The starter files for a component's docs (see systemDocs.ts): an examples file and a Markdown
// page, written next to the component. Nothing here reads a disk or imports anything, so Node
// scripts and the app can both load it. scripts/scaffold-component-docs.js writes them.

// "icon-button" or "IconButton" → "Icon button".
export function titleOf(stem: string): string {
  const words = stem.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// "icon-button" → "IconButton": the name a component file usually exports.
export const exportNameOf = (stem: string) =>
  stem.split(/[-_\s]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

const HINT = '<!-- Optional sections you might add: usage guidelines, accessibility, links to Figma or your source repo, implementation notes. Nothing else is required. -->';

export const COMPONENT_NAME_MAX = 48;

// Why a new component can't have this name, as a phrase to follow "A component's name", or null.
// `taken` is the pages the system already has.
export function componentNameProblem(name: string, taken: string[]): string | null {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) return 'has to be lowercase words joined by hyphens, like icon-button';
  if (name.length > COMPONENT_NAME_MAX) return `has to be at most ${COMPONENT_NAME_MAX} characters`;
  if (taken.includes(name)) return 'is already used by another component';
  return null;
}

// A new component file: an empty one in shadcn/ui's style, ready to fill in. It compiles as it is.
export function componentSkeleton(name: string): string {
  const Name = exportNameOf(name);
  return `import * as React from "react"
import { cn } from "@/lib/utils"

function ${Name}({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="${name}" className={cn("", className)} {...props} />
}

export { ${Name} }
`;
}

// A description as a front matter value: plain when it can be, quoted (JSON is valid YAML) when not.
const yamlText = (text: string) => (/^[A-Za-z0-9][^:#"'\\\n]*$/.test(text) && !/\s$/.test(text) ? text : JSON.stringify(text.replace(/\s+/g, ' ').trim()));

export type ScaffoldInput = {
  system: string;            // "product"
  source: string;            // the component file inside its components folder: "button.tsx", "dialog/dialog.tsx"
  exportName?: string;       // what the file exports, if known; otherwise guessed from the file name
  required?: { name: string; type: string }[]; // its required props, given a value so the example compiles
  description?: string;      // the page's description, if it is already known
};

// A value for a required prop, so the starter example compiles: a real one for the simple types,
// and a placeholder for the rest that says it needs filling in.
function valueOf({ name, type }: { name: string; type: string }) {
  if (type === 'string') return `${name}="${titleOf(name)}"`;
  if (type === 'boolean') return `${name}`;
  if (type === 'number') return `${name}={1}`;
  return `${name}={undefined as never}`;
}

// { examples: { file, content }, doc: { file, content } }, with files inside the components folder.
export function docTemplates({ system, source, exportName, required = [], description = '' }: ScaffoldInput) {
  const slash = source.lastIndexOf('/');
  const dir = source.slice(0, slash + 1);
  const stem = source.slice(slash + 1).replace(/\.[jt]sx$/, '');
  const name = exportName ?? exportNameOf(stem);
  const props = required.map(valueOf);
  const note = required.some((p) => valueOf(p).endsWith('undefined as never}')) ? '\n// Replace each "undefined as never" with a real value.' : '';
  return {
    examples: {
      file: `${dir}${stem}.examples.tsx`,
      content: `import { ${name} } from '@/systems/${system}/components/${dir}${stem}';

// Each export named with a capital is one example on the component's page, shown live with its code.
// Add one per variant, size, or state worth seeing.${note}
export const Default = () => <${name}${props.length ? ` ${props.join(' ')}` : ''} />;
`,
    },
    doc: {
      file: `${dir}${stem}.md`,
      content: `---
title: ${titleOf(stem)}
description:${description.trim() ? ` ${yamlText(description.trim())}` : ''}
---

## When to use

<!-- Say when this is the right component, and when another one is. -->

${HINT}
`,
    },
  };
}
