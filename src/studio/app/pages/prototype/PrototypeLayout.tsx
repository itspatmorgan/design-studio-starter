// The /$contributor/$prototype route: the prototype's navigation (toggled from the
// rail or with ⌘;) beside the open item.
import { getRouteApi, Outlet, useParams } from '@tanstack/react-router';
import { findItem, firstItem } from '@/studio/app/data/manifest';
import { useSectionNavOpen } from '@/studio/app/shell/appPrefs';
import PrototypeNav from '@/studio/app/pages/prototype/PrototypeNav';

const prototypeApi = getRouteApi('/$contributor/$prototype');

export default function PrototypeLayout() {
  const { proto } = prototypeApi.useLoaderData();
  const params = useParams({ strict: false });
  const sectionNavOpen = useSectionNavOpen();
  // With no path in the URL, the start item (or the first) is open.
  const current = params._splat ? findItem(proto, params._splat) : firstItem(proto);
  return (
    <div className="flex min-h-0 flex-1">
      {sectionNavOpen && <PrototypeNav proto={proto} current={current} />}
      <Outlet />
    </div>
  );
}
