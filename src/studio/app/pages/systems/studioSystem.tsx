import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon, Alert02Icon, ArrowDown01Icon, ArrowRight01Icon, Calendar03Icon, Cancel01Icon, Copy01Icon, Delete02Icon,
  Download01Icon, FavouriteIcon, FilterIcon, Home01Icon, InformationCircleIcon, LinkSquare02Icon, Mail01Icon, Menu01Icon,
  Notification01Icon, PencilEdit01Icon, Search01Icon, Settings01Icon, StarIcon, Tick02Icon, Upload01Icon, UserIcon,
} from '@hugeicons/core-free-icons';
// Studio system: the app UI's own components, stock shadcn/ui vendored into src/studio/components/.
// Like every system, its component and foundations pages come from its files; this is what only
// its people can write: the introduction (which covers the theme), and the icons.
import { Code, CodeBlock, IconGrid, Prose } from '@/studio/app/pages/systems/foundations';
import type { DesignSystem } from '@/studio/app/data/types';

const ICONS = {
  Search01Icon, Add01Icon, Settings01Icon, UserIcon, Notification01Icon, Delete02Icon, PencilEdit01Icon, Tick02Icon,
  Cancel01Icon, ArrowDown01Icon, ArrowRight01Icon, Mail01Icon, Calendar03Icon, Home01Icon, FilterIcon, Download01Icon,
  Upload01Icon, Copy01Icon, LinkSquare02Icon, InformationCircleIcon, Alert02Icon, StarIcon, FavouriteIcon, Menu01Icon,
};

export const studio: DesignSystem = {
  label: 'Studio',
  dir: 'src/studio/components/',
  scopeClass: '',
  intro: (
    <>
      <Prose>
        <p>The app's own system: the rail, the Prototypes page, prototype navigation, the command palette, and this page.</p>
        <p>Its components are stock <a href="https://ui.shadcn.com/docs/components" target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-4">shadcn/ui</a> components, vendored into <Code>src/studio/components</Code> so you can read and change them. Each page links to that component's shadcn/ui docs. Only app UI code imports them. Prototypes never do.</p>
        <CodeBlock>{`import { Button } from '@/studio/components/button';`}</CodeBlock>
      </Prose>
      <h2 className="mt-10 mb-3 text-lg font-semibold tracking-tight text-foreground">Theme</h2>
      <Prose>
        <p>shadcn/ui's default theme with the neutral base color, in <Code>src/studio/styles/index.css</Code>. Light values are on <Code>:root</Code>, dark values on <Code>.dark</Code>.</p>
        <p>To restyle the app for your team, change the values in those two blocks, or paste a theme from the shadcn/ui theme builder. Keep the variable names.</p>
        <p>The dark mode toggle in the rail puts <Code>.dark</Code> on the page. Both systems follow it.</p>
      </Prose>
    </>
  ),
  icons: {
    library: 'HugeIcons (@hugeicons/react + @hugeicons/core-free-icons)',
    href: 'https://hugeicons.com/icons',
    snippet: `import { HugeiconsIcon } from '@hugeicons/react';\nimport { Search01Icon } from '@hugeicons/core-free-icons';\n\n<HugeiconsIcon icon={Search01Icon} size={16} />`,
    grid: <IconGrid icons={Object.entries(ICONS).map(([name, icon]) => ({ name, node: <HugeiconsIcon icon={icon} /> }))} />,
  },
};
