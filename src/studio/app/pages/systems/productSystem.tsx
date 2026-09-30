// Product system: the placeholder prototype system (see src/systems/index.ts). Demos render inside .product-theme.
// Its introduction is all a spec holds for a system (with icons, if it has them). Kept short on purpose:
// it shows how the product look differs from the app UI. Its component pages come from the files in
// src/systems/product/components/ (button.tsx, button.examples.tsx, button.md).
import { PROTOTYPE_SYSTEMS } from '@/systems';
import { Code, CodeBlock, Prose } from '@/studio/app/pages/systems/foundations';
import type { DesignSystem } from '@/studio/app/data/types';

export const product: DesignSystem = {
  label: PROTOTYPE_SYSTEMS.product.label,
  dir: `${PROTOTYPE_SYSTEMS.product.dir}components/`,
  scopeClass: PROTOTYPE_SYSTEMS.product.themeClass,
  intro: (
    <>
      <div className="rounded-xl border-2 border-dashed border-foreground/25 bg-muted/40 p-6">
        <p className="mb-2 text-base font-semibold text-foreground">Replace this with your product's design system.</p>
        <Prose>
          <p>This is a stand-in so the sandbox works out of the box. Swap in the components and theme your production app uses, so prototypes look like what ships.</p>
          <p>Whatever you bring in, keep these four things true:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>It lives in <Code>src/systems/product/</Code>.</li>
            <li>Prototypes import from <Code>@/systems/product/...</Code>.</li>
            <li>Its styles are scoped under <Code>.product-theme</Code>, with a <Code>.dark .product-theme</Code> block if your product has dark mode.</li>
            <li>Pop-ups render into the portal container from <Code>portal.tsx</Code>, so they keep the product look.</li>
          </ol>
          <p>The component pages link to shadcn/ui's docs, because these components come from it. If yours don't, remove <Code>origin</Code> from this system's entry in <Code>src/systems/index.ts</Code>.</p>
        </Prose>
      </div>
      <h2 className="mt-10 mb-3 text-lg font-semibold tracking-tight text-foreground">Theme</h2>
      <Prose>
        <p>The placeholder is a few shadcn/ui components (button, input, dialog) on shadcn/ui's indigo preset, in <Code>src/systems/product/styles/theme.css</Code>. Indigo is there only so you can see it's a separate system from the app UI.</p>
        <CodeBlock>{`npx shadcn apply a2r6bw --only theme`}</CodeBlock>
        <p>Prototypes use <Code>lucide-react</Code> for icons until your system brings its own.</p>
      </Prose>
    </>
  ),
};
