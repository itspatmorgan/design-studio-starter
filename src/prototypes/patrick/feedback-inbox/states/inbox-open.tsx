// State: the inbox after clicking the Open issues card. Everything not resolved, and a bar saying so.
import { InboxScreen } from '../app/inbox';

export default function InboxOpen() {
  return <InboxScreen filter={{ status: 'open', priority: null }} />;
}
