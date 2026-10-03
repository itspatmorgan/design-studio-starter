// The ⌘K palette's dialog. It loads shortly after the app starts (CommandPalette.tsx), so cmdk
// isn't in the main bundle.
import { Fragment } from 'react';
import { getRouteApi, useMatchRoute, useNavigate, useParams, type NavigateOptions } from '@tanstack/react-router';
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/platform/components/command';
import { referenceHref } from '@/platform/app/docs/References';
import { findItem, findPrototype, firstItem, itemFolder, itemLabel, itemLink } from '@/platform/app/data/manifest';
import { moduleApps, type PaletteContext } from '@/platform/app/modules';
import type { Item, Prototype } from '@/platform/app/data/types';

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

  // The open prototype, once its items have loaded (the route loads them: manifest.ts).
  const openRef = params.contributor && params.prototype ? findPrototype(manifest, params.contributor, params.prototype) : undefined;
  const current = openRef?.items ? (openRef as Prototype) : undefined;
  const openItem = current && (params._splat ? findItem(current, params._splat) : firstItem(current));
  const isOpen = (item: Item) => item === openItem;
  const onHome = Boolean(matchRoute({ to: '/' }));
  const context: PaletteContext = { manifest, current, isOpen, go };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search the studio" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
  
            {current && (
              <>
                <CommandGroup heading={`Views · ${current.title}`}>
                  {current.items.map((item) => (
                    <CommandItem
                      key={item.path}
                      value={`${itemLabel(item.path, current)} ${item.path}`}
                      disabled={isOpen(item)}
                      onSelect={() => go(itemLink(current, item))}
                    >
                      {itemFolder(item.path) && <span className="shrink-0 text-xs text-muted-foreground">{itemFolder(item.path)}</span>}
                      <span className="truncate">{itemLabel(item.path, current)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
  
            <CommandGroup heading="Places">
              <CommandItem value="documentation reference contracts" onSelect={() => go({ to: '/documentation/reference' })}>Reference</CommandItem>
              <CommandItem value="home overview" disabled={onHome} onSelect={() => go({ to: '/' })}>Home</CommandItem>
              {moduleApps.map(({ spec, app }) => app.places && <app.places key={spec.id} {...context} />)}
            </CommandGroup>

            {moduleApps.map(({ spec, app }) => app.palette && <Fragment key={spec.id}><app.palette {...context} /></Fragment>)}
            <CommandSeparator />
            <CommandGroup heading="Documentation">
              {manifest.platformReferences.flatMap((group) => group.references.map((ref) => <CommandItem key={ref.source} value={`reference ${group.label} ${ref.title} ${ref.source}`} onSelect={() => go({ to: referenceHref(ref.source) as never })}><span className="shrink-0 text-xs text-muted-foreground">{group.label}</span><span className="truncate">{ref.title}</span></CommandItem>))}
            </CommandGroup>

          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
