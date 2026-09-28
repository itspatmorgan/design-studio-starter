import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon, Alert02Icon, ArrowDown01Icon, ArrowRight01Icon, Calendar03Icon, Cancel01Icon, Copy01Icon, Delete02Icon,
  Download01Icon, FavouriteIcon, FilterIcon, Home01Icon, InformationCircleIcon, LinkSquare02Icon, Mail01Icon, Menu01Icon,
  Notification01Icon, PencilEdit01Icon, Search01Icon, Settings01Icon, StarIcon, Tick02Icon, Upload01Icon, UserIcon,
} from '@hugeicons/core-free-icons';
// Studio system: the app UI's own components.
import { Button } from '@/studio/components/button';
import { Badge } from '@/studio/components/badge';
import { Input } from '@/studio/components/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/studio/components/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/components/tooltip';
import { ContributorAvatar } from '@/studio/components/avatar';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/studio/components/command';
import { Code, CodeBlock, IconGrid, Prose } from './foundations';

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
      </CommandDialog>
    </>
  );
}

export const studio = {
  label: 'Studio',
  scopeClass: '',
  Frame: 'div',
  intro: (
    <Prose>
      <p>The components for the app UI: navigation, the index, the command menu, and this page.</p>
      <p>They live in <Code>src/studio/components</Code>, with the theme in <Code>src/studio/styles/index.css</Code>.</p>
      <CodeBlock>{`import { Button } from '@/studio/components/button';`}</CodeBlock>
      <p>Only the app UI uses this system. Prototypes never import it; they use Product.</p>
    </Prose>
  ),
  theme: (
    <Prose>
      <p>Defined in <Code>src/studio/styles/index.css</Code>, on <Code>:root</Code> for light and <Code>.dark</Code> for dark. It applies everywhere outside <Code>.product-theme</Code>.</p>
      <p>It is shadcn/ui's default theme, neutral base color. It adds one token of its own, <Code>--sidebar-accent-active</Code>, for the selected nav item.</p>
      <p>To use your own colors, edit the values in <Code>:root</Code> and <Code>.dark</Code>, or paste a theme from the shadcn/ui theme builder. Keep the variable names the same.</p>
      <p>The dark mode toggle in the rail adds <Code>.dark</Code> to the page, and both systems switch together.</p>
      <p>Studio pop-ups render into <Code>document.body</Code>, outside the product wrapper, on purpose.</p>
    </Prose>
  ),
  extraColorGroups: [{ name: 'Studio only', tokens: [['sidebar-accent-active', 'sidebar-accent-foreground']] }],
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
    grid: <IconGrid icons={Object.entries(ICONS).map(([name, icon]) => ({ name, node: <HugeiconsIcon icon={icon} size={20} /> }))} />,
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
            <Button size="icon" aria-label="Add"><HugeiconsIcon icon={Add01Icon} size={16} /></Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      ) },
    ] },
    { name: 'Form controls', components: [
      { name: 'Input', file: 'input.jsx', demo: () => (
        <>
          <Input placeholder="Search prototypes" className="w-56" />
          <Input placeholder="Disabled" disabled className="w-56" />
        </>
      ) },
    ] },
    { name: 'Overlays', components: [
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
      { name: 'Command', file: 'command.jsx', demo: CommandDemo },
    ] },
    { name: 'Layout', components: [
      { name: 'Collapsible', file: 'collapsible.jsx', demo: () => (
        <Collapsible className="w-64 text-sm">
          <CollapsibleTrigger className="group flex items-center gap-1.5 font-medium">
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="text-muted-foreground transition-transform group-data-[state=closed]:-rotate-90" />
            Toggle details
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 pl-5 text-muted-foreground">Hidden until opened.</CollapsibleContent>
        </Collapsible>
      ) },
    ] },
    { name: 'Display', components: [
      { name: 'Badge', file: 'badge.jsx', demo: () => (
        <>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </>
      ) },
      { name: 'Avatar', file: 'avatar.jsx', demo: () => (
        <>
          <ContributorAvatar name="Example Contributor" size={20} />
          <ContributorAvatar name="Example Contributor" size={32} />
          <ContributorAvatar name="Example Contributor" size={48} />
        </>
      ) },
      { name: 'Card', file: 'card.jsx', demo: () => (
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
