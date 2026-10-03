// The layout of a prototype, or of the Handbook: its navigation (which hides with the rail's toggle,
// or ⌘;) beside the open item. The route (router.tsx) passes in the prototype it loaded.
import { Outlet, useParams } from '@tanstack/react-router';
import { findArtifact, firstArtifact } from '@/platform/app/data/manifest';
import type { Prototype } from '@/platform/app/data/types';
import PrototypeNav from '@/platform/modules/prototypes/viewer/PrototypeNav';
import { isStandalone } from '@/platform/app/data/modules';

export default function PrototypeLayout({ proto }: { proto: Prototype }) {
  const params = useParams({ strict: false });
  // With no path in the URL, the start item (or the first) is open.
  const current = params._splat ? findArtifact(proto, params._splat) : firstArtifact(proto);
  // A standalone section item on the deployed site is just the open item, filling the window (App.tsx hides the rail too).
  if (!import.meta.env.DEV && isStandalone(proto.contributorKey)) return <div className="flex min-h-0 flex-1"><Outlet /></div>;
  return (
    <div className="flex min-h-0 flex-1">
      <PrototypeNav proto={proto} current={current} />
      <Outlet />
    </div>
  );
}
