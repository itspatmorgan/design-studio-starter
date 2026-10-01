// State: no feedback at all. It runs on data of its own, so the real data is untouched.
import { InboxScreen } from '../app/inbox';
import { StaticItems } from '../app/components/store';

export default function InboxEmpty() {
  return <StaticItems value={[]}><InboxScreen /></StaticItems>;
}
