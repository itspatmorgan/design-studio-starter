// The ⌘K palette's dialog. It loads shortly after the app starts (CommandPalette.tsx), so cmdk
// isn't in the main bundle.
import { getRouteApi, useMatchRoute, useNavigate, useParams, type NavigateOptions } from '@tanstack/react-router';
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/studio/components/command';
import { findItem, firstItem, itemFolder, itemLabel, itemLink, newestFirst, prototypeLink } from '@/studio/app/data/manifest';
import type { Item } from '@/studio/app/data/types';

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
  const current = prototypes.find((p) => p.contributorKey === params.contributor && p.id === params.prototype);
  const openItem = current && (params._splat ? findItem(current, params._splat) : firstItem(current));
  const isOpen = (item: Item) => item === openItem;
  const onIndex = Boolean(matchRoute({ to: '/' }));
  const onSystem = (system: 'product' | 'studio') => matchRoute({ to: '/systems/$system', params: { system }, fuzzy: true }) !== false;

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search prototypes, views, pages..." />
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
              <CommandItem value="product system components" disabled={onSystem('product')} onSelect={() => go({ to: '/systems/$system', params: { system: 'product' } })}>Product system</CommandItem>
              <CommandItem value="studio system components" disabled={onSystem('studio')} onSelect={() => go({ to: '/systems/$system', params: { system: 'studio' } })}>Studio system</CommandItem>
            </CommandGroup>

            <CommandSeparator />
            <CommandGroup heading="Guide">
              {manifest.guide.map((page) => (
                <CommandItem
                  key={page.slug}
                  value={`guide ${page.title} ${page.description}`}
                  disabled={matchRoute({ to: '/guide/$page', params: { page: page.slug } }) !== false || (page.slug === 'index' && matchRoute({ to: '/guide' }) !== false)}
                  onSelect={() => go(page.slug === 'index' ? { to: '/guide' } : { to: '/guide/$page', params: { page: page.slug } })}
                >
                  {page.title}
                </CommandItem>
              ))}
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
        </Command>
      </CommandDialog>
    </>
  );
}
