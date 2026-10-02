// The card, drawn onto a canvas. The preview and the exported PNG use this same function, so what you see
// is what you get. Text comes from the URL or a field, so it is only ever drawn as canvas text.
import { cleanQuote } from './text.ts';

export type SizeId = 'square' | 'wide' | 'story';
export type StyleId = 'light' | 'dark' | 'accent';

export const SIZES: Record<SizeId, { label: string; width: number; height: number }> = {
  square: { label: 'Square', width: 1080, height: 1080 },
  wide: { label: 'Wide', width: 1600, height: 900 },
  story: { label: 'Story', width: 1080, height: 1920 },
};

export const STYLES: { id: StyleId; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'accent', label: 'Accent' },
];

export const ACCENTS = [
  { id: 'emerald', label: 'Emerald', color: '#059669' },
  { id: 'orange', label: 'Orange', color: '#ea580c' },
  { id: 'violet', label: 'Violet', color: '#7c3aed' },
  { id: 'blue', label: 'Blue', color: '#2563eb' },
  { id: 'rose', label: 'Rose', color: '#e11d48' },
  { id: 'stone', label: 'Stone', color: '#57534e' },
];

export type CardSpec = {
  quote: string;
  customer: string;
  source: string;
  size: SizeId;
  style: StyleId;
  accent: string; // an id from ACCENTS
  showSource: boolean;
};

export const FONT = '"Space Grotesk Variable", system-ui, sans-serif';

const palette = (style: StyleId, accent: string) => {
  if (style === 'dark') return { bg: '#1c1917', fg: '#fafaf9', muted: '#a8a29e', mark: accent };
  if (style === 'accent') return { bg: accent, fg: '#ffffff', muted: 'rgba(255,255,255,0.78)', mark: 'rgba(255,255,255,0.45)' };
  return { bg: '#fafaf9', fg: '#1c1917', muted: '#78716c', mark: accent };
};

// Breaks text into lines no wider than maxWidth. A word wider than that is broken by characters.
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const tryLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(tryLine).width <= maxWidth) { line = tryLine; continue; }
    if (line) lines.push(line);
    line = '';
    let rest = word;
    while (ctx.measureText(rest).width > maxWidth) {
      let cut = rest.length - 1;
      while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > maxWidth) cut--;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }
    line = rest;
  }
  if (line) lines.push(line);
  return lines;
}

// The largest type size at which the quote fits the box. If even the smallest doesn't, the last line is cut with an ellipsis.
function fitQuote(ctx: CanvasRenderingContext2D, text: string, width: number, height: number, max: number, min: number) {
  for (let size = max; size >= min; size -= 2) {
    ctx.font = `600 ${size}px ${FONT}`;
    const lines = wrap(ctx, text, width);
    if (lines.length * size * 1.22 <= height) return { size, lines };
  }
  ctx.font = `600 ${min}px ${FONT}`;
  const fit = Math.max(1, Math.floor(height / (min * 1.22)));
  const lines = wrap(ctx, text, width).slice(0, fit);
  let last = lines[lines.length - 1] ?? '';
  while (last.length > 1 && ctx.measureText(`${last}…`).width > width) last = last.slice(0, -1);
  lines[lines.length - 1] = `${last}…`;
  return { size: min, lines };
}

export function drawCard(canvas: HTMLCanvasElement, spec: CardSpec) {
  const { width: w, height: h } = SIZES[spec.size];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const accent = ACCENTS.find((a) => a.id === spec.accent)?.color ?? ACCENTS[0].color;
  const c = palette(spec.style, accent);
  // Everything scales with the shorter side, so a wide card isn't padded by its width.
  const u = Math.min(w, h);
  const pad = Math.round(u * 0.09);

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.textBaseline = 'alphabetic';

  // The opening quotation mark.
  const markSize = Math.round(u * 0.18);
  ctx.fillStyle = c.mark;
  ctx.font = `700 ${markSize}px ${FONT}`;
  ctx.fillText('“', pad - markSize * 0.04, pad + markSize * 0.78);

  // The footer: who said it, and where.
  const customer = spec.customer.trim();
  const via = spec.showSource && spec.source ? `via ${spec.source}` : '';
  const nameSize = Math.round(u * 0.034);
  const viaSize = Math.round(u * 0.027);
  const footerHeight = (customer ? nameSize * 1.4 : 0) + (via ? viaSize * 1.5 : 0);
  let y = h - pad - footerHeight;
  if (customer || via) {
    ctx.fillStyle = spec.style === 'accent' ? 'rgba(255,255,255,0.6)' : accent;
    ctx.fillRect(pad, y - nameSize * 0.9, Math.round(u * 0.06), Math.max(4, Math.round(u * 0.005)));
  }
  if (customer) {
    y += nameSize;
    ctx.fillStyle = c.fg;
    ctx.font = `600 ${nameSize}px ${FONT}`;
    ctx.fillText(customer.slice(0, 80), pad, y);
    y += nameSize * 0.4;
  }
  if (via) {
    y += viaSize * 1.1;
    ctx.fillStyle = c.muted;
    ctx.font = `400 ${viaSize}px ${FONT}`;
    ctx.fillText(via, pad, y);
  }

  // The quote, in the space between the mark and the footer.
  const quote = cleanQuote(spec.quote);
  const top = pad + markSize * 0.95;
  const boxHeight = h - pad - footerHeight - nameSize * 1.6 - top;
  const boxWidth = w - pad * 2;
  const text = quote || 'Type or paste a quote';
  const { size, lines } = fitQuote(ctx, text, boxWidth, boxHeight, Math.round(u * 0.095), Math.round(u * 0.03));
  ctx.fillStyle = quote ? c.fg : c.muted;
  ctx.font = `600 ${size}px ${FONT}`;
  // A short quote sits in the middle of the space it has, not at the top.
  const offset = Math.max(0, (boxHeight - lines.length * size * 1.22) / 2);
  lines.forEach((line, i) => ctx.fillText(line, pad, top + offset + size + i * size * 1.22));
}

// The card as a PNG, drawn fresh at full size.
export function cardPng(spec: CardSpec): Promise<Blob> {
  const canvas = document.createElement('canvas');
  drawCard(canvas, spec);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not make the image.'))), 'image/png'));
}
