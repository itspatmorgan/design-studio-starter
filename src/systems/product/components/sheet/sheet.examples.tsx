import { Button } from '@/systems/product/components/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/systems/product/components/sheet';

export const FromRight = () => (
  <Sheet>
    <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>Edit profile</SheetTitle>
        <SheetDescription>Make changes to your profile here.</SheetDescription>
      </SheetHeader>
      <SheetFooter>
        <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        <Button>Save</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

export const FromBottom = () => (
  <Sheet>
    <SheetTrigger render={<Button variant="outline" />}>Open from bottom</SheetTrigger>
    <SheetContent side="bottom">
      <SheetHeader>
        <SheetTitle>Details</SheetTitle>
        <SheetDescription>Supporting information for this item.</SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
);
