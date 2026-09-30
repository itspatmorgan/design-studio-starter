// A canvas: a page you can arrange things on. Views and documents from any prototype sit on it
// beside sticky notes, text, and arrows, drawn with Excalidraw. The file is Excalidraw's own
// format (an .excalidraw file is JSON), so its name, without the extension, is the canvas's name
// in the navigation.
import { defineFileType } from '../index.ts';

// Version 1 of the canvas file (see format.ts). A newer one is opened but never saved over.
const KNOWN_VERSION = 1;

export default defineFileType({
  label: 'Canvas',
  extensions: ['.excalidraw'],
  language: 'json',
  archivable: 'json',

  template: () => `${JSON.stringify({
    type: 'excalidraw',
    version: 2,
    studioVersion: KNOWN_VERSION,
    elements: [],
    appState: { viewBackgroundColor: '#ffffff' },
    files: {},
  }, null, 2)}\n`,

  check: ({ source }) => {
    let canvas: { elements?: unknown; files?: unknown; studioVersion?: unknown };
    try { canvas = JSON.parse(source); } catch (error) { return [`it isn't valid JSON (${(error as Error).message}).`]; }
    if (!canvas || typeof canvas !== 'object' || Array.isArray(canvas)) return ['a canvas is one JSON object.'];
    const problems: string[] = [];
    if (!Array.isArray(canvas.elements)) problems.push('"elements" must be a list (use [] for an empty canvas).');
    else if (canvas.elements.some((el) => (el as { type?: string })?.type === 'image')) problems.push("a canvas can't hold images: their bytes would be stored inside the file. Remove the image elements, and put the view itself on the canvas instead of a screenshot of it.");
    if (canvas.files && Object.keys(canvas.files).length) problems.push('"files" must be empty. Images aren\'t stored in a canvas.');
    const v = canvas.studioVersion ?? 1;
    if (!Number.isInteger(v) || (v as number) < 1 || (v as number) > KNOWN_VERSION) problems.push(`"studioVersion" must be a whole number from 1 to ${KNOWN_VERSION}. A newer file needs a newer copy of the app.`);
    return problems;
  },
});
