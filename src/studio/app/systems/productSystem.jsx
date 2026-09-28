import { useState } from 'react';
import {
  Bell, Calendar, Check, ChevronDown, ChevronRight, Copy, Download, ExternalLink, Filter, Heart, House,
  Info, Mail, Menu, Pencil, Plus, Search, Settings, Star, Trash2, TriangleAlert, Upload, User, X,
} from 'lucide-react';
// Product system: what prototypes build with. Demos render inside .product-theme.
import { PortalContext } from '@/product/components/portal';
import { Button } from '@/product/components/button';
import { Input } from '@/product/components/input';
import { Label } from '@/product/components/label';
import { Checkbox } from '@/product/components/checkbox';
import { Switch } from '@/product/components/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/product/components/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/product/components/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/product/components/tooltip';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/product/components/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/product/components/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/product/components/dropdown-menu';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/product/components/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/product/components/sheet';
import { Code, CodeBlock, IconGrid, Prose } from './foundations';

// Each product demo gets the same wrapper, portal container, and TooltipProvider as the viewer,
// so pop-ups render inside .product-theme and keep the product look.
export function ProductFrame({ children }) {
  const [portal, setPortal] = useState(null);
  return (
    <div className="product-theme text-foreground">
      <PortalContext.Provider value={portal}>
        <TooltipProvider>{children}</TooltipProvider>
      </PortalContext.Provider>
      <div ref={setPortal} />
    </div>
  );
}

const ICONS = { Search, Plus, Settings, User, Bell, Trash2, Pencil, Check, X, ChevronDown, ChevronRight, Mail, Calendar, House, Filter, Download, Upload, Copy, ExternalLink, Info, TriangleAlert, Star, Heart, Menu };

export const product = {
  label: 'Product',
  scopeClass: 'product-theme',
  Frame: ProductFrame,
  intro: (
    <Prose>
      <p>The components prototypes build with. Use them for anything that should look like your product.</p>
      <p>They live in <Code>src/product/components</Code>, one file per component, with the theme in <Code>src/product/styles/theme.css</Code>.</p>
      <CodeBlock>{`import { Button } from '@/product/components/button';`}</CodeBlock>
      <p>Only prototypes use this system. The app UI around them uses Studio.</p>
    </Prose>
  ),
  theme: (
    <Prose>
      <p>Defined in <Code>src/product/styles/theme.css</Code>, scoped to the <Code>.product-theme</Code> class. Prototypes render inside that wrapper, so the product look never leaks into the app UI.</p>
      <p>It is shadcn/ui's indigo theme, from preset <Code>a2r6bw</Code>:</p>
      <CodeBlock>{`npx shadcn apply a2r6bw --only theme`}</CodeBlock>
      <p>To use your own colors, edit the values in theme.css, or paste a theme from the shadcn/ui theme builder. Keep the variable names the same and every component picks them up.</p>
      <p>The <Code>.dark .product-theme</Code> block follows the app's light and dark mode.</p>
      <p>Pop-ups (dialogs, menus, tooltips) render into a container inside the wrapper. <Code>portal.jsx</Code> provides it, which is what keeps them themed.</p>
    </Prose>
  ),
  typeSamples: [
    { label: 'text-base font-medium', className: 'text-base font-medium' },
    { label: 'text-base', className: 'text-base' },
    { label: 'text-sm font-medium', className: 'text-sm font-medium' },
    { label: 'text-sm', className: 'text-sm' },
    { label: 'text-xs', className: 'text-xs' },
  ],
  icons: {
    library: 'lucide-react',
    href: 'https://lucide.dev/icons',
    snippet: `import { Search } from 'lucide-react';\n\n<Search className="size-4" />`,
    grid: <IconGrid icons={Object.entries(ICONS).map(([name, I]) => ({ name, node: <I className="size-5" /> }))} />,
  },
  categories: [
    { name: 'Actions', components: [
      { name: 'Button', file: 'button.jsx', demo: () => (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add"><Plus /></Button>
            <Button><Mail data-icon="inline-start" />With icon</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      ) },
    ] },
    { name: 'Form controls', components: [
      { name: 'Input', file: 'input.jsx', demo: () => (
        <>
          <Input placeholder="Type something" className="w-56" />
          <Input placeholder="Disabled" disabled className="w-56" />
          <Input placeholder="Invalid" aria-invalid className="w-56" />
        </>
      ) },
      { name: 'Label', file: 'label.jsx', demo: () => (
        <div className="grid w-64 gap-2"><Label htmlFor="p-email">Email</Label><Input id="p-email" placeholder="name@example.com" /></div>
      ) },
      { name: 'Checkbox', file: 'checkbox.jsx', demo: () => (
        <>
          <div className="flex items-center gap-2"><Checkbox id="p-cb1" /><Label htmlFor="p-cb1">Unchecked</Label></div>
          <div className="flex items-center gap-2"><Checkbox id="p-cb2" defaultChecked /><Label htmlFor="p-cb2">Checked</Label></div>
          <div className="flex items-center gap-2"><Checkbox id="p-cb3" disabled /><Label htmlFor="p-cb3">Disabled</Label></div>
        </>
      ) },
      { name: 'Switch', file: 'switch.jsx', demo: () => (
        <>
          <div className="flex items-center gap-2"><Switch id="p-sw1" /><Label htmlFor="p-sw1">Off</Label></div>
          <div className="flex items-center gap-2"><Switch id="p-sw2" defaultChecked /><Label htmlFor="p-sw2">On</Label></div>
          <div className="flex items-center gap-2"><Switch id="p-sw3" disabled /><Label htmlFor="p-sw3">Disabled</Label></div>
        </>
      ) },
      { name: 'Select', file: 'select.jsx', demo: () => (
        <>
          <Select>
            <SelectTrigger className="w-48"><SelectValue placeholder="Pick a fruit" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruit</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="cherry">Cherry</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select disabled>
            <SelectTrigger className="w-48"><SelectValue placeholder="Disabled" /></SelectTrigger>
            <SelectContent><SelectItem value="x">X</SelectItem></SelectContent>
          </Select>
        </>
      ) },
    ] },
    { name: 'Overlays', components: [
      { name: 'Dialog', file: 'dialog.jsx', demo: () => (
        <Dialog>
          <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Make changes and save when you are done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2"><Label htmlFor="p-name">Name</Label><Input id="p-name" defaultValue="Alex Kim" /></div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) },
      { name: 'Alert dialog', file: 'alert-dialog.jsx', demo: () => (
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="destructive">Delete item</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this item?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) },
      { name: 'Dropdown menu', file: 'dropdown-menu.jsx', demo: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline">Open menu <ChevronDown data-icon="inline-end" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem><Pencil />Edit</DropdownMenuItem>
            <DropdownMenuItem><Copy />Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive"><Trash2 />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) },
      { name: 'Popover', file: 'popover.jsx', demo: () => (
        <Popover>
          <PopoverTrigger asChild><Button variant="outline">Open popover</Button></PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Popover</PopoverTitle>
              <PopoverDescription>Short content next to a trigger.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      ) },
      { name: 'Sheet', file: 'sheet.jsx', demo: () => (
        <>
          {['right', 'left', 'bottom'].map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild><Button variant="outline">Open {side}</Button></SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Sheet</SheetTitle>
                  <SheetDescription>A panel that slides in from the {side}.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          ))}
        </>
      ) },
      { name: 'Tooltip', file: 'tooltip.jsx', demo: () => (
        <>
          {['top', 'right', 'bottom', 'left'].map((side) => (
            <Tooltip key={side}>
              <TooltipTrigger asChild><Button variant="outline">{side}</Button></TooltipTrigger>
              <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
            </Tooltip>
          ))}
        </>
      ) },
    ] },
    { name: 'Display', components: [
      { name: 'Card', file: 'card.jsx', demo: () => (
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>A short description.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">Card content goes here.</CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save</Button>
          </CardFooter>
        </Card>
      ) },
    ] },
  ],
};
