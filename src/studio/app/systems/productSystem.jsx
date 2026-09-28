import { useState } from 'react';
import { Mail } from 'lucide-react';
// Product system: what prototypes build with. Demos render inside .product-theme.
// Kept short on purpose: it shows how the product look differs from the app UI.
import { PortalContext } from '@/product/components/portal';
import { Button } from '@/product/components/button';
import { Input } from '@/product/components/input';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/product/components/dialog';
import { Code, CodeBlock, Prose } from './foundations';

// Same wrapper and portal container as the viewer, so pop-ups stay inside .product-theme.
export function ProductFrame({ children }) {
  const [portal, setPortal] = useState(null);
  return (
    <div className="product-theme text-foreground">
      <PortalContext.Provider value={portal}>{children}</PortalContext.Provider>
      <div ref={setPortal} />
    </div>
  );
}

export const product = {
  label: 'Product',
  scopeClass: 'product-theme',
  Frame: ProductFrame,
  intro: (
    <Prose>
      <p>A placeholder for your real product design system. Prototypes build with it so they look like your product, not like this app.</p>
      <p>Expect to replace all of it, components and theme, with your own. Ideally that is the same components and tokens your production app uses, so prototypes match what ships.</p>
      <p>Until then it is a few shadcn/ui components (button, dialog, input) on the indigo preset, so you can see the two systems are separate. Prototypes use <Code>lucide-react</Code> for icons.</p>
      <CodeBlock>{`import { Button } from '@/product/components/button';`}</CodeBlock>
    </Prose>
  ),
  theme: (
    <Prose>
      <p>The placeholder theme is in <Code>src/product/styles/theme.css</Code>. It is shadcn/ui's indigo preset:</p>
      <CodeBlock>{`npx shadcn apply a2r6bw --only theme`}</CodeBlock>
      <p>When you replace the system, keep these true:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>It lives in <Code>src/product/</Code>.</li>
        <li>Prototypes import from <Code>@/product/...</Code>.</li>
        <li>Styles stay scoped under <Code>.product-theme</Code>, with a <Code>.dark .product-theme</Code> block if your product has dark mode.</li>
        <li>Pop-ups render into the portal container from <Code>portal.jsx</Code>, so they stay inside <Code>.product-theme</Code>.</li>
      </ul>
    </Prose>
  ),
  categories: [
    { name: 'Components', components: [
      { name: 'Button', file: 'button.jsx', demo: () => (
        <>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button><Mail data-icon="inline-start" />With icon</Button>
        </>
      ) },
      { name: 'Input', file: 'input.jsx', demo: () => (
        <>
          <Input placeholder="Type something" className="w-56" />
          <Input placeholder="Disabled" disabled className="w-56" />
        </>
      ) },
      { name: 'Dialog', file: 'dialog.jsx', demo: () => (
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
