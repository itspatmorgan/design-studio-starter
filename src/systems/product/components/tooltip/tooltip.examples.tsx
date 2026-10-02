import { Plus } from 'lucide-react';
import { Button } from '@/systems/product/components/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/systems/product/components/tooltip';

export const Basic = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
      <TooltipContent>Helpful hint</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const IconButton = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="Add" />}>
        <Plus />
      </TooltipTrigger>
      <TooltipContent>Add item</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
