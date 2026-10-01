// Tools in the app: its rail button, the /tools page, and the tools in the ⌘K palette. A tool itself opens
// through the prototype routes, at /tools/<id>.
import { createRoute, useRouterState } from '@tanstack/react-router';
import { Wrench01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/studio/components/command';
import { APP_NAME } from '@/studio/app/data/config';
import { prototypeLink } from '@/studio/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/studio/app/modules';
import ToolsPage from './ToolsPage';

function ToolsPlaces({ go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <CommandItem value="tools apps" disabled={pathname === '/tools'} onSelect={() => go({ to: '/tools' } as never)}>Tools</CommandItem>;
}

function ToolsPalette({ manifest, current, go }: PaletteContext) {
  if (!manifest.tools.length) return null;
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Tools">
        {manifest.tools.map((t) => (
          <CommandItem key={t.id} value={`tool ${t.title} ${t.description ?? ''} ${t.id}`} disabled={t === current} onSelect={() => go(prototypeLink(t))}>
            <span className="truncate">{t.title}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}

export default {
  icon: Wrench01Icon,
  rail: 'top',
  order: 10,
  routes: (root) => [
    createRoute({
      getParentRoute: () => root,
      path: 'tools',
      head: () => ({ meta: [{ title: `Tools — ${APP_NAME}` }] }),
      component: ToolsPage,
    }),
  ],
  places: ToolsPlaces,
  palette: ToolsPalette,
} satisfies ModuleApp;
