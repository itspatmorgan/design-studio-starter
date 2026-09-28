// The /$contributor/$prototype route: the prototype's navigation (toggled from the
// rail or with ⌘;) beside the open view.
import { getRouteApi, Outlet, useParams } from '@tanstack/react-router';
import { firstView, viewSlug } from '@/studio/app/data/manifest';
import { useSectionNavOpen } from '@/studio/app/shell/appPrefs';
import PrototypeNav from '@/studio/app/pages/prototype/PrototypeNav';

const prototypeApi = getRouteApi('/$contributor/$prototype');

export default function PrototypeLayout() {
  const { proto } = prototypeApi.useLoaderData();
  const params = useParams({ strict: false });
  const sectionNavOpen = useSectionNavOpen();
  // With no view in the URL, the default view is open.
  const current = params.view
    ? proto.views.find((v) => viewSlug(v.name) === params.view && (v.group ?? undefined) === params.group)
    : firstView(proto);
  return (
    <div className="flex min-h-0 flex-1">
      {sectionNavOpen && <PrototypeNav proto={proto} current={current} />}
      <Outlet />
    </div>
  );
}
