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
    <main className="grid gap-6 p-6 md:grid-cols-2">
      <section>
        <h2 className="mb-3 font-semibold">Studio system</h2>
        <Card>
          <CardHeader><CardTitle>App UI components</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <StudioButton>Button</StudioButton>
            <StudioButton variant="outline">Outline</StudioButton>
            <Badge>Badge</Badge>
          </CardContent>
        </Card>
      </section>
      <section>
        <h2 className="mb-3 font-semibold">Product system</h2>
        <div className="product-theme bg-background text-foreground rounded border p-4" data-testid="product-system">
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
