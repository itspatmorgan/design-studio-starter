import { Label } from '@/systems/product/components/label';
import { Textarea } from '@/systems/product/components/textarea';

export const WithLabel = () => (
  <div className="grid w-xs gap-2">
    <Label htmlFor="textarea-notes">Notes</Label>
    <Textarea id="textarea-notes" placeholder="Add a note..." />
  </div>
);

export const Disabled = () => <Textarea className="w-xs" placeholder="Disabled" disabled />;
