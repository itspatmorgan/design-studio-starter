// Building blocks for the canvas tools (tools.ts): element JSON, colors, text sizes, and the
// geometry of arrows. Pure, and importing nothing from Excalidraw, so the same code runs in the app
// and on the command line. Elements are Excalidraw's own JSON; only what matters is filled in, and
// `restoreElements` supplies the rest when the canvas opens.
/* eslint-disable @typescript-eslint/no-explicit-any */

export type El = Record<string, any>;

// A mistake in a tool call, worded so the caller can fix it.
export class ToolError extends Error {}

// Excalidraw's own palette: a strong color for lines and text, a light one for fills.
const STRONG: Record<string, string> = {
  black: '#1e1e1e', gray: '#868e96', red: '#e03131', pink: '#c2255c', grape: '#9c36b5', violet: '#6741d9',
  blue: '#1971c2', cyan: '#0c8599', teal: '#099268', green: '#2f9e44', yellow: '#f08c00', orange: '#e8590c',
};
const LIGHT: Record<string, string> = {
  white: '#ffffff', gray: '#dee2e6', red: '#ffc9c9', pink: '#fcc2d7', grape: '#eebefa', violet: '#d0bfff',
  blue: '#a5d8ff', cyan: '#99e9f2', teal: '#96f2d7', green: '#b2f2bb', yellow: '#ffec99', orange: '#ffd8a8',
};
export const COLOR_NAMES = Object.keys(STRONG);

// A sticky note's fill and its slightly darker edge.
export const NOTE_COLORS: Record<string, { fill: string; edge: string }> = {
  yellow: { fill: '#ffec99', edge: '#ecd67a' },
  pink: { fill: '#ffc9c9', edge: '#eeaeae' },
  blue: { fill: '#a5d8ff', edge: '#87c0ec' },
  green: { fill: '#b2f2bb', edge: '#94dc9f' },
};
export const NOTE_SIZE = 200;
export const NOTE_TEXT_COLOR = '#1e1e1e';

// A color as CSS: a hex value, "none", or one of Excalidraw's palette names ("blue"). For a fill,
// a name gives its light shade.
export function color(value: unknown, role: 'stroke' | 'background', field: string = role): string {
  if (typeof value !== 'string') throw new ToolError(`${field} must be a color name or a hex value like "#1971c2"`);
  if (value === 'none' || value === 'transparent') return 'transparent';
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return value;
  const found = (role === 'stroke' ? STRONG : LIGHT)[value];
  if (!found) throw new ToolError(`${field} "${value}" isn't a color. Use a hex value, "none", or one of: ${COLOR_NAMES.join(', ')}${role === 'background' ? ', white' : ''}`);
  return found;
}

const random = () => Math.floor(Math.random() * 2 ** 31);
export const newId = () => `${Date.now().toString(36)}${random().toString(36)}`.slice(0, 18);

export const FONT_FAMILY = 6; // Nunito, the canvas's own font
export const LINE_HEIGHT = 1.25;

// Text sizes are estimated here (there's no font to measure with). The app measures them properly
// when the canvas opens, so an estimate only needs to be close.
const CHAR_WIDTH = 0.56; // of the font size, for Nunito

export function measureText(text: string, fontSize: number) {
  const lines = text.split('\n');
  return {
    width: Math.max(...lines.map((line) => line.length)) * fontSize * CHAR_WIDTH,
    height: lines.length * fontSize * LINE_HEIGHT,
  };
}

// Breaks text into lines that fit `maxWidth` (words are kept whole, unless one is longer than a line).
export function wrapText(text: string, maxWidth: number, fontSize: number): string {
  const perLine = Math.max(1, Math.floor(maxWidth / (fontSize * CHAR_WIDTH)));
  return text.split('\n').flatMap((paragraph) => {
    const lines: string[] = [];
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const piece = word.length > perLine ? word.match(new RegExp(`.{1,${perLine}}`, 'g')) ?? [word] : [word];
      for (const part of piece) {
        if (line && `${line} ${part}`.length > perLine) { lines.push(line); line = part; } else line = line ? `${line} ${part}` : part;
      }
    }
    lines.push(line);
    return lines;
  }).join('\n');
}

// Every element starts from this: a unique id, its place and size, and a first version.
export function make(type: string, props: El): El {
  return { id: newId(), type, x: 0, y: 0, width: 0, height: 0, version: 1, versionNonce: random(), seed: random(), ...props };
}

// A free-standing piece of text, or a label bound to a container (`containerId`).
export function textElement(props: { text: string; x: number; y: number; fontSize?: number; containerId?: string; align?: 'left' | 'center'; stroke?: string; boxWidth?: number }): El {
  const fontSize = props.fontSize ?? 20;
  const text = props.boxWidth ? wrapText(props.text, props.boxWidth, fontSize) : props.text;
  const size = measureText(text, fontSize);
  return make('text', {
    x: props.x,
    y: props.y,
    ...size,
    text,
    originalText: props.text,
    fontSize,
    fontFamily: FONT_FAMILY,
    lineHeight: LINE_HEIGHT,
    textAlign: props.align ?? 'left',
    verticalAlign: props.containerId ? 'middle' : 'top',
    autoResize: true,
    ...(props.containerId ? { containerId: props.containerId } : {}),
    ...(props.stroke ? { strokeColor: props.stroke } : {}),
  });
}

// Where a container's label goes: centered in it, wrapped to its width.
export function labelFor(container: El, text: string, fontSize = 20, stroke?: string): El {
  const inner = Math.max(40, container.width - 24);
  const label = textElement({ text, x: 0, y: 0, fontSize, containerId: container.id, align: 'center', boxWidth: inner, stroke });
  return centerLabel(container, label);
}

export function centerLabel(container: El, label: El): El {
  return { ...label, x: container.x + (container.width - label.width) / 2, y: container.y + (container.height - label.height) / 2 };
}

// The box around an element (a line's points are relative to its start).
export function boundsOf(el: El) {
  if (Array.isArray(el.points) && el.points.length) {
    const xs = el.points.map(([x]: number[]) => el.x + x);
    const ys = el.points.map(([, y]: number[]) => el.y + y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
  }
  return { x: el.x, y: el.y, width: el.width, height: el.height };
}

export function unionBounds(boxes: { x: number; y: number; width: number; height: number }[]) {
  if (!boxes.length) return null;
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return { x, y, width: Math.max(...boxes.map((b) => b.x + b.width)) - x, height: Math.max(...boxes.map((b) => b.y + b.height)) - y };
}

// A straight arrow between two elements: side to side if they sit in a row, otherwise top to bottom.
export function arrowEnds(from: El, to: El) {
  const a = boundsOf(from);
  const b = boundsOf(to);
  const horizontal = Math.abs(b.x + b.width / 2 - (a.x + a.width / 2)) >= Math.abs(b.y + b.height / 2 - (a.y + a.height / 2));
  const start = horizontal
    ? { x: b.x > a.x ? a.x + a.width : a.x, y: a.y + a.height / 2 }
    : { x: a.x + a.width / 2, y: b.y > a.y ? a.y + a.height : a.y };
  const end = horizontal
    ? { x: b.x > a.x ? b.x : b.x + b.width, y: b.y + b.height / 2 }
    : { x: b.x + b.width / 2, y: b.y > a.y ? b.y : b.y + b.height };
  return { start, end };
}

// An element with its version raised, so an open canvas takes the change instead of keeping its own.
export function bump(el: El, patch: El = {}): El {
  return { ...el, ...patch, version: (el.version ?? 0) + 1, versionNonce: random() };
}
