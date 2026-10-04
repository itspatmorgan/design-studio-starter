import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon, Alert02Icon, ArrowDown01Icon, ArrowRight01Icon, Calendar03Icon, Cancel01Icon, Copy01Icon, Delete02Icon,
  Download01Icon, FavouriteIcon, FilterIcon, Home01Icon, InformationCircleIcon, LinkSquare02Icon, Mail01Icon, Menu01Icon,
  Notification01Icon, PencilEdit01Icon, Search01Icon, Settings01Icon, StarIcon, Tick02Icon, Upload01Icon, UserIcon,
} from '@hugeicons/core-free-icons';
// Platform system: the app UI's own components, stock shadcn/ui vendored into src/systems/platform/components/.
// Like every system, its component and foundations pages come from its files; this is what only
// its people can write: the introduction (which covers the theme), and the icons.
import { Code, CodeBlock, ColorModeSupport, IconGrid, Prose } from '@/platform/modules/systems/pages/foundations';
import system from './system';
import type { SystemIntro } from '@/platform/app/data/types';

const ICONS = {
  Search01Icon, Add01Icon, Settings01Icon, UserIcon, Notification01Icon, Delete02Icon, PencilEdit01Icon, Tick02Icon,
  Cancel01Icon, ArrowDown01Icon, ArrowRight01Icon, Mail01Icon, Calendar03Icon, Home01Icon, FilterIcon, Download01Icon,
  Upload01Icon, Copy01Icon, LinkSquare02Icon, InformationCircleIcon, Alert02Icon, StarIcon, FavouriteIcon, Menu01Icon,
};

export default {
  intro: (
    <>
      <Prose>
        <p>Studio’s supplied system brings together its foundations, components, context, rules, and skills.</p><p>Its guidance covers operating and maintaining Design Studio, including modules, documentation, and collaboration. Rules are not limited to UI components. The application infrastructure lives separately in <Code>src/platform/</Code>.</p>
        <p>Its components are stock <a href="https://ui.shadcn.com/docs/components" target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-4">shadcn/ui</a> components, vendored into <Code>src/systems/platform/components</Code> so you can read and change them. Each page links to that component's shadcn/ui docs. Only app UI code imports them. Prototypes never do.</p>
        <CodeBlock>{`import { Button } from '@/systems/platform/components/button';`}</CodeBlock>
      </Prose>
      <h2 className="mt-10 mb-3 text-lg font-semibold tracking-tight text-foreground">Theme</h2>
      <Prose>
        <ColorModeSupport modes={system.colorModes} />
        <p>shadcn/ui's default theme with the neutral base color, in <Code>src/systems/platform/styles/theme.css</Code>. Font families, typography, radius, shadows, and spacing are declared there alongside colors. Light values are on <Code>:root</Code> and <Code>.platform-theme</Code>; dark colors use the dark selectors.</p>
        <p>To restyle the app for your team, change the values in that file, or paste a theme from the shadcn/ui theme builder. Keep the variable names.</p>
      </Prose>
    </>
  ),
  icons: {
    library: 'HugeIcons (@hugeicons/react + @hugeicons/core-free-icons)',
    href: 'https://hugeicons.com/icons',
    snippet: `import { HugeiconsIcon } from '@hugeicons/react';\nimport { Search01Icon } from '@hugeicons/core-free-icons';\n\n<HugeiconsIcon icon={Search01Icon} size={16} />`,
    grid: <IconGrid icons={Object.entries(ICONS).map(([name, icon]) => ({ name, node: <HugeiconsIcon icon={icon} /> }))} />,
  },
} satisfies SystemIntro;
