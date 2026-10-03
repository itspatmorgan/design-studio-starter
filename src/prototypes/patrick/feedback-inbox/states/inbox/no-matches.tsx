// State: a search that finds nothing.
import { FeedbackInboxScreen } from '../../app/feedback-inbox';

export default function FeedbackNoMatches() {
  return <FeedbackInboxScreen query="invoices" />;
}
