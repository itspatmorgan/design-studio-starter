import { Input } from '@/systems/product/components/input';
import { Label } from '@/systems/product/components/label';

export const WithInput = () => (
  <div className="grid w-64 gap-2">
    <Label htmlFor="label-email">Email</Label>
    <Input id="label-email" type="email" placeholder="name@example.com" />
  </div>
);
