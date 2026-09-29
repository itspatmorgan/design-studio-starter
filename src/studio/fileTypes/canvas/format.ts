// The canvas file: an Excalidraw scene, kept small and stable so canvases diff cleanly in git and
// an agent can read and edit them.
//
// - Deleted elements are never stored (undoing a delete is in-memory history).
// - Images are never stored and `files` is always empty: an image's bytes would be written into
//   this file. A canvas shows the view itself instead.
// - Fields at Excalidraw's default are dropped; `restoreElements` fills them back in on load.
//   `version`, `versionNonce` and `index` are kept: merging changes needs them.
// - Numbers are rounded, keys are sorted, and volatile fields (`updated`) are dropped.
// - A link to an item is stored as its address in the app ("/patrick/hello-world/lofi/main"),
//   so a canvas works on any host and under any base path.
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { appPathOf } from '@/studio/app/items/itemLinks';

// Excalidraw's own file version (keeps the file opening on excalidraw.com).
const EXCALIDRAW_FILE_VERSION = 2;
// This app's version of the stored shape. Bump it when the shape changes, and upgrade older files
// in `parseCanvas`. type.ts checks against the same number.
export const FORMAT_VERSION = 1;

type Stored = Record<string, unknown>;

export type ParsedCanvas = {
  elements: Stored[];
  background: string;
  gridSize: number | null;
  // Written by a newer copy of the app: open it, never save over it.
  tooNew: boolean;
};

const DEFAULT_BACKGROUND = '#ffffff';

export function parseCanvas(text: string): ParsedCanvas {
  const file = JSON.parse(text) as { elements?: unknown; appState?: { viewBackgroundColor?: string; gridSize?: number | null }; studioVersion?: unknown };
  if (!file || typeof file !== 'object' || !Array.isArray(file.elements)) throw new Error("This isn't a canvas file: it has no list of elements.");
  const version = file.studioVersion ?? 1;
  if (!Number.isInteger(version) || (version as number) < 1) throw new Error(`Unknown canvas version: ${JSON.stringify(file.studioVersion)}`);
  return {
    elements: withOrigin(file.elements as Stored[]),
    background: file.appState?.viewBackgroundColor || DEFAULT_BACKGROUND,
    gridSize: file.appState?.gridSize ?? null,
    tooNew: (version as number) > FORMAT_VERSION,
  };
}

// Stored links are addresses in the app; Excalidraw wants whole URLs.
function withOrigin(elements: Stored[]): Stored[] {
  const prefix = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}`;
  return elements.map((el) => (
    typeof el.link === 'string' && el.link.startsWith('/') && !el.link.startsWith('//') ? { ...el, link: `${prefix}${el.link}` } : el
  ));
}

// Fields dropped when equal to Excalidraw's element defaults.
const DEFAULTS: Record<string, unknown> = {
  angle: 0,
  backgroundColor: 'transparent',
  boundElements: null,
  customData: undefined,
  fillStyle: 'solid',
  frameId: null,
  groupIds: [],
  isDeleted: false,
  link: null,
  locked: false,
  opacity: 100,
  roughness: 1,
  roundness: null,
  strokeColor: '#1e1e1e',
  strokeStyle: 'solid',
  strokeWidth: 2,
};
const VOLATILE = new Set(['updated']);

const round = (n: number) => (Number.isFinite(n) && !Number.isInteger(n) ? Math.round(n * 100) / 100 : n);

// A deep copy with numbers rounded and object keys sorted.
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable((value as Stored)[key])]));
  }
  return typeof value === 'number' ? round(value) : value;
}

const isDefault = (key: string, value: unknown) => {
  if (!(key in DEFAULTS)) return false;
  const def = DEFAULTS[key];
  return Array.isArray(def) ? Array.isArray(value) && value.length === 0 : value === def;
};

function toStoredElement(element: Stored): Stored {
  const out: Stored = {};
  for (const [key, raw] of Object.entries(element)) {
    // An item's link is its app path; any other link (there shouldn't be one) is kept as it is.
    const value = key === 'link' && typeof raw === 'string' ? appPathOf(raw) ?? raw : raw;
    if (value === undefined || VOLATILE.has(key) || isDefault(key, value)) continue;
    out[key] = value;
  }
  return stable(out) as Stored;
}

export function serializeCanvas(elements: readonly ExcalidrawElement[], appState: { viewBackgroundColor?: string; gridSize?: number | null } = {}): string {
  const scene = {
    type: 'excalidraw',
    version: EXCALIDRAW_FILE_VERSION,
    studioVersion: FORMAT_VERSION,
    elements: elements.filter((el) => !el.isDeleted && el.type !== 'image').map((el) => toStoredElement(el as unknown as Stored)),
    // Only what the canvas restores: the background and grid. The camera is per person (camera.ts).
    appState: {
      viewBackgroundColor: appState.viewBackgroundColor || DEFAULT_BACKGROUND,
      ...(appState.gridSize != null ? { gridSize: appState.gridSize } : {}),
    },
    files: {},
  };
  return `${JSON.stringify(scene, null, 2)}\n`;
}
