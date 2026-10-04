import platformSpec from '../../../systems/platform/system.ts';
// Where each design system keeps its parts, for the Systems pages and everything that reads a system's files:
// the app's own (Platform) and each prototype system (src/systems/<id>/system.ts, src/platform/modules/systems/spec.ts). Platform is
// built in here, because prototypes never use it. Build scripts and the file layer take their paths from these,
// so a system's components and theme are found the same way whichever it is.
// This file has no imports beyond types, so Node scripts and the app can both load it.
import type { DocsMode, SystemSpec } from './spec.ts';

export type { DocsMode };

export type SystemSource = {
  label: string;
  dir: string;                                   // the folder it lives in, like "src/systems/product/"
  components: string;                            // where its components are, without a trailing "/"
  theme: string;                                 // the CSS file that sets its variables
  scope: { light: string; dark: string };        // the selectors that hold its values in that file
  docs: DocsMode;
  origin: 'shadcn' | null;                       // where its components come from, so each page can link to their docs
};

export const PLATFORM_ID = 'platform';

// A prototype system's parts, from its system.ts and the folder it was found in.
export const sourceOf = (id: string, spec: SystemSpec): SystemSource => ({
  label: spec.label,
  dir: `src/systems/${id}/`,
  components: `src/systems/${id}/components`,
  theme: `src/systems/${id}/styles/theme.css`,
  scope: { light: `.${spec.themeClass}`, dark: `.${spec.themeClass}[data-color-mode="dark"]` },
  docs: spec.docs,
  origin: spec.origin,
});

// The app's own system: stock shadcn/ui components, themed on the page itself (:root and .dark).
export const PLATFORM_SOURCE: SystemSource = { ...sourceOf(PLATFORM_ID, platformSpec), scope: { light: ':root', dark: '.dark' } };

// shadcn/ui's page for a component, from its file's name ("input-group" → .../base/input-group).
// The name is checked, since it goes into a link.
export const shadcnDocsUrl = (stem: string) => (/^[a-z0-9-]+$/.test(stem) ? `https://ui.shadcn.com/docs/components/base/${stem}` : null);
