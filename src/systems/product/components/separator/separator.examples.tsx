import { Separator } from '@/systems/product/components/separator';

export const Horizontal = () => (
  <div className="w-64">
    <p className="text-sm font-medium">Account</p>
    <Separator className="my-3" />
    <p className="text-sm text-muted-foreground">Manage your profile.</p>
  </div>
);

export const Vertical = () => (
  <div className="flex h-5 items-center gap-3 text-sm">
    <span>Docs</span>
    <Separator orientation="vertical" />
    <span>Source</span>
    <Separator orientation="vertical" />
    <span>Support</span>
  </div>
);
