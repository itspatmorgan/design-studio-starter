import { Button } from '@/platform/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/platform/components/tooltip';

export const Sides = () => (
  <>
    {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
      <Tooltip key={side}>
        <TooltipTrigger render={<Button variant="outline" />}>{side}</TooltipTrigger>
        <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
      </Tooltip>
    ))}
  </>
);
