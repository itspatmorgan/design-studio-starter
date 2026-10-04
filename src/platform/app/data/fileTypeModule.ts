import type { ComponentType } from 'react';
import type { CodeIcon } from '@hugeicons/core-free-icons';
import type { Artifact, Prototype } from '@/platform/app/data/types';

// How the app opens a file type (src/modules/<type>/open.tsx). What the build needs to know
// about the type is in its type.ts.
export type ArtifactContext = { proto: Prototype; item: Artifact };

// What a type shows where another item includes it (in documents or on canvases): a live preview, in a box of
// this size. A type without one is shown as a card.
export type EmbedProps = { proto: Prototype; item: Artifact; width: number; height: number };

export type FileTypeModule<Props extends object = any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
  icon: typeof CodeIcon;
  // Loads the item's file before its page renders, so the open item stays on screen until the
  // next is ready. Returns the props for Page, or undefined if the file isn't there (the
  // not-found page).
  load(context: ArtifactContext): Promise<Props | undefined>;
  Page: ComponentType<Props>;
  Embed?: ComponentType<EmbedProps>;
  embedSurfaces: EmbedSurface[];
};

export type EmbedSurface = "document" | "canvas";

// Only explicitly declared surfaces receive a preview.
export function embedFor(module: FileTypeModule | undefined, surface: EmbedSurface) {
  return module?.embedSurfaces?.includes(surface) ? module.Embed : undefined;
}
