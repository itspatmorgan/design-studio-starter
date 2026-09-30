import { useCallback, useState } from 'react';
import { HeadContent, Link, Outlet } from '@tanstack/react-router';
import MainNav from '@/studio/app/shell/MainNav';
import { TooltipProvider } from '@/studio/components/tooltip';
import { Toaster } from '@/studio/components/toast';
import { CommandPaletteProvider } from '@/studio/app/shell/CommandPalette';
import { SectionNavContext, SectionNavPresenceContext, useColorMode, useSectionNav } from '@/studio/app/shell/appPrefs';

// The root route's layout: the rail, the current page, and the ⌘K palette.
export default function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const sectionNav = useSectionNav();
  // How many section navigations are on the page (each SectionNav registers itself), so the rail
  // offers its hide/show toggle exactly when there is one.
  const [navs, setNavs] = useState(0);
  const registerNav = useCallback((present: boolean) => setNavs((n) => n + (present ? 1 : -1)), []);

  return (
    <TooltipProvider>
      <HeadContent />
      <SectionNavContext.Provider value={sectionNav.open}>
        <SectionNavPresenceContext.Provider value={registerNav}>
          <CommandPaletteProvider>
            <div className="flex h-screen overflow-hidden">
              <MainNav colorMode={colorMode} onToggleColorMode={toggleColorMode} sectionNav={navs > 0 ? sectionNav : null} />
              <div className="flex min-w-0 flex-1 flex-col overflow-auto">
                <Outlet />
              </div>
            </div>
          </CommandPaletteProvider>
        </SectionNavPresenceContext.Provider>
      </SectionNavContext.Provider>
      <Toaster />
    </TooltipProvider>
  );
}

// Unknown URLs, prototypes, and views.
export function NotFound() {
  return (
    <div className="space-y-2 p-8">
      <p className="text-sm font-medium text-foreground">Page not found</p>
      <p className="text-sm text-muted-foreground">
        There's nothing at this address. <Link to="/" className="text-primary hover:underline">View all prototypes</Link>
      </p>
    </div>
  );
}
