// The top of a Handbook section's navigation: which section you're in, and links to the others.
// (A prototype's header, with its menus for editing, is PrototypeHeader.tsx; nothing here can be edited.)
import { Link, getRouteApi } from '@tanstack/react-router';
import type { Prototype } from '@/studio/app/data/types';
import { prototypeLink } from '@/studio/app/data/manifest';
import { cn } from '@/lib/utils';

const rootApi = getRouteApi('__root__');

export default function HandbookHeader({ proto }: { proto: Prototype }) {
  const { handbook } = rootApi.useLoaderData();
  return (
    <div className="shrink-0 px-2 pt-3 pb-2">
      <div className="flex min-h-8 items-center px-2.5">
        <Link to="/handbook" className="truncate text-sm font-semibold leading-tight hover:underline">Handbook</Link>
      </div>
      <nav aria-label="Handbook sections" className="mt-1 flex gap-1 px-1">
        {handbook.map((section) => (
          <Link
            key={section.id}
            {...prototypeLink(section)}
            aria-current={section.id === proto.id ? 'page' : undefined}
            className={cn(
              'rounded-md px-2 py-1 text-xs text-sidebar-foreground/80 transition-colors',
              'hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground',
              section.id === proto.id && 'bg-sidebar-foreground/10 font-medium text-sidebar-accent-foreground',
            )}
          >
            {section.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
