import { Button } from '@/product/components/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/product/components/dialog';

export default function Prototype() {
  return (
    <main className="space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Hello World</h1>
      <p className="text-muted-foreground">Built with the product components, so it picks up the product theme.</p>
      <Dialog>
        <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
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
