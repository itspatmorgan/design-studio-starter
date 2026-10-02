import type { ModuleSpec } from '../../core/modules/index.ts';

// The canvas file type: an .excalidraw file is a page to arrange views, documents, and notes on (src/platform/core/fileTypes.md).
export default {
  id: 'canvas',
  label: 'Canvases',
  version: '0.1.0',
  description: 'An .excalidraw file opens as a page to arrange views, documents, and notes on.',
  optional: true,
} satisfies ModuleSpec;
