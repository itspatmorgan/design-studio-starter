// Canvas keyboard shortcuts on top of Excalidraw's:
//   ⌘. / Ctrl+.  hide or show all canvas controls
//   N            a new sticky note at the pointer (or the middle of the view); editing only
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { CaptureUpdateAction } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { noteAt } from './stickyNotes';

const typing = (target: EventTarget | null) => (target as HTMLElement | null)?.closest?.('input, textarea, [contenteditable="true"]');

export function useCanvasShortcuts(api: ExcalidrawImperativeAPI | null, container: RefObject<HTMLElement | null>, { editable }: { editable: boolean }) {
  const [controlsHidden, setControlsHidden] = useState(false);
  const toggleControls = useCallback(() => setControlsHidden((hidden) => !hidden), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '.' || !(event.metaKey || event.ctrlKey) || typing(event.target)) return;
      event.preventDefault();
      toggleControls();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleControls]);

  // The last pointer position in canvas coordinates, for placing notes.
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const onPointerUpdate = useCallback(({ pointer: p }: { pointer: { x: number; y: number } }) => { pointer.current = p; }, []);

  useEffect(() => {
    const el = container.current;
    if (!el || !api || !editable) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'n' || event.metaKey || event.ctrlKey || event.altKey || typing(event.target)) return;
      const state = api.getAppState();
      if (state.editingTextElement) return;
      event.preventDefault();
      const zoom = state.zoom.value || 1;
      const note = noteAt(pointer.current ?? { x: -state.scrollX + state.width / zoom / 2, y: -state.scrollY + state.height / zoom / 2 });
      api.updateScene({
        elements: [...api.getSceneElementsIncludingDeleted(), ...note],
        appState: { selectedElementIds: { [note[0].id]: true } },
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
    };
    el.addEventListener('keydown', onKeyDown, true);
    return () => el.removeEventListener('keydown', onKeyDown, true);
  }, [api, container, editable]);

  return { controlsHidden, toggleControls, onPointerUpdate };
}
