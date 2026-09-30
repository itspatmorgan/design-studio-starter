import type { ComponentType } from 'react';
import type { MDXContent } from 'mdx/types';
import { exampleNames, type ComponentPropsDoc } from '@/studio/systemDocs';

// A component's docs files in a prototype system (src/systems/<system>/components/, see
// src/studio/systemDocs.ts): its examples, the examples file's text, and its Markdown page.
export type Example = { name: string; Component: ComponentType };

// Vite only loads a file when it is asked for.
const globs = {
  examples: import.meta.glob<Record<string, unknown>>('/systems/*/components/**/*.examples.{tsx,jsx}'),
  sources: import.meta.glob<string>('/systems/*/components/**/*.examples.{tsx,jsx}', { query: '?raw', import: 'default' }),
  docs: import.meta.glob<{ default: MDXContent }>('/systems/*/components/**/*.md'),
};

// In dev, adding or removing a file makes Vite run this file again with new lists. The app keeps
// calling the functions from the first run, so the lists live in state Vite keeps across runs
// (like loadGuide.ts).
const state: { globs: typeof globs } = import.meta.hot?.data.state ?? { globs };

const at = (system: string, file: string) => `/systems/${system}/components/${file}`;

// The examples an examples file exports: each export named with a capital that is a component,
// in the order the file lists them (a module's exports come alphabetically).
export async function loadExamples(system: string, file: string): Promise<Example[]> {
  const [module, source] = await Promise.all([state.globs.examples[at(system, file)]?.(), state.globs.sources[at(system, file)]?.()]);
  const order = exampleNames(source ?? '');
  const rank = (name: string) => { const i = order.indexOf(name); return i < 0 ? order.length : i; };
  return Object.entries(module ?? {})
    .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === 'function')
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([name, value]) => ({ name, Component: value as ComponentType }));
}

export const loadExamplesSource = (system: string, file: string) => state.globs.sources[at(system, file)]?.();
export const loadComponentDoc = async (system: string, file: string) => (await state.globs.docs[at(system, file)]?.())?.default;

// The props of the components a file exports. Worked out on first use (scripts/vite-system-props-plugin.js).
export async function loadProps(system: string, file: string): Promise<ComponentPropsDoc[]> {
  return (await import('virtual:system-props')).default[`${system}/${file}`] ?? [];
}

if (import.meta.hot) {
  import.meta.hot.data.state = state;
  state.globs = globs;
  import.meta.hot.accept();
}
