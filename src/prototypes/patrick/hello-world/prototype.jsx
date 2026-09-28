import { Button } from '@/product/components/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/product/components/dialog';

export default function Prototype() {
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Hello World</h1>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hello from the product system</DialogTitle>
            <DialogDescription>This dialog renders inside the prototype's theme.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}
