// The ⌘K command palette (Ctrl+K on Windows): jump to any prototype, a view of the
// open prototype, or an app page. Arrow keys move, Enter opens, Esc closes.
import { createContext, useContext, useEffect, useState } from 'react';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/studio/components/command';
import { firstView } from './Index.jsx';
import { viewLabel } from './PrototypeViewer.jsx';
import { isTyping } from './appPrefs.js';
import { navigate } from './navigate.jsx';

const PaletteContext = createContext(() => {});

// Opens the palette from anywhere, like the search button on the rail.
export const useOpenPalette = () => useContext(PaletteContext);

const entryParams = (p) => {
  const v = firstView(p);
  return { contributor: p.contributorKey, prototype: p.id, group: v?.group, view: v?.name };
};

export function CommandPaletteProvider({ params, manifest, children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() !== 'k' || !(e.metaKey || e.ctrlKey) || e.repeat) return;
      // When closed, leave ⌘K to text fields (a prototype may use it). When open, always toggle.
      if (!open && isTyping(e.target)) return;
      e.preventDefault();
      setOpen((o) => !o);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const go = (to) => {
    setOpen(false);
    navigate(to);
  };

  const prototypes = [...(manifest?.prototypes ?? [])].sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''));
  const current = prototypes.find((p) => p.contributorKey === params.contributor && p.id === params.prototype);
  const isCurrentView = (v) => {
    const entry = firstView(current);
    const view = params.view ?? entry?.name;
    const group = params.view ? params.group ?? null : entry?.group ?? null;
    return v.name === view && (v.group ?? null) === group;
  };

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
                    onSelect={() => go({ contributor: current.contributorKey, prototype: current.id, group: v.group, view: v.name })}
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
            <CommandItem value="prototypes index home" disabled={!params.page && !current} onSelect={() => go({})}>Prototypes</CommandItem>
            <CommandItem value="systems components" disabled={params.page === 'systems'} onSelect={() => go({ page: 'systems' })}>Systems</CommandItem>
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
                    onSelect={() => go(entryParams(p))}
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
