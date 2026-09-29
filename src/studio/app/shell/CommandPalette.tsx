// The ⌘K command palette (Ctrl+K on Windows): jump to any prototype, a view of the
// open prototype, or an app page. Arrow keys move, Enter opens, Esc closes.
import { createContext, lazy, Suspense, useContext, useEffect, useState, type ReactNode } from 'react';
import { isTyping } from '@/studio/app/shell/appPrefs';

// The dialog and its list live in their own file, loaded a moment after the app starts.
const loadDialog = () => import('@/studio/app/shell/CommandPaletteDialog');
const CommandPaletteDialog = lazy(loadDialog);

const PaletteContext = createContext(() => {});
// Opens the palette from anywhere, like the search button on the rail.
export const useOpenPalette = () => useContext(PaletteContext);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Mounted from the first time it opens, and kept, so closing can animate.
  const [opened, setOpened] = useState(false);
  useEffect(() => { if (open) setOpened(true); }, [open]);
  useEffect(() => {
    const id = setTimeout(loadDialog, 1500);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'k' || !(e.metaKey || e.ctrlKey) || e.repeat) return;
      // When closed, leave ⌘K to text fields (a prototype may use it). When open, always toggle.
      if (!open && isTyping(e.target)) return;
      e.preventDefault();
      setOpen((o) => !o);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <PaletteContext.Provider value={() => setOpen(true)}>
      {children}
      {opened && <Suspense fallback={null}><CommandPaletteDialog open={open} setOpen={setOpen} /></Suspense>}
    </PaletteContext.Provider>
  );
}
