// App UI preferences, saved in localStorage so they survive a reload.
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';

const COLOR_MODE_KEY = 'design-studio:color-mode';   // "light" | "dark"; unset = follow the system
const SECTION_NAV_KEY = 'design-studio:section-nav'; // "open" | "closed"

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
