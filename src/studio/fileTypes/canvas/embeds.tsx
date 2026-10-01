// How an item appears on a canvas. It's a stock Excalidraw `embeddable` element whose `link` is
// the item's address, so Excalidraw owns paste, drop, selection, move and resize. Excalidraw
// calls `renderEmbeddable` for each one, and that is where the link becomes a live preview (if
// the item's file type has an Embed), or a card (if it doesn't), or a "not found" card (if the
// link points at nothing). This file knows nothing about any file type: it asks the registry.
import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { SquareArrowExpand01Icon } from '@hugeicons/core-free-icons';
import { CaptureUpdateAction, newElementWith } from '@excalidraw/excalidraw';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { AppState, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { fileTypeModules } from '@/studio/app/data/fileTypes';
import { itemLabel, itemLink } from '@/studio/app/data/manifest';
import type { Manifest, Prototype } from '@/studio/app/data/types';
import ItemCard, { ITEM_CARD_HEIGHT } from '@/studio/app/items/ItemCard';
import { appPathOf, isInPrototype, resolveItemPath } from '@/studio/app/items/itemLinks';

const HEADER_HEIGHT = 36;
const BORDER = 2; // 1px each side
const DEFAULT_WIDTH = 480;
const DEFAULT_BODY_HEIGHT = Math.round(DEFAULT_WIDTH * 900 / 1440); // a 1440 x 900 screen, scaled

// Excalidraw's `validateEmbeddable`: only links into this app are embeds. Anything else (a
// video, a web page) isn't, so a canvas never loads another site.
export const validateEmbed = (link: string) => appPathOf(link) !== null;

// A canvas shows only items from its own prototype, so a prototype is all of its own: an item from
// another one doesn't resolve (and its spot says so: ItemCard).
const resolve = (manifest: Manifest, link: string | null, current: Prototype) => {
  const path = link && appPathOf(link);
  return path && isInPrototype(path, current) ? resolveItemPath(manifest, path) : null;
};
const elsewhere = (link: string | null, current: Prototype) => {
  const path = link && appPathOf(link);
  return Boolean(path && !isInPrototype(path, current));
};
const embedOf = (manifest: Manifest, link: string | null, current: Prototype) => {
  const target = resolve(manifest, link, current);
  return target ? fileTypeModules[target.item.fileType]?.Embed : undefined;
};

// The size of a new embed: a preview is a screen, a card is a compact row.
function defaultSize(manifest: Manifest, link: string | null, current: Prototype) {
  return { width: DEFAULT_WIDTH, height: embedOf(manifest, link, current) ? HEADER_HEIGHT + BORDER + DEFAULT_BODY_HEIGHT : ITEM_CARD_HEIGHT };
}

const isItem = (el: ExcalidrawElement) => el.type === 'embeddable' && !el.isDeleted && el.link != null && appPathOf(el.link) !== null;

// Rules for items on a canvas (they're `embeddable` elements, but act like frames, not shapes):
// sized like a screen (or a card) when first inserted instead of Excalidraw's video-box default,
// square corners (rounding clipped the preview), no outline (the frame draws its own border), and
// no link icon (the title bar is the link).
// Kept out of undo history: undo must reverse only what the person did.
export function normalizeEmbeds(api: ExcalidrawImperativeAPI, elements: readonly ExcalidrawElement[], manifest: Manifest, current: Prototype) {
  const pending = elements.filter((el) => isItem(el) && (!el.customData?.frame || el.roundness || el.strokeColor !== 'transparent' || !el.customData?.hideLinkIcon));
  if (!pending.length) return;
  const ids = new Set(pending.map((el) => el.id));
  api.updateScene({
    elements: api.getSceneElementsIncludingDeleted().map((el) => {
      if (!ids.has(el.id)) return el;
      const size = defaultSize(manifest, el.type === 'embeddable' ? el.link : null, current);
      const placed = el.customData?.frame ? {} : { ...size, x: el.x - size.width / 2, y: el.y - size.height / 2 };
      // hideLinkIcon is read by our Excalidraw patch (patches/README.md).
      return newElementWith(el, { ...placed, roundness: null, strokeColor: 'transparent', customData: { ...el.customData, frame: true, hideLinkIcon: true } });
    }),
    captureUpdate: CaptureUpdateAction.NEVER,
  });
}

// True when every selected element is an item (they aren't styleable, so the style panel hides).
export function onlyItemsSelected(elements: readonly ExcalidrawElement[], appState: AppState) {
  const ids = Object.keys(appState.selectedElementIds);
  if (!ids.length) return false;
  const byId = new Map(elements.map((el) => [el.id, el]));
  return ids.every((id) => byId.get(id) && isItem(byId.get(id)!));
}

const CULL_MARGIN_PX = 400;
// Below this zoom a live preview is unreadable: show the item's name instead.
const OVERVIEW_ZOOM = 0.12;

// Whether an element is far off screen, and whether the canvas is zoomed out too far to read it.
// Flips only at the edges, so a still canvas doesn't re-render.
export function renderFlags(element: ExcalidrawElement, appState: AppState) {
  const zoom = appState.zoom.value || 1;
  const margin = CULL_MARGIN_PX / zoom;
  const left = -appState.scrollX - margin;
  const top = -appState.scrollY - margin;
  const right = -appState.scrollX + appState.width / zoom + margin;
  const bottom = -appState.scrollY + appState.height / zoom + margin;
  const offscreen = element.x > right || element.x + element.width < left || element.y > bottom || element.y + element.height < top;
  return { offscreen, overview: zoom < OVERVIEW_ZOOM };
}

type ItemProps = {
  element: ExcalidrawElement;
  manifest: Manifest;
  current: Prototype;
  offscreen: boolean;
  overview: boolean;
  // Has been near the viewport, so its preview is live. Before that it's a sized placeholder.
  mounted: boolean;
};

function CanvasItemInner({ element, manifest, current, offscreen, overview, mounted }: ItemProps) {
  const link = element.type === 'embeddable' ? element.link : null;
  const target = resolve(manifest, link, current);
  const Embed = target && fileTypeModules[target.item.fileType]?.Embed;
  // A card fills the element. A missing one is a card too, and so is one from another prototype.
  if (!target || !Embed) return <div data-canvas-frame="" className="h-full w-full"><ItemCard proto={target?.proto} item={target?.item} elsewhere={elsewhere(link, current)} /></div>;
  const { proto, item } = target;
  const hidden = offscreen || overview;
  return (
    <div data-canvas-frame="" className="relative flex h-full w-full flex-col overflow-hidden border border-border bg-background">
      {/* The whole title bar is the link that opens the item: gray so it reads as a control, an icon that
          turns teal on hover, and the word "Open" that appears with it. */}
      <Link
        {...itemLink(proto, item)}
        data-open
        aria-label={`Open ${itemLabel(item.path)}`}
        className="group/open flex shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/60 px-3 text-xs text-foreground no-underline transition-colors hover:bg-muted hover:no-underline"
        style={{ height: HEADER_HEIGHT }}
      >
        <span className="truncate font-semibold">{itemLabel(item.path)}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 font-medium">
          <span className="opacity-0 transition-opacity group-hover/open:text-primary group-hover/open:opacity-100">Open</span>
          <HugeiconsIcon icon={SquareArrowExpand01Icon} size={16} className="text-muted-foreground transition-colors group-hover/open:text-primary" />
        </span>
      </Link>
      {/* Hidden means mounted but skipped for layout and paint (far off screen, or too small to
          read), so the live preview never reloads or jumps. */}
      <div className="min-h-0 flex-1" style={hidden ? { visibility: 'hidden', contentVisibility: 'hidden' } : undefined}>
        {mounted
          ? <Embed proto={proto} item={item} width={element.width - BORDER} height={element.height - HEADER_HEIGHT - BORDER} />
          : <div className="h-full bg-muted/50" />}
      </div>
      {overview && !offscreen && <div className="canvas-overview"><span>{itemLabel(item.path)}</span></div>}
    </div>
  );
}

// Excalidraw calls `renderEmbeddable` on every render, including each pan and zoom frame.
// Without this, every live preview re-rendered per frame. It re-renders only when this element's
// own data changes.
export const CanvasItem = memo(CanvasItemInner, (a, b) => (
  a.manifest === b.manifest && a.current === b.current && a.element.id === b.element.id && a.element.version === b.element.version
  && a.offscreen === b.offscreen && a.overview === b.overview && a.mounted === b.mounted
));
