import { useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Home01Icon } from '@hugeicons/core-free-icons';
import { CommandItem } from '@/systems/studio/components/command';
import { APP_NAME, type ModuleApp, type PaletteContext } from '@/platform/core/api';
import Welcome from './Welcome';
import { isComplete, progressKey } from './progress';

function FirstVisit() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isComplete(progressKey(import.meta.env.BASE_URL))) {
      void navigate({ to: '/onboarding' as never, replace: true });
    }
  }, [navigate]);
  return null;
}

function Places({ go }: PaletteContext) {
  return <CommandItem value="welcome onboarding getting started first prototype" onSelect={() => go({ to: '/onboarding' } as never)}>Welcome</CommandItem>;
}

export default {
  icon: Home01Icon,
  rail: 'bottom',
  order: 10,
  localOnly: true,
  homeOrder: { local: 0 },
  overview: FirstVisit,
  places: Places,
  routes: root => [createRoute({
    getParentRoute: () => root,
    path: 'onboarding',
    head: () => ({ meta: [{ title: `Welcome — ${APP_NAME}` }] }),
    component: Welcome,
  })],
} satisfies ModuleApp;
