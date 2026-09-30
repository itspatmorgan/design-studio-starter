import { Mail } from 'lucide-react';
import { Button } from '@/systems/product/components/button';

export const Variants = () => (
  <>
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="link">Link</Button>
  </>
);

export const Sizes = () => (
  <>
    <Button size="xs">Extra small</Button>
    <Button size="sm">Small</Button>
    <Button>Default</Button>
    <Button size="lg">Large</Button>
  </>
);

export const WithIcon = () => (
  <Button><Mail data-icon="inline-start" />With icon</Button>
);

export const Disabled = () => <Button disabled>Disabled</Button>;
