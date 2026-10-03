// Shared separately from the provider so provider hot reloads preserve context identity.
import { createContext, useContext } from 'react';

export const PaletteContext = createContext<(() => void) | null>(null);

export function useOpenPalette() {
  const open = useContext(PaletteContext);
  if (!open) throw new Error('useOpenPalette requires CommandPaletteProvider.');
  return open;
}
