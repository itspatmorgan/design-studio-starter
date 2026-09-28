import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon, Alert02Icon, ArrowDown01Icon, ArrowRight01Icon, Calendar03Icon, Cancel01Icon, Copy01Icon, Delete02Icon,
  Download01Icon, FavouriteIcon, FilterIcon, Home01Icon, InformationCircleIcon, LinkSquare02Icon, Mail01Icon, Menu01Icon,
  Notification01Icon, PencilEdit01Icon, Search01Icon, Settings01Icon, StarIcon, Tick02Icon, Upload01Icon, UserIcon,
} from '@hugeicons/core-free-icons';
// Studio system: the app UI's own components.
import { Button } from '@/studio/components/button';
import { Input } from '@/studio/components/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/studio/components/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/studio/components/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { ContributorAvatar } from '@/studio/app/shell/ContributorAvatar';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/studio/components/command';
import { Code, CodeBlock, IconGrid, Prose } from '@/studio/app/pages/systems/foundations';
import type { DesignSystem } from '@/studio/app/data/types';

const ICONS = {
  Search01Icon, Add01Icon, Settings01Icon, UserIcon, Notification01Icon, Delete02Icon, PencilEdit01Icon, Tick02Icon,
  Cancel01Icon, ArrowDown01Icon, ArrowRight01Icon, Mail01Icon, Calendar03Icon, Home01Icon, FilterIcon, Download01Icon,
  Upload01Icon, Copy01Icon, LinkSquare02Icon, InformationCircleIcon, Alert02Icon, StarIcon, FavouriteIcon, Menu01Icon,
};

function CommandDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Open command menu</Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Pages">
              <CommandItem onSelect={() => setOpen(false)}>Prototypes</CommandItem>
              <CommandItem onSelect={() => setOpen(false)}>Systems</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem onSelect={() => setOpen(false)}>Toggle dark mode</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

export const studio: DesignSystem = {
  label: 'Studio',
  dir: 'src/studio/components/',
  scopeClass: '',
  intro: (
    <Prose>
      <p>The app's own system. It is the wrapper that makes the sandbox work: the nav rail, the index, prototype navigation, the command palette, and this page.</p>
      <p>It is maintained with the platform, not per prototype. Components live in <Code>src/studio/components</Code>, and only app UI code imports them. Prototypes never do.</p>
      <CodeBlock>{`import { Button } from '@/studio/components/button';`}</CodeBlock>
    </Prose>
  ),
  theme: (
    <Prose>
      <p>shadcn/ui's default theme with the neutral base color, in <Code>src/studio/styles/index.css</Code>. Light values are on <Code>:root</Code>, dark values on <Code>.dark</Code>.</p>
      <p>To restyle the app for your team, change the values in those two blocks, or paste a theme from the shadcn/ui theme builder. Keep the variable names.</p>
      <p>The dark mode toggle in the rail puts <Code>.dark</Code> on the page. Both systems follow it.</p>
    </Prose>
  ),
  showRadius: true,
  typeSamples: [
    { label: 'text-[26px] font-semibold', className: 'text-[26px] font-semibold tracking-[-0.01em]' },
    { label: 'text-base font-semibold', className: 'text-base font-semibold' },
    { label: 'text-sm font-semibold', className: 'text-sm font-semibold' },
    { label: 'text-sm font-medium', className: 'text-sm font-medium' },
    { label: 'text-sm', className: 'text-sm' },
    { label: 'text-xs font-medium', className: 'text-xs font-medium' },
  ],
  icons: {
    library: 'HugeIcons (@hugeicons/react + @hugeicons/core-free-icons)',
    href: 'https://hugeicons.com/icons',
    snippet: `import { HugeiconsIcon } from '@hugeicons/react';\nimport { Search01Icon } from '@hugeicons/core-free-icons';\n\n<HugeiconsIcon icon={Search01Icon} size={16} />`,
    grid: <IconGrid icons={Object.entries(ICONS).map(([name, icon]) => ({ name, node: <HugeiconsIcon icon={icon} /> }))} />,
  },
  categories: [
    { name: 'Actions', components: [
      { name: 'Button', file: 'button.tsx', description: 'Actions in the app UI, like opening a dialog. Variants for emphasis, sizes for density.', demo: () => (
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
            <Button size="icon" aria-label="Add"><HugeiconsIcon icon={Add01Icon} size={16} /></Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      ) },
    ] },
    { name: 'Form controls', components: [
      { name: 'Input', file: 'input.tsx', description: 'A single-line text field, like the search box on the Prototypes page.', demo: () => (
        <>
          <Input placeholder="Search prototypes" className="w-56" />
          <Input placeholder="Disabled" disabled className="w-56" />
        </>
      ) },
    ] },
    { name: 'Overlays', components: [
      { name: 'Tooltip', file: 'tooltip.tsx', description: 'A short label on hover or focus, used for the icon buttons on the rail.', demo: () => (
        <>
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <Tooltip key={side}>
              <TooltipTrigger render={<Button variant="outline" />}>{side}</TooltipTrigger>
              <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
            </Tooltip>
          ))}
        </>
      ) },
      { name: 'Command', file: 'command.tsx', description: 'A searchable list of actions. The ⌘K palette is built on it.', demo: CommandDemo },
    ] },
    { name: 'Layout', components: [
      { name: 'Tabs', file: 'tabs.tsx', description: 'Switches between views of the same content, like the systems at the top of this sidebar.', demo: () => (
        <Tabs defaultValue="overview" className="w-72">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="views">Views</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-muted-foreground">Overview content.</TabsContent>
          <TabsContent value="views" className="text-muted-foreground">Views content.</TabsContent>
          <TabsContent value="notes" className="text-muted-foreground">Notes content.</TabsContent>
        </Tabs>
      ) },
      { name: 'Collapsible', file: 'collapsible.tsx', description: 'Shows and hides a section, like groups in the prototype navigation and the About panel.', demo: () => (
        <Collapsible className="w-64 text-sm">
          <CollapsibleTrigger className="group flex items-center gap-1.5 font-medium">
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="text-muted-foreground transition-transform group-not-data-panel-open:-rotate-90" />
            Toggle details
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pl-5 text-muted-foreground">Hidden until opened.</CollapsibleContent>
        </Collapsible>
      ) },
    ] },
    { name: 'Display', components: [
      { name: 'Avatar', file: 'avatar.tsx', description: "A person's photo or initials. The app shows contributors' initials.", demo: () => (
        <>
          <ContributorAvatar name="Patrick Morgan" />
          <ContributorAvatar name="Patrick Morgan" size="default" />
          <ContributorAvatar name="Patrick Morgan" size="lg" />
        </>
      ) },
      { name: 'Card', file: 'card.tsx', description: 'A bordered container for one item, like each prototype on the Prototypes page.', demo: () => (
        <Card className="w-80">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>A short description.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Card content</CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save</Button>
          </CardFooter>
        </Card>
      ) },
    ] },
  ],
};
