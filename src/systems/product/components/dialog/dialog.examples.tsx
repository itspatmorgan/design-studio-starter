import { Button } from '@/systems/product/components/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/systems/product/components/dialog';

export const Basic = () => (
  <Dialog>
    <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Product dialog</DialogTitle>
        <DialogDescription>Rendered in the portal container, so it keeps the product look.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
