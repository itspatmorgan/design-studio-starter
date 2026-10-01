// The starter files for a component's docs (see systemDocs.ts): an examples file and a Markdown
// page, written next to the component. Nothing here reads a disk or imports anything, so Node
// scripts and the app can both load it. src/studio/modules/systems/node/scaffold-docs.js writes them.

// "icon-button" or "IconButton" → "Icon button".
export function titleOf(stem: string): string {
  const words = stem.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// "icon-button" → "IconButton": the name a component file usually exports.
export const exportNameOf = (stem: string) =>
  stem.split(/[-_\s]+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

const HINT = '<!-- Optional sections you might add: usage guidelines, accessibility, links to Figma or your source repo, implementation notes. Nothing else is required. -->';

export type ScaffoldInput = {
  system: string;            // "product"
  source: string;            // the component file inside its components folder: "button.tsx", "dialog/dialog.tsx"
  exportName?: string;       // what the file exports, if known; otherwise guessed from the file name
  required?: { name: string; type: string }[]; // its required props, given a value so the example compiles
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
export function docTemplates({ system, source, exportName, required = [] }: ScaffoldInput) {
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
description:
---

## When to use

<!-- Say when this is the right component, and when another one is. -->

${HINT}
`,
    },
  };
}
