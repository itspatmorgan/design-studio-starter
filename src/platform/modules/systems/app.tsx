// Systems in the app: its rail button, its routes (/systems, /systems/<system>, /systems/<system>/<page>),
// and the two systems in the ⌘K palette. The pages are in src/platform/modules/systems/pages/.
import { createRoute, lazyRouteComponent, redirect, useRouterState } from '@tanstack/react-router';
import { Shapes01Icon } from '@hugeicons/core-free-icons';
import { CommandItem } from '@/platform/components/command';
import { HomeSection } from '@/platform/app/items/HomeSection';
import { ItemRow } from '@/platform/app/items/ItemRow';
import { PROTOTYPE_SYSTEMS } from '@/platform/modules/systems/data/systems';
import { APP_NAME } from '@/platform/app/data/config';
import { itemLabel } from '@/platform/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/platform/core/api';

// Loaded on first visit, so it isn't in the main bundle:
// https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting
const SystemsPage = lazyRouteComponent(() => import('@/platform/modules/systems/pages/SystemsPage'));
const systemsTitle = (...parts: (string | undefined)[]) =>
  [...parts.filter(Boolean).map((p) => itemLabel(p!)), 'Systems', APP_NAME].join(' — ');

function SystemsPlaces({ go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const on = (system: string) => pathname === `/systems/${system}` || pathname.startsWith(`/systems/${system}/`);
  return (
    <>
      <CommandItem value="product system components" disabled={on('product')} onSelect={() => go({ to: '/systems/product' } as never)}>Product system</CommandItem>
      <CommandItem value="platform system components" disabled={on('platform')} onSelect={() => go({ to: '/systems/platform' } as never)}>Platform system</CommandItem>
    </>
  );
}

// On the front page: a link to each of the team's design systems. The studio's own is how the app itself is
// built, so it isn't offered here.
function Overview() {
  const systems = Object.entries(PROTOTYPE_SYSTEMS);
  if (!systems.length) return null;
  return (
    <HomeSection title="Design systems" to="/systems">
      <ul>{systems.map(([id, s]) => <ItemRow key={id} link={{ to: `/systems/${id}` }} icon={Shapes01Icon} title={s.label} />)}</ul>
    </HomeSection>
  );
}

export default {
  icon: Shapes01Icon,
  rail: 'top',
  order: 20,
  routes: (root) => {
    const systemsRoute = createRoute({ getParentRoute: () => root, path: 'systems' });
    return [systemsRoute.addChildren([
      createRoute({
        getParentRoute: () => systemsRoute,
        path: '/',
        beforeLoad: () => { throw redirect({ to: '/systems/product' as never, replace: true }); },
      }),
      createRoute({
        getParentRoute: () => systemsRoute,
        path: '$system',
        head: ({ params }) => ({ meta: [{ title: systemsTitle(params.system) }] }),
        component: SystemsPage,
      }),
      createRoute({
        getParentRoute: () => systemsRoute,
        path: '$system/$page',
        head: ({ params }) => ({ meta: [{ title: systemsTitle(params.page, params.system) }] }),
        component: SystemsPage,
      }),
    ])];
  },
  overview: Overview,
  places: SystemsPlaces,
} satisfies ModuleApp;
