import { useEffect, useRef, useState, type RefObject } from 'react';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { OPENING_STATUS_DELAY_MS, OPENING_WAIT_MS, openingReady, settledEmbeds } from './opening';

// Pages and fitted embeds share one presentation boundary. Hidden scenes still lay out
// and load their previews. Later file changes, panning, and theme updates stay visible.
export function useCanvasOpening(container: RefObject<HTMLDivElement | null>, api: ExcalidrawImperativeAPI | null, expectedIds: () => string[]) {
  const expectedRef = useRef(expectedIds);
  expectedRef.current = expectedIds;
  const [revealed, setRevealed] = useState(false);
  const [openingStatus, setOpeningStatus] = useState(false);
  useEffect(() => {
    if (revealed) return undefined;
    const timer = window.setTimeout(() => setOpeningStatus(true), OPENING_STATUS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [revealed]);
  useEffect(() => {
    const root = container.current;
    if (!api || !root) return undefined;
    const started = Date.now();
    let expected: string[] | undefined;
    let finished = false;
    let second = 0;
    const finish = () => {
      if (finished) return;
      finished = true;
      observer.disconnect();
      window.clearTimeout(deadline);
      setRevealed(true);
    };
    const check = () => {
      if (expected && openingReady(expected, settledEmbeds(root), Date.now() - started)) finish();
    };
    const observer = new MutationObserver(check);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-preview-state', 'data-artifact-phase', 'role'] });
    const cameraPainted = () => {
      if (expected || finished) return;
      expected = expectedRef.current();
      check();
    };
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(cameraPainted); });
    // Hidden tabs may not run animation frames. The timer also bounds unsupported embeds.
    const cameraTimer = window.setTimeout(cameraPainted, 120);
    const deadline = window.setTimeout(finish, OPENING_WAIT_MS);
    return () => {
      observer.disconnect(); window.clearTimeout(cameraTimer); window.clearTimeout(deadline);
      cancelAnimationFrame(first); cancelAnimationFrame(second);
    };
  }, [api, container]);
  return { revealed, openingStatus };
}

export function CanvasOpeningSurface({ visible }: { visible: boolean }) {
  return <div role="status" className="canvas-opening-surface absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
    <span className={visible ? 'canvas-opening-shimmer' : 'sr-only'}>Opening canvas</span>
  </div>;
}
