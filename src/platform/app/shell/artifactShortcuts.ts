// Match the apostrophe key even when Shift changes its reported character to a quote.
export function artifactShortcut(event: Pick<KeyboardEvent, 'key' | 'code' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'repeat' | 'isComposing'>): 'source' | 'grid' | null {
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.repeat || event.isComposing) return null;
  if (event.code !== 'Quote' && event.key !== "'" && event.key !== '"') return null;
  return event.shiftKey ? 'grid' : 'source';
}

export const shortcutLabel = (action: 'source' | 'grid' | 'save') => {
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  if (action === 'save') return mac ? '⌘S' : 'Ctrl+S';
  if (action === 'grid') return mac ? "⌘⇧'" : "Ctrl+Shift+'";
  return mac ? "⌘'" : "Ctrl+'";
};
