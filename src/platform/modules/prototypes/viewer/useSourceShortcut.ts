import { useEffect } from 'react';
import { artifactShortcut } from '@/platform/app/shell/artifactShortcuts';

// Capture before CodeMirror and Excalidraw, while leaving forms and modal interactions alone.
export function useSourceShortcut(enabled: boolean, source: boolean, toggle: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || artifactShortcut(event) !== 'source') return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')) return;
      const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
      if (typing && !(source && target?.closest('.cm-editor'))) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      toggle();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [enabled, source, toggle]);
}
