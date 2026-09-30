// The top of a Handbook section's navigation: the Handbook's sections as tabs. (A prototype's
// header, with its menus for editing, is PrototypeHeader.tsx.) Making things, and the other file
// actions, are on the tree below (FileTree.tsx), so they're scoped to the open section.
import { Link, getRouteApi } from '@tanstack/react-router';
import type { Prototype } from '@/studio/app/data/types';
import { prototypeLink } from '@/studio/app/data/manifest';
import { NavHeader, NavTabs, NavTitle, navTabClass } from '@/studio/app/shell/nav';

const rootApi = getRouteApi('__root__');

export default function HandbookHeader({ proto }: { proto: Prototype }) {
  const { handbook } = rootApi.useLoaderData();
  return (
    <NavHeader>
      <NavTitle>Handbook</NavTitle>
      <NavTabs label="Handbook sections">
        {handbook.map((section) => (
          <Link
            key={section.id}
            {...prototypeLink(section)}
            aria-current={section.id === proto.id ? 'page' : undefined}
            className={navTabClass(section.id === proto.id)}
          >
            {section.title}
          </Link>
        ))}
      </NavTabs>
    </NavHeader>
  );
}
