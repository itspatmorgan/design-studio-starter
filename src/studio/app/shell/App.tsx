import { HeadContent, Link, Outlet, useMatch } from '@tanstack/react-router';
import MainNav from '@/studio/app/shell/MainNav';
import { TooltipProvider } from '@/studio/components/tooltip';
import { CommandPaletteProvider } from '@/studio/app/shell/CommandPalette';
import { SectionNavContext, useColorMode, useSectionNav } from '@/studio/app/shell/appPrefs';

// The root route's layout: the rail, the current page, and the ⌘K palette.
export default function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const sectionNav = useSectionNav();
  // A prototype is open (not a not-found page under a prototype-shaped URL).
  const inPrototype = useMatch({ from: '/$contributor/$prototype', shouldThrow: false })?.status === 'success';

  return (
    <TooltipProvider>
      <HeadContent />
      <SectionNavContext.Provider value={sectionNav.open}>
        <CommandPaletteProvider>
          <div className="flex h-screen overflow-hidden">
            <MainNav colorMode={colorMode} onToggleColorMode={toggleColorMode} sectionNav={inPrototype ? sectionNav : null} />
            <div className="flex min-w-0 flex-1 flex-col overflow-auto">
              <Outlet />
            </div>
          </div>
        </CommandPaletteProvider>
      </SectionNavContext.Provider>
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
