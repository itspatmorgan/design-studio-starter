// The layout of a prototype, or of the Handbook: its navigation (toggled from the rail or with ⌘;)
// beside the open item. The route (router.tsx) passes in the prototype it loaded.
import { Outlet, useParams } from '@tanstack/react-router';
import { findItem, firstItem } from '@/studio/app/data/manifest';
import type { Prototype } from '@/studio/app/data/types';
import { useSectionNavOpen } from '@/studio/app/shell/appPrefs';
import PrototypeNav from '@/studio/app/pages/prototype/PrototypeNav';

export default function PrototypeLayout({ proto }: { proto: Prototype }) {
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
