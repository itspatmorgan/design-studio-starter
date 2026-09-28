import type { ComponentType, ReactNode } from 'react';
import type { ComponentSpec, TypeSampleSpec } from '@/studio/app/pages/systems/foundations';

import type { FileType } from '@/fileTypes';

// public/prototypes/manifest.json, written by scripts/build-manifest.js.
// One thing in a prototype the app can open (see src/fileTypes.ts).
export type Item = {
  path: string;   // file path in the prototype, e.g. "prototype.tsx" or "checkout/step-1.tsx"
  fileType: FileType; // from its extension
};

export type Prototype = {
  id: string;             // folder name, e.g. "hello-world"
  contributorKey: string; // contributors.json key, e.g. "patrick"
  title: string;
  description: string;
  contributor: string;    // display name, from contributors.json
  created: string | null;
  system: string;         // meta.json "system", or the first in src/systems.ts
  start: string | null;   // meta.json "start", as an item path: the item it opens on
  items: Item[];          // in file-tree order
};

// One Guide page (src/guide/<slug>.mdx), from its frontmatter.
export type GuidePage = {
  slug: string;           // file name without .mdx, e.g. "getting-started"
  title: string;
  description: string;
  section: string | null; // sidebar heading, e.g. "Core concepts"
};

export type Manifest = { prototypes: Prototype[]; guide: GuidePage[] };

// A view file's default export.
export type ViewModule = { default: ComponentType };

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
  categories: { name: string; components: ComponentSpec[] }[];
};
