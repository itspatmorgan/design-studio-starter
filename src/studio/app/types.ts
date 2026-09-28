import type { ComponentType, ElementType, ReactNode } from 'react';
import type { ComponentSpec, TypeSampleSpec } from './systems/foundations';

// public/prototypes/manifest.json, written by scripts/build-manifest.js.
export type View = {
  name: string;          // file name with extension, e.g. "prototype.tsx" or "main.jsx"
  group: string | null;  // subfolder, e.g. "lofi"
};

export type Prototype = {
  id: string;             // folder name, e.g. "hello-world"
  contributorKey: string; // contributors.json key, e.g. "patrick"
  title: string;
  description: string;
  contributor: string;
  created: string | null;
  updated: string | null;
  views: View[];
};

export type Manifest = { prototypes: Prototype[] };

// A view file's default export.
export type ViewModule = { default: ComponentType };

// One tab on the Systems page.
export type DesignSystem = {
  label: string;
  scopeClass: string;
  Frame: ElementType;
  intro: ReactNode;
  theme: ReactNode;
  showRadius?: boolean;
  extraColorTokens?: [group: string, token: [name: string, utility: string, role: string]][];
  typeSamples?: TypeSampleSpec[];
  icons?: { library: string; href: string; snippet: string; grid: ReactNode };
  categories: { name: string; components: ComponentSpec[] }[];
};
