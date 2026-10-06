import { Link, getRouteApi } from '@tanstack/react-router';
import { NavHeader, NavTitle, NavTabs, navTabClass } from '@/platform/app/shell/nav';

const rootApi = getRouteApi('__root__');
export default function DocumentationHeader({ reference = false }: { reference?: boolean }) {
  const { guide } = rootApi.useLoaderData();
  return <NavHeader>
    <NavTitle>Documentation</NavTitle>
    <NavTabs label="Documentation sections" wrap>
      {guide.length > 0 && <Link to={'/documentation/guide' as never} aria-current={!reference ? 'page' : undefined} className={navTabClass(!reference)}>Guide</Link>}
      <Link to={"/documentation/context/platform.core" as never} aria-current={reference ? 'page' : undefined} className={navTabClass(reference)}>Context &amp; Skills</Link>
    </NavTabs>
  </NavHeader>;
}
