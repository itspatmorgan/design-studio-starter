// The ⌘K command palette (Ctrl+K on Windows): jump to any prototype, a view of the
// open prototype, or an app page. Arrow keys move, Enter opens, Esc closes.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getRouteApi, useMatchRoute, useNavigate, useParams, type NavigateOptions } from '@tanstack/react-router';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/studio/components/command';
import { firstView, newestFirst, prototypeLink, viewLabel, viewLink, viewSlug } from './manifest';
import { isTyping } from './appPrefs';
import type { View } from './types';

const PaletteContext = createContext(() => {});
const rootApi = getRouteApi('__root__');

// Opens the palette from anywhere, like the search button on the rail.
export const useOpenPalette = () => useContext(PaletteContext);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const manifest = rootApi.useLoaderData();
  const params = useParams({ strict: false });
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();

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

  const go = (to: NavigateOptions) => {
    setOpen(false);
    navigate(to);
  };

  const prototypes = [...manifest.prototypes].sort(newestFirst);
  const current = prototypes.find((p) => p.contributorKey === params.contributor && p.id === params.prototype);
  const isCurrentView = (v: View) => {
    if (!params.view) return v === (current && firstView(current));
    return viewSlug(v.name) === params.view && (v.group ?? undefined) === params.group;
  };
  const onIndex = Boolean(matchRoute({ to: '/' }));
  const onSystems = Boolean(matchRoute({ to: '/systems' }));

  return (
    <PaletteContext.Provider value={() => setOpen(true)}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search prototypes, views, pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {current && (
            <>
              <CommandGroup heading={`Views · ${current.title}`}>
                {current.views.map((v) => (
                  <CommandItem
                    key={`${v.group}/${v.name}`}
                    value={`${v.group ?? ''} ${viewLabel(v.name)} ${v.name}`}
                    disabled={isCurrentView(v)}
                    onSelect={() => go(viewLink(current, v))}
                  >
                    {v.group && <span className="shrink-0 text-xs text-muted-foreground">{viewLabel(v.group)}</span>}
                    <span className="truncate">{viewLabel(v.name)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading="Places">
            <CommandItem value="prototypes index home" disabled={onIndex} onSelect={() => go({ to: '/' })}>Prototypes</CommandItem>
            <CommandItem value="systems components" disabled={onSystems} onSelect={() => go({ to: '/systems' })}>Systems</CommandItem>
          </CommandGroup>

          {prototypes.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Prototypes">
                {prototypes.map((p) => (
                  <CommandItem
                    key={`${p.contributorKey}/${p.id}`}
                    value={`${p.title} ${p.description ?? ''} ${p.contributor ?? ''} ${p.contributorKey}/${p.id}`}
                    disabled={p === current}
                    onSelect={() => go(prototypeLink(p))}
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{(p.contributor || p.contributorKey).split(' ')[0]}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </PaletteContext.Provider>
  );
}
