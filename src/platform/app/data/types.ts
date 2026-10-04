import type { ReactNode } from 'react';
import type { SystemContentMap } from '@/modules/systems/content/map';
import type { SystemComponentDoc } from '@/modules/systems/docs';
import type { ThemeToken } from '@/modules/systems/themeTokens';
import type { DocsMode } from '@/modules/systems/sources';


// public/prototypes/manifest.json, written by scripts/build/build-manifest.js, with each prototype's artifacts
// in public/prototypes/artifacts/<contributor>/<prototype>.json.
// A navigable artifact backed by a file. Shared readers use the same record shape (see src/platform/core/fileTypes.md).
export type Artifact = {
  path: string;   // file path in the prototype, e.g. "prototype.tsx" or "checkout/step-1.tsx"
  fileType: string; // the id of the file type that owns it, from its extension ("view", "document")
  lofi?: true;      // set when the file says it's lofi (a view starting with /** @lofi */)
};

export type PrototypeInfo = {
  id: string;             // folder name, e.g. "hello-world"
  contributorKey: string; // contributors.json key, e.g. "patrick"
  title: string;
  description?: string;   // shared section descriptions; prototypes use artifacts for context
  contributor: string;    // display name, from contributors.json
  created: string | null;
  system: string | null;  // null means custom styling; omission in meta.json resolves to defaultSystem
  rebuild?: { targetSystem: string | null; source: string }; // requested fork migration, before changing the actual assignment
  status?: 'archived';    // meta.json "status", when archived; absent means active
  maintainers?: string[]; // meta.json "maintainers" (contributors.json keys), where a section's policy is maintainers; prototypes don't have them
};

// A prototype with its artifacts loaded, which everything that shows a prototype's files needs.
export type Prototype = PrototypeInfo & {
  artifacts: Artifact[];          // in file-tree order
};

// A prototype in the manifest. The deployed site's manifest leaves out artifacts, so the file list that
// every visitor downloads stays small; they're fetched when a prototype opens (loadPrototype in
// manifest.ts). The dev server sends them all.
export type PrototypeRef = PrototypeInfo & {
  artifacts?: Artifact[];
  artifactCount?: number;
  artifactsHash?: string;     // changes when the items do, so a changed list is fetched again
};

// One Guide page, from its frontmatter: src/modules/documentation/pages/<slug>.md, or the README of a module or file
// type that opens with Guide frontmatter (`source`, as the app's glob names it).
export type GuidePage = {
  slug: string;           // its address, /guide/<slug>: the file name without .md, e.g. "getting-started"
  title: string;
  description: string;
  section: string | null; // sidebar heading, e.g. "Core concepts"
  source?: string;        // where a README page is, like "/modules/canvas/README.md"
};

// `sections` holds the artifacts of the modules' sections of prototype-shaped folders, by section key: the
// module section artifacts (src/examples/, as `sections.examples`), shaped like prototypes.
// `systemContent` holds the system content's sections (src/systems/<id>/, see src/platform/core/roots.ts), shaped like
// prototypes.
// `systemContentMap` is how an agent reads the system content, worked out from the files (modules/systems/content/map.ts).
// `systems` holds each system's components and their docs (systemDocs.ts), the tokens its theme
// defines (themeTokens.ts), and where its components come from (systemSources.ts). The app's own
// system is one of them.
export type PlatformReferenceGroup = { id: string; label: string; enabled: boolean; references: { source: string; title: string; order?: number }[]; related: { title: string; href: string }[] };

export type Manifest = {
  prototypes: PrototypeRef[]; sections: Record<string, PrototypeRef[]>; guide: GuidePage[]; systemContent: Prototype[]; systemContentMaps: Record<string, SystemContentMap>; platformReferences: PlatformReferenceGroup[];
  systems: Record<string, { docs: DocsMode; origin: 'shadcn' | null; components: SystemComponentDoc[]; tokens: ThemeToken[] }>;
};

// One tab on the Systems page: what only its people can write, its introduction (and icons, if it
// has them). Its components and foundations pages come from its files (systemDocs.ts, themeTokens.ts).
// What only a system's people can write for its Systems page: its introduction (which covers its theme), and
// icons if it has them. A prototype system keeps this in src/systems/<id>/intro.tsx.
export type SystemIntro = { intro: ReactNode; icons?: DesignSystem['icons'] };

export type DesignSystem = {
  label: string;
  dir: string;            // where its components live, e.g. "src/systems/studio/components/"
  scopeClass: string;     // the class its theme is set under, or "" when it's set on the page (studio)
  intro: ReactNode;      // what the system is, and how its theme is set up
  icons?: { library: string; href: string; snippet: string; grid: ReactNode };
};
