import { useEffect, useState, type ComponentType } from 'react';
import type { MDXContent } from 'mdx/types';
import { SYSTEMS_KEY } from '@/studio/roots';
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
const state: { globs: typeof globs; listeners: Set<() => void> } = import.meta.hot?.data.state ?? { globs, listeners: new Set() };

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

// A number that changes when a docs file is edited, added, or removed while the app runs, so a
// page showing one loads it again.
export function useDocsVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    // A component's own file changing doesn't re-run this module, but its props may have changed.
    const onFile = (change: { contributor: string }) => { if (change.contributor === SYSTEMS_KEY) bump(); };
    state.listeners.add(bump);
    import.meta.hot?.on('studio:file', onFile);
    return () => { state.listeners.delete(bump); import.meta.hot?.off('studio:file', onFile); };
  }, []);
  return version;
}

// The props of the components a file exports, read from the code (scripts/vite-system-props-plugin.js).
// While the app runs, the dev server reads them fresh, so an edit to a component shows; the
// built site has them in a module made at build time.
export async function loadProps(system: string, file: string): Promise<ComponentPropsDoc[]> {
  const all = import.meta.env.DEV
    ? ((await (await fetch('/__studio/system-props')).json()) as Record<string, ComponentPropsDoc[]>)
    : (await import('virtual:system-props')).default;
  return all[`${system}/${file}`] ?? [];
}

if (import.meta.hot) {
  import.meta.hot.data.state = state;
  state.globs = globs;
  state.listeners.forEach((notify) => notify());
  import.meta.hot.accept();
}
