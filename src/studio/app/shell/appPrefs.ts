// App UI preferences, saved in localStorage so they survive a reload.
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { flushSync } from 'react-dom';

const COLOR_MODE_KEY = 'design-studio:color-mode';   // "light" | "dark"; unset = follow the system
const SECTION_NAV_KEY = 'design-studio:section-nav'; // "open" | "closed"
const SECTION_NAV_WIDTH_KEY = 'design-studio:section-nav-width'; // pixels

const systemMode = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Light or dark for the whole app. Prototypes follow it through the .dark block in theme.css.
// Follows the system until you pick a mode with the toggle.
export function useColorMode() {
  const [colorMode, setColorMode] = useState(() => localStorage.getItem(COLOR_MODE_KEY) ?? systemMode());

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', colorMode === 'dark');
  }, [colorMode]);

  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (!localStorage.getItem(COLOR_MODE_KEY)) setColorMode(systemMode()); };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const toggleColorMode = useCallback(() => {
    const flip = () => flushSync(() => setColorMode((mode) => {
      const next = mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem(COLOR_MODE_KEY, next);
      return next;
    }));
    // Cross-fade when the browser supports it and motion is welcome.
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(flip);
    } else flip();
  }, []);

  return { colorMode, toggleColorMode };
}

// True when focus is in a text field, so shortcuts don't steal keystrokes.
export const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// The prototype navigation's open/closed state. ⌘; (Ctrl+; on Windows) toggles it.
export function useSectionNav() {
  const [open, setOpen] = useState(() => localStorage.getItem(SECTION_NAV_KEY) !== 'closed');

  useEffect(() => {
    localStorage.setItem(SECTION_NAV_KEY, open ? 'open' : 'closed');
  }, [open]);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ';' || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.repeat || isTyping(e.target)) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);

  return { open, toggle };
}

// Whether the prototype navigation is showing, for the prototype layout.
export const SectionNavContext = createContext(true);
export const useSectionNavOpen = () => useContext(SectionNavContext);

// The prototype navigation's width. Drag its right edge (or focus the edge and use the
// arrow keys) to resize; double-click or Enter resets it. Saved when you let go.
export const NAV_WIDTH = { default: 220, min: 180, max: 420 };
const clampWidth = (w: number) => Math.min(NAV_WIDTH.max, Math.max(NAV_WIDTH.min, Math.round(w)));

export function useSectionNavWidth() {
  const [width, setWidth] = useState(() => {
    const saved = Number(localStorage.getItem(SECTION_NAV_WIDTH_KEY));
    return saved ? clampWidth(saved) : NAV_WIDTH.default;
  });
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (!resizing) localStorage.setItem(SECTION_NAV_WIDTH_KEY, String(width));
  }, [width, resizing]);

  // While dragging, keep the resize cursor everywhere and stop text from being selected.
  useEffect(() => {
    if (!resizing) return;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => { document.body.style.cursor = ''; document.body.style.userSelect = ''; };
  }, [resizing]);

  const handleProps = {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;
      setResizing(true);
      const onMove = (m: PointerEvent) => setWidth(clampWidth(startWidth + m.clientX - startX));
      const onUp = () => {
        setResizing(false);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    onDoubleClick: () => setWidth(NAV_WIDTH.default),
    onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => {
      const step = e.shiftKey ? 24 : 8;
      const next = { ArrowLeft: width - step, ArrowRight: width + step, Home: NAV_WIDTH.min, End: NAV_WIDTH.max, Enter: NAV_WIDTH.default }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      setWidth(clampWidth(next));
    },
  };

  return { width, resizing, handleProps };
}

