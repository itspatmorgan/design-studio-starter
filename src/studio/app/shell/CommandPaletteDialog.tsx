// The ⌘K palette's dialog. It loads shortly after the app starts (CommandPalette.tsx), so cmdk
// isn't in the main bundle.
import { Fragment } from 'react';
import { getRouteApi, useMatchRoute, useNavigate, useParams, type NavigateOptions } from '@tanstack/react-router';
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/studio/components/command';
import { findItem, findPrototype, firstItem, itemFolder, itemLabel, itemLink, newestFirst, prototypeLink } from '@/studio/app/data/manifest';
import { moduleApps, type PaletteContext } from '@/studio/app/modules';
import type { Item, Prototype } from '@/studio/app/data/types';

const rootApi = getRouteApi('__root__');

export default function CommandPaletteDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const manifest = rootApi.useLoaderData();
  const params = useParams({ strict: false });
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();

  const go = (to: NavigateOptions) => {
    setOpen(false);
    navigate(to);
  };

  const prototypes = [...manifest.prototypes].sort(newestFirst);
  // The open prototype, once its items have loaded (the route loads them: manifest.ts).
  const openRef = params.contributor && params.prototype ? findPrototype(manifest, params.contributor, params.prototype) : undefined;
  const current = openRef?.items ? (openRef as Prototype) : undefined;
  const openItem = current && (params._splat ? findItem(current, params._splat) : firstItem(current));
  const isOpen = (item: Item) => item === openItem;
  const onIndex = Boolean(matchRoute({ to: '/' }));
  const context: PaletteContext = { manifest, current, isOpen, go };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search prototypes, views, pages" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
  
            {current && (
              <>
                <CommandGroup heading={`Views · ${current.title}`}>
                  {current.items.map((item) => (
                    <CommandItem
                      key={item.path}
                      value={`${itemLabel(item.path)} ${item.path}`}
                      disabled={isOpen(item)}
                      onSelect={() => go(itemLink(current, item))}
                    >
                      {itemFolder(item.path) && <span className="shrink-0 text-xs text-muted-foreground">{itemFolder(item.path)}</span>}
                      <span className="truncate">{itemLabel(item.path)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
  
            <CommandGroup heading="Places">
              <CommandItem value="prototypes index home" disabled={onIndex} onSelect={() => go({ to: '/' })}>Prototypes</CommandItem>
              {moduleApps.map(({ spec, app }) => app.places && <app.places key={spec.id} {...context} />)}
            </CommandGroup>

            {moduleApps.map(({ spec, app }) => app.palette && <Fragment key={spec.id}><app.palette {...context} /></Fragment>)}

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
        </Command>
      </CommandDialog>
    </>
  );
}
