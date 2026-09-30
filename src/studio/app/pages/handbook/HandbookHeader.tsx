// The top of the Handbook's navigation: the sections as tabs, and a button that switches between
// the pages and the map (HandbookMap.tsx). (A prototype's header, with its menus for editing, is
// PrototypeHeader.tsx.) Making things, and the other file actions, are on the tree below
// (FileTree.tsx), so they're scoped to the open section.
import { useEffect } from 'react';
import { Link, getRouteApi, useRouterState } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { WorkflowSquare01Icon } from '@hugeicons/core-free-icons';
import type { Prototype } from '@/studio/app/data/types';
import { prototypeLink } from '@/studio/app/data/manifest';
import { NavHeader, NavTabs, NavTitle, navTabClass } from '@/studio/app/shell/nav';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { cn } from '@/lib/utils';

const rootApi = getRouteApi('__root__');

const MAP_PATH = '/handbook/map';

// The page you were on before opening the map, so the button can take you back to it.
let lastPage = '/handbook';

const iconLink = 'inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground';

// `proto` is the open section, or none on the map, where no tab is raised.
export default function HandbookHeader({ proto }: { proto?: Prototype }) {
  const { handbook } = rootApi.useLoaderData();
  const location = useRouterState({ select: (s) => s.location });
  const onMap = !proto;
  // While the route changes, this header can still be showing when the address is already the map's,
  // so the map itself is never the page to go back to.
  useEffect(() => {
    if (!onMap && location.pathname !== MAP_PATH) lastPage = location.pathname + (location.searchStr ?? '');
  }, [onMap, location.pathname, location.searchStr]);
  return (
    <NavHeader>
      <NavTitle
        actions={(
          <Tooltip>
            <TooltipTrigger
              render={(
                <Link
                  to={(onMap ? lastPage : MAP_PATH) as never}
                  aria-label={onMap ? 'Show pages' : 'Show map'}
                  aria-pressed={onMap}
                  className={cn(iconLink, onMap ? 'bg-sidebar-foreground/10 text-sidebar-accent-foreground' : 'text-sidebar-foreground/70')}
                />
              )}
            >
              <HugeiconsIcon icon={WorkflowSquare01Icon} size={14} />
            </TooltipTrigger>
            <TooltipContent side="bottom">{onMap ? 'Show pages' : 'Show map: how your agent reads the Handbook'}</TooltipContent>
          </Tooltip>
        )}
      >
        Handbook
      </NavTitle>
      <NavTabs label="Handbook sections">
        {handbook.map((section) => (
          <Link
            key={section.id}
            {...prototypeLink(section)}
            aria-current={section.id === proto?.id ? 'page' : undefined}
            className={navTabClass(section.id === proto?.id)}
          >
            {section.title}
          </Link>
        ))}
      </NavTabs>
    </NavHeader>
  );
}
