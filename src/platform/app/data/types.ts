import type { ReactNode } from 'react';
import type { SystemContentMap } from '@/modules/systems/content/map';
import type { SystemComponentDoc } from '@/modules/systems/docs';
import type { ThemeToken } from '@/modules/systems/themeTokens';
import type { DocsMode } from '@/modules/systems/sources';


// public/prototypes/manifest.json, written by scripts/build/build-manifest.js, with each prototype's artifacts
// in public/prototypes/artifacts/<contributor>/<prototype>.json.
// A navigable artifact backed by a file. Shared readers use the same record shape (see src/platform/context/technical/file-types.md).
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
  contributorGithub?: string; // registered GitHub account, for optional profile photos
  created: string | null;
  system: string | null;  // null means custom styling; omission in meta.json resolves to defaultSystem
  owner?: { id: string; kind: 'platform' | 'module' | 'system'; label: string; root: string };
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

// One human chapter from src/modules/documentation/pages/<slug>.md.
export type GuidePage = {
  slug: string;           // its address, /guide/<slug>: the file name without .md, e.g. "getting-started"
  title: string;
  description: string;
  section: string | null; // sidebar heading, e.g. "Core concepts"
  source?: string;        // the chapter’s source, like "/modules/documentation/pages/canvases.md"
};

// `sections` holds the artifacts of the modules' sections of prototype-shaped folders, by section key: the
// module section artifacts (src/examples/, as `sections.examples`), shaped like prototypes.
// `systemContent` holds the system content's sections (src/systems/<id>/, see src/platform/core/roots.ts), shaped like
// prototypes.
// `systemContentMaps` inventories declared instruction routes; it does not record agent reads.
// `systems` holds each system's components and their docs (systemDocs.ts), the tokens its theme
// defines (themeTokens.ts), and where its components come from (systemSources.ts). The app's own
// system is one of them.
export type PlatformReferenceGroup = { id: string; label: string; enabled: boolean; references: { source: string; title: string; related?: { title: string; href: string }[] }[]; related: { title: string; href: string }[] };

export type Manifest = {
  prototypes: PrototypeRef[]; sections: Record<string, PrototypeRef[]>; guide: GuidePage[]; systemContent: Prototype[]; systemContentMaps: Record<string, SystemContentMap>; platformReferences: PlatformReferenceGroup[];
  skillCatalog: { owner: NonNullable<PrototypeInfo['owner']>; folder: string; name: string; description: string; source: string }[];
  systems: Record<string, { docs: DocsMode; origin: 'shadcn' | null; components: SystemComponentDoc[]; tokens: ThemeToken[] }>;
};

// Authored overview copy, optional additional content, and icon examples live in src/systems/<id>/intro.tsx.
// Inventory metrics and theme/component pages come from the system's files.
export type SystemIntro = { summary?: string; overview?: SystemOverviewSummary; intro?: ReactNode; icons?: DesignSystem['icons'] };

export type SystemOverviewSummary = { guidance?: string; code?: string; starter?: boolean };

export type DesignSystem = {
  overview?: SystemOverviewSummary; // authored descriptions; inventory counts stay automatic
  summary?: string;       // system-owned purpose shown above the generated overview
  label: string;
  dir: string;            // where its components live, e.g. "src/systems/studio/components/"
  scopeClass: string;     // the class its theme is set under, or "" when it's set on the page (studio)
  intro?: ReactNode;     // optional system-owned content shown directly below the overview
  icons?: { library: string; href: string; snippet: string; grid: ReactNode };
};
