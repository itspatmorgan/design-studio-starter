// Systems in the app: its rail button, its routes (/systems, /systems/<system>, /systems/<system>/<page>),
// and the two systems in the ⌘K palette. The pages are in src/studio/app/pages/systems/.
import { createRoute, lazyRouteComponent, redirect, useRouterState } from '@tanstack/react-router';
import { Shapes01Icon } from '@hugeicons/core-free-icons';
import { CommandItem } from '@/studio/components/command';
import { APP_NAME } from '@/studio/app/data/config';
import { itemLabel } from '@/studio/app/data/manifest';
import type { ModuleApp, PaletteContext } from '@/studio/app/modules';

// Loaded on first visit, so it isn't in the main bundle:
// https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting
const SystemsPage = lazyRouteComponent(() => import('@/studio/app/pages/systems/SystemsPage'));
const systemsTitle = (...parts: (string | undefined)[]) =>
  [...parts.filter(Boolean).map((p) => itemLabel(p!)), 'Systems', APP_NAME].join(' — ');

function SystemsPlaces({ go }: PaletteContext) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const on = (system: string) => pathname === `/systems/${system}` || pathname.startsWith(`/systems/${system}/`);
  return (
    <>
      <CommandItem value="product system components" disabled={on('product')} onSelect={() => go({ to: '/systems/product' } as never)}>Product system</CommandItem>
      <CommandItem value="studio system components" disabled={on('studio')} onSelect={() => go({ to: '/systems/studio' } as never)}>Studio system</CommandItem>
    </>
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
  places: SystemsPlaces,
} satisfies ModuleApp;
