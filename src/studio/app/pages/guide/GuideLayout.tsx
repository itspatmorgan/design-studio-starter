import { Link, Outlet, getRouteApi } from '@tanstack/react-router';
import { NavGroup, NavHeader, NavList, NavTitle, SectionNav, navLinkClass, navLinkStyle } from '@/studio/app/shell/nav';
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

// The Guide: a sidebar of pages (from src/studio/guide/, via the manifest) and the open page. The
// sidebar is built from the shared navigation pieces (shell/nav/).
export default function GuideLayout() {
  const { guide } = rootApi.useLoaderData();
  return (
    <div className="flex h-full min-h-0">
      <SectionNav label="Guide">
        <NavHeader>
          <NavTitle>Guide</NavTitle>
        </NavHeader>
        <NavList>
          {groupBySection(guide).map((g, i) => (
            <NavGroup key={g.section ?? i} heading={g.section ?? undefined}>
              {g.pages.map((page) => (
                <Link
                  key={page.slug}
                  to={page.slug === 'index' ? '/guide' : '/guide/$page'}
                  params={{ page: page.slug }}
                  activeOptions={{ exact: true }}
                  style={navLinkStyle}
                  className={navLinkClass}
                >
                  {page.title}
                </Link>
              ))}
            </NavGroup>
          ))}
        </NavList>
      </SectionNav>
      <main data-doc-scroll className="relative min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
