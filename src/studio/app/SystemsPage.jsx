import { useState } from 'react';
import { Button as StudioButton } from '@/studio/components/button';
import { Badge } from '@/studio/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/studio/components/card';
import { PortalContext } from '@/product/components/portal';
import { TooltipProvider } from '@/product/components/tooltip';
import { Button } from '@/product/components/button';
import { Input } from '@/product/components/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/product/components/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/product/components/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/product/components/popover';

export default function SystemsPage() {
  const [portal, setPortal] = useState(null);
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-10 md:grid-cols-2">
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Studio system</h2>
          <p className="text-sm text-muted-foreground">src/studio/components, for the app UI only.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Components</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <StudioButton>Button</StudioButton>
            <StudioButton variant="outline">Outline</StudioButton>
            <Badge>Badge</Badge>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Product system</h2>
          <p className="text-sm text-muted-foreground">src/product/components, what prototypes build with.</p>
        </div>
        <div className="product-theme bg-background text-foreground rounded-md border p-6">
          <PortalContext.Provider value={portal}>
            <TooltipProvider>
              <div className="flex flex-wrap items-center gap-2">
                <Button>Button</Button>
                <Button variant="outline">Outline</Button>
                <Input placeholder="Input" className="w-40" />
                <Dialog>
                  <DialogTrigger asChild><Button variant="secondary">Dialog</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Product dialog</DialogTitle>
                      <DialogDescription>Rendered inside .product-theme.</DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline">Menu</Button></DropdownMenuTrigger>
                  <DropdownMenuContent><DropdownMenuItem>Item</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
                <Popover>
                  <PopoverTrigger asChild><Button variant="ghost">Popover</Button></PopoverTrigger>
                  <PopoverContent>Popover content</PopoverContent>
                </Popover>
              </div>
            </TooltipProvider>
          </PortalContext.Provider>
          <div ref={setPortal} />
        </div>
      </section>
    </main>
  );
}
