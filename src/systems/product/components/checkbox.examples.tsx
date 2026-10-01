import { Checkbox } from '@/systems/product/components/checkbox';
import { Label } from '@/systems/product/components/label';

export const WithLabel = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="checkbox-terms" />
    <Label htmlFor="checkbox-terms">Accept terms</Label>
  </div>
);

export const Checked = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="checkbox-checked" defaultChecked />
    <Label htmlFor="checkbox-checked">Email me updates</Label>
  </div>
);

export const Disabled = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="checkbox-disabled" disabled />
    <Label htmlFor="checkbox-disabled">Unavailable</Label>
  </div>
);
