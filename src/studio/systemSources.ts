// Every design system the Systems pages document, and where each keeps its parts: the app's own
// (Studio) and each prototype system in src/systems/index.ts. Studio is listed here but not there,
// because prototypes never use it. Build scripts and the file layer take their paths from this
// list, so a system's components and theme are found the same way whichever it is.
// This file has no imports beyond the registry, so Node scripts can load it directly.
import { PROTOTYPE_SYSTEMS } from '../systems/index.ts';

// How the build treats a component without examples or a description (systemDocs.ts): 'warn' says
// so, 'strict' fails the build, and 'off' says nothing.
export type DocsMode = 'warn' | 'strict' | 'off';

export type SystemSource = {
  label: string;
  dir: string;                                   // the folder it lives in, like "src/systems/product/"
  components: string;                            // where its components are, without a trailing "/"
  theme: string;                                 // the CSS file that sets its variables
  scope: { light: string; dark: string };        // the selectors that hold its values in that file
  docs: DocsMode;
  origin: 'shadcn' | null;                       // where its components come from, so each page can link to their docs
};

export const STUDIO_ID = 'studio';

type RegistryEntry = { label: string; dir: string; themeClass: string; docs: DocsMode; origin?: 'shadcn' };

export const SYSTEM_SOURCES: Record<string, SystemSource> = {
  ...Object.fromEntries(Object.entries(PROTOTYPE_SYSTEMS as Record<string, RegistryEntry>).map(([id, s]): [string, SystemSource] => [id, {
    label: s.label,
    dir: s.dir,
    components: `${s.dir}components`,
    theme: `${s.dir}styles/theme.css`,
    scope: { light: `.${s.themeClass}`, dark: `.dark .${s.themeClass}` },
    docs: s.docs,
    origin: s.origin ?? null,
  }])),
  // The app's own system: stock shadcn/ui components, themed on the page itself (:root and .dark).
  [STUDIO_ID]: {
    label: 'Studio',
    dir: 'src/studio/',
    components: 'src/studio/components',
    theme: 'src/studio/styles/index.css',
    scope: { light: ':root', dark: '.dark' },
    docs: 'off',
    origin: 'shadcn',
  },
};

// shadcn/ui's page for a component, from its file's name ("input-group" → .../base/input-group).
// The name is checked, since it goes into a link.
export const shadcnDocsUrl = (stem: string) => (/^[a-z0-9-]+$/.test(stem) ? `https://ui.shadcn.com/docs/components/base/${stem}` : null);
