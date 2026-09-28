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
      <p>The components prototypes build with. Use them for anything that should look like your product.</p>
      <p>They live in <Code>src/product/components</Code>: a small starter set of button, card, dialog, and input. Add more with <Code>npx shadcn add</Code>.</p>
      <CodeBlock>{`import { Button } from '@/product/components/button';`}</CodeBlock>
      <p>Only prototypes use this system. The app UI around them uses Studio. Prototypes use <Code>lucide-react</Code> for icons.</p>
    </Prose>
  ),
  theme: (
    <Prose>
      <p>Defined in <Code>src/product/styles/theme.css</Code>, scoped to the <Code>.product-theme</Code> class. Prototypes render inside that wrapper, so the product look never leaks into the app UI.</p>
      <p>It is shadcn/ui's indigo theme, from preset <Code>a2r6bw</Code>:</p>
      <CodeBlock>{`npx shadcn apply a2r6bw --only theme`}</CodeBlock>
      <p>To use your own colors, edit the values in theme.css, or paste a theme from the shadcn/ui theme builder. Keep the variable names the same. The <Code>.dark .product-theme</Code> block follows the app's light and dark mode.</p>
      <p>Pop-ups like dialogs render into a container inside the wrapper. <Code>portal.jsx</Code> provides it, which is what keeps them themed.</p>
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
