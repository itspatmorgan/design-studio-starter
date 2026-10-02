import type { ReactNode } from 'react';
import type { HandbookMap } from '@/platform/modules/handbook/map';
import type { SystemComponentDoc } from '@/platform/modules/systems/docs';
import type { ThemeToken } from '@/platform/modules/systems/themeTokens';
import type { DocsMode } from '@/platform/modules/systems/sources';


// public/prototypes/manifest.json, written by scripts/build/build-manifest.js, with each prototype's items
// in public/prototypes/items/<contributor>/<prototype>.json.
// One thing in a prototype the app can open (see src/platform/fileTypes/).
export type Item = {
  path: string;   // file path in the prototype, e.g. "prototype.tsx" or "checkout/step-1.tsx"
  fileType: string; // the id of the file type that owns it, from its extension ("view", "document")
  lofi?: true;      // set when the file says it's lofi (a view starting with /** @lofi */)
};

export type PrototypeInfo = {
  id: string;             // folder name, e.g. "hello-world"
  contributorKey: string; // contributors.json key, e.g. "patrick"
  title: string;
  description: string;
  contributor: string;    // display name, from contributors.json
  created: string | null;
  system: string;         // meta.json "system", or the default (studio.config.ts defaultSystem, else the first in src/systems/)
  start: string | null;   // meta.json "start", as an item path: the item it opens on
  status?: 'archived';    // meta.json "status", when archived; absent means active
  maintainers?: string[]; // meta.json "maintainers" (contributors.json keys), where a section's policy is maintainers (tools); prototypes don't have them
};

// A prototype with its items loaded, which everything that shows a prototype's files needs.
export type Prototype = PrototypeInfo & {
  items: Item[];          // in file-tree order
};

// A prototype in the manifest. The deployed site's manifest leaves out items, so the file list that
// every visitor downloads stays small; they're fetched when a prototype opens (loadPrototype in
// manifest.ts). The dev server sends them all.
export type PrototypeRef = PrototypeInfo & {
  items?: Item[];
  itemCount?: number;
  itemsHash?: string;     // changes when the items do, so a changed list is fetched again
};

// One Guide page, from its frontmatter: src/platform/modules/guide/pages/<slug>.md, or the README of a module or file
// type that opens with Guide frontmatter (`source`, as the app's glob names it).
export type GuidePage = {
  slug: string;           // its address, /guide/<slug>: the file name without .md, e.g. "getting-started"
  title: string;
  description: string;
  section: string | null; // sidebar heading, e.g. "Core concepts"
  source?: string;        // where a README page is, like "/platform/fileTypes/canvas/README.md"
};

// `sections` holds the items of the modules' sections of prototype-shaped folders, by section key: the
// published tools (src/tools/, as `sections.tools`), shaped like prototypes.
// `handbook` holds the Handbook's sections (src/handbook/, see src/platform/core/roots.ts), shaped like
// prototypes.
// `handbookMap` is how an agent reads the Handbook, worked out from the files (modules/handbook/map.ts).
// `systems` holds each system's components and their docs (systemDocs.ts), the tokens its theme
// defines (themeTokens.ts), and where its components come from (systemSources.ts). The app's own
// system is one of them.
export type Manifest = {
  prototypes: PrototypeRef[]; sections: Record<string, PrototypeRef[]>; guide: GuidePage[]; handbook: Prototype[]; handbookMap: HandbookMap | null;
  systems: Record<string, { docs: DocsMode; origin: 'shadcn' | null; components: SystemComponentDoc[]; tokens: ThemeToken[] }>;
};

// One tab on the Systems page: what only its people can write, its introduction (and icons, if it
// has them). Its components and foundations pages come from its files (systemDocs.ts, themeTokens.ts).
// What only a system's people can write for its Systems page: its introduction (which covers its theme), and
// icons if it has them. A prototype system keeps this in src/systems/<id>/intro.tsx.
export type SystemIntro = { intro: ReactNode; icons?: DesignSystem['icons'] };

export type DesignSystem = {
  label: string;
  dir: string;            // where its components live, e.g. "src/platform/components/"
  scopeClass: string;     // the class its theme is set under, or "" when it's set on the page (studio)
  intro: ReactNode;      // what the system is, and how its theme is set up
  icons?: { library: string; href: string; snippet: string; grid: ReactNode };
};
