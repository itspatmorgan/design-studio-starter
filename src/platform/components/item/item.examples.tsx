import { Layers01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/platform/components/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/platform/components/item';

// Each export named with a capital is one example on the component's page, shown live with its code.
export const Default = () => (
  <Item variant="outline" className="w-96">
    <ItemMedia variant="icon"><HugeiconsIcon icon={Layers01Icon} /></ItemMedia>
    <ItemContent>
      <ItemTitle>Feedback Inbox</ItemTitle>
      <ItemDescription>A small feedback tracker.</ItemDescription>
    </ItemContent>
    <ItemActions><Button size="sm" variant="outline">Open</Button></ItemActions>
  </Item>
);

export const AsAList = () => (
  <ItemGroup className="w-96 gap-0">
    {['Feedback Inbox', 'Settings revamp', 'Onboarding'].map((title) => (
      <Item key={title} size="xs" render={<a href="#" />}>
        <ItemMedia variant="icon"><HugeiconsIcon icon={Layers01Icon} /></ItemMedia>
        <ItemContent><ItemTitle>{title}</ItemTitle></ItemContent>
      </Item>
    ))}
  </ItemGroup>
);
