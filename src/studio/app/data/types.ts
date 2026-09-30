import type { ReactNode } from 'react';
import type { ComponentSpec, TypeSampleSpec } from '@/studio/app/pages/systems/foundations';
import type { HandbookMap } from '@/studio/handbookMap';
import type { SystemComponentDoc } from '@/studio/systemDocs';
import type { ThemeToken } from '@/studio/themeTokens';


// public/prototypes/manifest.json, written by scripts/build-manifest.js.
// One thing in a prototype the app can open (see src/studio/fileTypes/).
export type Item = {
  path: string;   // file path in the prototype, e.g. "prototype.tsx" or "checkout/step-1.tsx"
  fileType: string; // the id of the file type that owns it, from its extension ("view", "document")
};

export type Prototype = {
  id: string;             // folder name, e.g. "hello-world"
  contributorKey: string; // contributors.json key, e.g. "patrick"
  title: string;
  description: string;
  contributor: string;    // display name, from contributors.json
  created: string | null;
  system: string;         // meta.json "system", or the first in src/systems/index.ts
  start: string | null;   // meta.json "start", as an item path: the item it opens on
  items: Item[];          // in file-tree order
};

// One Guide page (src/studio/guide/<slug>.md), from its frontmatter.
export type GuidePage = {
  slug: string;           // file name without .md, e.g. "getting-started"
  title: string;
  description: string;
  section: string | null; // sidebar heading, e.g. "Core concepts"
};

// `handbook` holds the Handbook's sections (src/handbook/, see src/studio/roots.ts), shaped like
// prototypes.
// `handbookMap` is how an agent reads the Handbook, worked out from the files (handbookMap.ts).
// `systems` holds each prototype system's components and their docs (systemDocs.ts), and the
// tokens its theme defines (themeTokens.ts).
export type Manifest = {
  prototypes: Prototype[]; guide: GuidePage[]; handbook: Prototype[]; handbookMap: HandbookMap | null;
  systems: Record<string, { docs: 'warn' | 'strict'; components: SystemComponentDoc[]; tokens: ThemeToken[] }>;
};

// One tab on the Systems page.
export type DesignSystem = {
  label: string;
  dir: string;            // where its components live, e.g. "src/studio/components/"
  scopeClass: string;
  intro: ReactNode;
  theme: ReactNode;
  showRadius?: boolean;
  typeSamples?: TypeSampleSpec[];
  icons?: { library: string; href: string; snippet: string; grid: ReactNode };
  categories?: { name: string; components: ComponentSpec[] }[]; // hand-listed component pages (the studio system); prototype systems' come from their files
};
