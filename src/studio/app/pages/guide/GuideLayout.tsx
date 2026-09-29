import { Link, Outlet, getRouteApi } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import type { GuidePage } from '@/studio/app/data/types';

const rootApi = getRouteApi('__root__');

// Pages in order, grouped under their `section` headings.
function groupBySection(pages: GuidePage[]) {
  const groups: { section: string | null; pages: GuidePage[] }[] = [];
  for (const page of pages) {
    const last = groups.at(-1);
    if (last && last.section === page.section) last.pages.push(page);
    else groups.push({ section: page.section, pages: [page] });
  }
  return groups;
}

// The Guide: a sidebar of pages (from src/studio/guide/, via the manifest) and the open page.
export default function GuideLayout() {
  const { guide } = rootApi.useLoaderData();
  return (
    <div className="flex h-full min-h-0">
      <nav aria-label="Guide" className="flex w-52 shrink-0 flex-col overflow-y-auto border-r border-border bg-muted/40 px-2.5 py-4">
        <p className="mb-2 px-2.5 text-sm font-semibold text-foreground">Guide</p>
        {groupBySection(guide).map((g, i) => (
          <div key={g.section ?? i}>
            {g.section && <p className="mt-5 mb-2 px-2.5 text-sm font-semibold text-foreground">{g.section}</p>}
            {g.pages.map((page) => (
              <Link
                key={page.slug}
                to={page.slug === 'index' ? '/guide' : '/guide/$page'}
                params={{ page: page.slug }}
                activeOptions={{ exact: true }}
                className={cn(
                  'block rounded-md px-2.5 py-1.5 text-sm text-foreground/80 transition-colors',
                  'hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground',
                  'data-[status=active]:bg-sidebar-foreground/10 data-[status=active]:font-medium data-[status=active]:text-sidebar-accent-foreground',
                )}
              >
                {page.title}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <main data-doc-scroll className="relative min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
