import { useState, type ReactNode } from 'react';
import { Mail } from 'lucide-react';
// Product system: what prototypes build with. Demos render inside .product-theme.
// Kept short on purpose: it shows how the product look differs from the app UI.
import { PortalContext } from '@/product/components/portal';
import { Button } from '@/product/components/button';
import { Input } from '@/product/components/input';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/product/components/dialog';
import { Code, CodeBlock, Prose } from './foundations';
import type { DesignSystem } from '../types';

// Same wrapper and portal container as the viewer, so pop-ups stay inside .product-theme.
export function ProductFrame({ children }: { children: ReactNode }) {
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  return (
    <div className="product-theme text-foreground">
      <PortalContext.Provider value={portal}>{children}</PortalContext.Provider>
      <div ref={setPortal} />
    </div>
  );
}

export const product: DesignSystem = {
  label: 'Product',
  scopeClass: 'product-theme',
  Frame: ProductFrame,
  intro: (
    <div className="rounded-xl border-2 border-dashed border-foreground/25 bg-muted/40 p-6">
      <p className="mb-2 text-base font-semibold text-foreground">Replace this with your product's design system.</p>
      <Prose>
        <p>This is a stand-in so the sandbox works out of the box. Swap in the components and theme your production app uses, so prototypes look like what ships.</p>
        <p>Whatever you bring in, keep these four things true:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>It lives in <Code>src/product/</Code>.</li>
          <li>Prototypes import from <Code>@/product/...</Code>.</li>
          <li>Its styles are scoped under <Code>.product-theme</Code>, with a <Code>.dark .product-theme</Code> block if your product has dark mode.</li>
          <li>Pop-ups render into the portal container from <Code>portal.tsx</Code>, so they keep the product look.</li>
        </ol>
      </Prose>
    </div>
  ),
  theme: (
    <Prose>
      <p>The placeholder is a few shadcn/ui components (button, input, dialog) on shadcn/ui's indigo preset, in <Code>src/product/styles/theme.css</Code>. Indigo is there only so you can see it's a separate system from the app UI.</p>
      <CodeBlock>{`npx shadcn apply a2r6bw --only theme`}</CodeBlock>
      <p>Prototypes use <Code>lucide-react</Code> for icons until your system brings its own.</p>
    </Prose>
  ),
  categories: [
    { name: 'Components', components: [
      { name: 'Button', file: 'button.tsx', demo: () => (
        <>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button><Mail data-icon="inline-start" />With icon</Button>
        </>
      ) },
      { name: 'Input', file: 'input.tsx', demo: () => (
        <>
          <Input placeholder="Type something" className="w-56" />
          <Input placeholder="Disabled" disabled className="w-56" />
        </>
      ) },
      { name: 'Dialog', file: 'dialog.tsx', demo: () => (
        <Dialog>
          <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Product dialog</DialogTitle>
              <DialogDescription>Rendered in the portal container, so it keeps the product look.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) },
    ] },
  ],
};
