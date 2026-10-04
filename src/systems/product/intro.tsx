// The product system's introduction on the Systems page: the placeholder design system (system.ts). Demos render
// inside .product-theme. An intro.tsx is the one thing a system's people write for that page (with icons, if it has
// them); without one the page says so. Kept short on purpose: it shows how the product look differs from the app
// UI. Its component pages come from the files in src/systems/product/components/ (button.tsx, button.examples.tsx,
// button.md), and its foundations pages from styles/theme.css.
import { Code, ColorModeSupport, Prose } from '@/modules/systems/pages/foundations';
import system from './system';
import type { SystemIntro } from '@/platform/app/data/types';

export default {
  intro: (
    <>
      <div className="rounded-xl border-2 border-dashed border-foreground/25 bg-muted/40 p-6">
        <p className="mb-2 text-base font-semibold text-foreground">Replace this with your product's design system.</p>
        <Prose>
          <p>A stand-in so the sandbox works out of the box. Swap in your production app's components and theme, so prototypes look like what ships.</p>
          <p>Whatever you bring in, keep these true:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>It lives in <Code>src/systems/product/</Code>.</li>
            <li>Prototypes import from <Code>@/systems/product/...</Code>.</li>
            <li>Its styles are scoped under <Code>.product-theme</Code>, with a <Code>.product-theme[data-color-mode="dark"]</Code> block if your product has dark mode.</li>
            <li>Pop-ups render into the portal container from <Code>portal.tsx</Code>, so they keep the product look.</li>
          </ol>
          <p>The component pages link to shadcn/ui's docs, because these components come from it. If yours don't, set <Code>origin: null</Code> in <Code>src/systems/product/system.ts</Code>.</p>
        </Prose>
      </div>
      <Prose><p>This system can also hold your product’s context, rules, and skills. Guidance can cover terminology, workflows, accessibility, and business requirements as well as components.</p></Prose>
      <h2 className="mt-10 mb-3 text-lg font-semibold tracking-tight text-foreground">Theme</h2>
      <Prose>
        <ColorModeSupport modes={system.colorModes} />
        <p>The placeholder is shadcn/ui components on a theme of its own, in <Code>src/systems/product/styles/theme.css</Code>: warm stone neutrals with an emerald accent, square corners, and Space Grotesk. In shadcn/ui's terms: base color stone, accent emerald, radius none. It is different from the app UI's neutral gray, rounded corners, and Inter on purpose, so you can tell at a glance which system a screen is in.</p>
        <p>Prototypes use <Code>lucide-react</Code> for icons until your system brings its own.</p>
      </Prose>
    </>
  ),
} satisfies SystemIntro;
