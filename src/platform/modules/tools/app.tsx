// Tools in the app: its rail button, the /tools page, and the tools in the ⌘K palette. A tool itself opens
// through the prototype routes, at /tools/<id>.
import { createRoute, useRouterState } from '@tanstack/react-router';
import { Wrench01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem, CommandSeparator } from '@/platform/components/command';
import { HomeSection } from '@/platform/app/items/HomeSection';
import { APP_NAME } from '@/platform/app/data/config';
import { prototypeLink } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';
import type { Manifest } from '@/platform/app/data/types';
import ToolsPage from './ToolsPage';
import { ToolRow } from './ToolCard';
import { useToolActions } from './actions';

function ToolsPlaces({ go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <CommandItem value="tools apps" disabled={pathname === '/tools'} onSelect={() => go({ to: '/tools' } as never)}>Tools</CommandItem>;
}

function ToolsPalette({ manifest, current, go }: PaletteContext) {
  const tools = manifest.sections.tools ?? [];
  if (!tools.length) return null;
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Tools">
        {tools.map((t) => (
          <CommandItem key={t.id} value={`tool ${t.title} ${t.description ?? ''} ${t.id}`} disabled={t === current} onSelect={() => go(prototypeLink(t))}>
            <span className="truncate">{t.title}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}

// On the front page: the first few tools, with a link to all of them.
function Overview({ manifest }: { manifest: Manifest }) {
  const tools = (manifest.sections.tools ?? []).filter((t) => t.status !== 'archived').slice(0, 3);
  if (!tools.length) return null;
  return (
    <HomeSection title="Tools" to="/tools">
      <ul>{tools.map((t) => <ToolRow key={t.id} tool={t} />)}</ul>
    </HomeSection>
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
  useActions: useToolActions,
  overview: Overview,
  places: ToolsPlaces,
  palette: ToolsPalette,
} satisfies ModuleApp;
