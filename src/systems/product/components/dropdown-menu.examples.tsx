import { Button } from '@/systems/product/components/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/systems/product/components/dropdown-menu';

export const Basic = () => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="outline" />}>Open menu</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Message</DropdownMenuLabel>
        <DropdownMenuItem>Open<DropdownMenuShortcut>⌘O</DropdownMenuShortcut></DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
