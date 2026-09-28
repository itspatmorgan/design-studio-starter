import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
// Studio system: the app UI's own components.
import { Button as StudioButton } from '@/studio/components/button';
import { Badge } from '@/studio/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/studio/components/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { Tooltip as StudioTooltip, TooltipContent as StudioTooltipContent, TooltipTrigger as StudioTooltipTrigger } from '@/studio/components/tooltip';
import { ContributorAvatar } from '@/studio/components/avatar';
// Product system: what prototypes build with. Shown here inside .product-theme.
import { Switch } from '@/product/components/switch';
import { Checkbox } from '@/product/components/checkbox';
import { Label } from '@/product/components/label';
import { Card as ProductCard, CardContent as ProductCardContent, CardDescription as ProductCardDescription, CardHeader as ProductCardHeader, CardTitle as ProductCardTitle } from '@/product/components/card';
import { PortalContext } from '@/product/components/portal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/product/components/tooltip';
import { Button } from '@/product/components/button';
import { Input } from '@/product/components/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/product/components/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/product/components/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/product/components/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/product/components/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/product/components/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/product/components/sheet';

// Each system: a title, a short intro, and one live demo per component.
const SYSTEMS = {
  product: {
    label: 'Product',
    intro: 'The components prototypes build with, from src/product/components. They take the product look from theme.css, inside the .product-theme wrapper.',
    components: [
      { name: 'Button', demo: () => (
        <>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </>
      ) },
      { name: 'Input', demo: () => <Input placeholder="Type something" className="w-64" /> },
      { name: 'Label', demo: () => <Label htmlFor="demo-label">Email</Label> },
      { name: 'Checkbox', demo: () => (
        <div className="flex items-center gap-2"><Checkbox id="demo-checkbox" /><Label htmlFor="demo-checkbox">Remember me</Label></div>
      ) },
      { name: 'Switch', demo: () => (
        <div className="flex items-center gap-2"><Switch id="demo-switch" /><Label htmlFor="demo-switch">Notifications</Label></div>
      ) },
      { name: 'Card', demo: () => (
        <ProductCard className="w-72">
          <ProductCardHeader><ProductCardTitle>Card title</ProductCardTitle><ProductCardDescription>A short description.</ProductCardDescription></ProductCardHeader>
          <ProductCardContent className="text-sm">Card content.</ProductCardContent>
        </ProductCard>
      ) },
      { name: 'Select', demo: () => (
        <Select>
          <SelectTrigger className="w-48"><SelectValue placeholder="Pick one" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="one">One</SelectItem>
            <SelectItem value="two">Two</SelectItem>
          </SelectContent>
        </Select>
      ) },
      { name: 'Dialog', demo: () => (
        <Dialog>
          <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Product dialog</DialogTitle>
              <DialogDescription>Rendered in the portal container, so it keeps the product look.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ) },
      { name: 'Alert dialog', demo: () => (
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="outline">Delete item</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this item?</AlertDialogTitle>
              <AlertDialogDescription>This is only a demo.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) },
      { name: 'Dropdown menu', demo: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline">Open menu</Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) },
      { name: 'Popover', demo: () => (
        <Popover>
          <PopoverTrigger asChild><Button variant="outline">Open popover</Button></PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      ) },
      { name: 'Sheet', demo: () => (
        <Sheet>
          <SheetTrigger asChild><Button variant="outline">Open sheet</Button></SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Product sheet</SheetTitle>
              <SheetDescription>A panel that slides in from the side.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ) },
      { name: 'Tooltip', demo: () => (
        <Tooltip>
          <TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger>
          <TooltipContent>Product tooltip</TooltipContent>
        </Tooltip>
      ) },
    ],
  },
  studio: {
    label: 'Studio',
    intro: 'The components for the app UI, from src/studio/components: navigation, the index, and this page. Prototypes never import them.',
    components: [
      { name: 'Button', demo: () => (
        <>
          <StudioButton>Primary</StudioButton>
          <StudioButton variant="secondary">Secondary</StudioButton>
          <StudioButton variant="outline">Outline</StudioButton>
          <StudioButton variant="ghost">Ghost</StudioButton>
        </>
      ) },
      { name: 'Badge', demo: () => (
        <>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </>
      ) },
      { name: 'Card', demo: () => (
        <Card className="w-72">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>A short description.</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground">Card content</CardContent>
        </Card>
      ) },
      { name: 'Collapsible', demo: () => (
        <Collapsible className="w-64 text-sm">
          <CollapsibleTrigger className="group flex items-center gap-1.5 font-medium">
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
            Toggle details
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pl-5 text-muted-foreground">Hidden until opened.</CollapsibleContent>
        </Collapsible>
      ) },
      { name: 'Tooltip', demo: () => (
        <StudioTooltip>
          <StudioTooltipTrigger asChild><StudioButton variant="outline">Hover me</StudioButton></StudioTooltipTrigger>
          <StudioTooltipContent>Studio tooltip</StudioTooltipContent>
        </StudioTooltip>
      ) },
      { name: 'Avatar', demo: () => (
        <>
          <ContributorAvatar name="Example Contributor" size={20} />
          <ContributorAvatar name="Example Contributor" size={32} />
        </>
      ) },
    ],
  },
};

const slug = (name) => name.toLowerCase().replace(/\s+/g, '-');

function SystemNav({ system, setSystem, active, onPick }) {
  return (
    <nav aria-label="Systems" className="flex min-h-0 w-52 shrink-0 flex-col border-r border-border bg-muted/40">
      <div className="flex gap-1 border-b border-border p-3">
        {Object.entries(SYSTEMS).map(([id, s]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSystem(id)}
            aria-pressed={system === id}
            className={cn(
              'flex-1 rounded-md py-1.5 text-[12px] font-medium transition-colors',
              system === id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        <NavItem label="Introduction" active={active === 'intro'} onClick={() => onPick('intro')} />
        <p className="mt-5 mb-2 px-2.5 text-sm font-semibold text-foreground">Components</p>
        {SYSTEMS[system].components.map((c) => (
          <NavItem key={c.name} label={c.name} active={active === slug(c.name)} onClick={() => onPick(slug(c.name))} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors',
        active
          ? 'bg-sidebar-accent-active font-semibold text-sidebar-accent-foreground'
          : 'text-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      {label}
    </button>
  );
}

// Frame wraps each demo box: plain for studio, ProductFrame for product.
function ComponentList({ components, Frame = 'div' }) {
  return components.map((c) => (
    <section key={c.name} id={slug(c.name)} className="mb-12 scroll-mt-8">
      <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground">{c.name}</h2>
      <Frame>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-6">
          <c.demo />
        </div>
      </Frame>
    </section>
  ));
}

// Each product demo gets the same wrapper, portal container, and TooltipProvider as the viewer.
// Headings stay outside it, in the app UI look (so they follow dark mode).
function ProductFrame({ children }) {
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

export default function SystemsPage() {
  const [system, setSystem] = useState('product');
  const [active, setActive] = useState('intro');
  const { label, intro, components } = SYSTEMS[system];

  const pick = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const switchSystem = (id) => {
    setSystem(id);
    setActive('intro');
  };

  return (
    <div className="flex min-h-0 flex-1">
      <SystemNav system={system} setSystem={switchSystem} active={active} onPick={pick} />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="max-w-5xl px-8 py-8">
          <header id="intro" className="mb-12">
            <h1 className="mb-2 text-[26px] font-semibold leading-9 tracking-[-0.01em] text-foreground">{label}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">{intro}</p>
          </header>
          {system === 'product'
            ? <div data-testid="product-set"><ComponentList components={components} Frame={ProductFrame} /></div>
            : <div data-testid="studio-set"><ComponentList components={components} /></div>}
        </div>
      </main>
    </div>
  );
}
