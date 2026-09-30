import type { ReactNode } from 'react';
import type { HandbookMap } from '@/studio/handbookMap';
import type { SystemComponentDoc } from '@/studio/systemDocs';
import type { ThemeToken } from '@/studio/themeTokens';
import type { DocsMode } from '@/studio/systemSources';


// public/prototypes/manifest.json, written by scripts/build-manifest.js.
// One thing in a prototype the app can open (see src/studio/fileTypes/).
export type Item = {
  path: string;   // file path in the prototype, e.g. "prototype.tsx" or "checkout/step-1.tsx"
  fileType: string; // the id of the file type that owns it, from its extension ("view", "document")
  status?: 'archived'; // set when the file is archived (src/studio/archive.ts); absent means active
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
  status?: 'archived';    // meta.json "status", when archived; absent means active
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
// `systems` holds each system's components and their docs (systemDocs.ts), the tokens its theme
// defines (themeTokens.ts), and where its components come from (systemSources.ts). The app's own
// system is one of them.
export type Manifest = {
  prototypes: Prototype[]; guide: GuidePage[]; handbook: Prototype[]; handbookMap: HandbookMap | null;
  systems: Record<string, { docs: DocsMode; origin: 'shadcn' | null; components: SystemComponentDoc[]; tokens: ThemeToken[] }>;
};

// One tab on the Systems page: what only its people can write, its introduction (and icons, if it
// has them). Its components and foundations pages come from its files (systemDocs.ts, themeTokens.ts).
export type DesignSystem = {
  label: string;
  dir: string;            // where its components live, e.g. "src/studio/components/"
  scopeClass: string;     // the class its theme is set under, or "" when it's set on the page (studio)
  intro: ReactNode;      // what the system is, and how its theme is set up
  icons?: { library: string; href: string; snippet: string; grid: ReactNode };
};
