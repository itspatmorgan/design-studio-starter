import { lazy, Suspense } from 'react';
// Systems in the app: its rail button, its routes (/systems, /systems/<system>, /systems/<system>/<page>),
// and prototype systems in the ⌘K palette. The pages are in src/modules/systems/pages/.
import { createRoute, redirect, useRouterState } from '@tanstack/react-router';
import { Shapes01Icon } from '@hugeicons/core-free-icons';
import { CommandGroup, CommandItem } from '@/systems/studio/components/command';
import { HomeSection } from '@/platform/app/items/HomeSection';
import { ItemRow } from '@/platform/app/items/ItemRow';
import { DEFAULT_SYSTEM, PROTOTYPE_SYSTEMS, SYSTEM_SPECS } from '@/modules/systems/data/systems';
import { APP_NAME } from '@/platform/app/data/config';
import { artifactLabel, artifactLink } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';

// Loaded on first visit, so it isn't in the main bundle:
// https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting
const SystemsPage = lazy(() => import('@/modules/systems/pages/SystemsPage'));
const systemsTitle = (...parts: (string | undefined)[]) =>
  [...parts.filter(Boolean).map((p) => artifactLabel(p!)), 'Systems', APP_NAME].join(' — ');

function SystemsPlaces({ go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const on = (system: string) => pathname === `/systems/${system}` || pathname.startsWith(`/systems/${system}/`);
  // The team's own design systems, one entry each. The platform's own system is how the app itself is built, so the
  // palette, which searches the team's content, leaves it out.
  return (
    <>
      {Object.entries(PROTOTYPE_SYSTEMS).map(([id, system]) => (
        <CommandItem key={id} value={`${system.label} system components`} disabled={on(id)} onSelect={() => go({ to: `/systems/${id}` } as never)}>{system.label} system</CommandItem>
      ))}
    </>
  );
}

function SystemFiles({ manifest, go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return <>{manifest.systemContent.filter((section) => SYSTEM_SPECS[section.system!]?.role !== 'platform' && section.artifacts.length).map((section) =>
    <CommandGroup key={section.id} heading={PROTOTYPE_SYSTEMS[section.system!]?.label + ' · ' + section.title}>
      {section.artifacts.map((item) => { const link = artifactLink(section, item); return <CommandItem key={item.path} value={section.system + ' ' + section.title + ' ' + item.path} disabled={pathname === link.to} onSelect={() => go(link)}>{artifactLabel(item.path)}</CommandItem>; })}
    </CommandGroup>)}</>;
}

// On the front page: a link to the team's design systems, three at most. The platform's own is how the app itself is
// built, so it isn't offered here.
function Overview() {
  const systems = Object.entries(PROTOTYPE_SYSTEMS).slice(0, 3);
  if (!systems.length) return null;
  return (
    <HomeSection title="Systems" to="/systems">
      <ul>{systems.map(([id, s]) => <ItemRow key={id} link={{ to: `/systems/${id}` }} icon={Shapes01Icon} title={s.label} />)}</ul>
    </HomeSection>
  );
}

export default {
  icon: Shapes01Icon,
  rail: 'top',
  order: 20,
  routes: (root) => {
    const systemsRoute = createRoute({ getParentRoute: () => root, path: 'systems', validateSearch: (search: Record<string, unknown>): { mode?: 'source' } => ({ mode: search.mode === 'source' ? 'source' : undefined }) });
    return [systemsRoute.addChildren([
      createRoute({
        getParentRoute: () => systemsRoute,
        path: '/',
        beforeLoad: () => { throw redirect({ to: '/systems/$system' as never, params: { system: DEFAULT_SYSTEM } as never, replace: true }); },
      }),
      createRoute({
        getParentRoute: () => systemsRoute,
        path: '$system',
        head: ({ params }) => ({ meta: [{ title: systemsTitle(params.system) }] }),
        component: () => <Suspense fallback={null}><SystemsPage /></Suspense>,
      }),
      createRoute({
        getParentRoute: () => systemsRoute,
        path: '$system/$page',
        head: ({ params }) => ({ meta: [{ title: systemsTitle(params.page, params.system) }] }),
        component: () => <Suspense fallback={null}><SystemsPage /></Suspense>,
      }),
      createRoute({
        getParentRoute: () => systemsRoute,
        path: '$system/$page/$',
        head: ({ params }) => ({ meta: [{ title: systemsTitle(params._splat?.split('/').pop(), params.page, params.system) }] }),
        component: () => <Suspense fallback={null}><SystemsPage /></Suspense>,
      }),
    ])];
  },
  overview: Overview,
  places: SystemsPlaces,
  palette: SystemFiles,
} satisfies ModuleApp;
