import { useEffect } from 'react';
import { artifactShortcut } from '@/platform/app/shell/artifactShortcuts';

// Capture before CodeMirror and Excalidraw, while leaving forms and modal interactions alone.
export function useSourceShortcut(enabled: boolean, source: boolean, toggle: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || artifactShortcut(event) !== 'source') return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      // Embedded screens can display sample dialogs inside inert, read-only previews.
      // Only interactive dialogs and menus should block the page's source shortcut.
      const overlays = document.querySelectorAll('[role="dialog"], [role="alertdialog"], [role="menu"]');
      if (Array.from(overlays).some(overlay => !overlay.closest('[inert]'))) return;
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
