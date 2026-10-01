import { Button } from '@/platform/components/button';
import { toast } from '@/platform/components/toast';

export const Message = () => <Button variant="outline" onClick={() => toast.add({ title: 'Link copied' })}>Message</Button>;

export const Failure = () => (
  <Button variant="outline" onClick={() => toast.add({ type: 'error', title: 'Something named “main.tsx” already exists here.' })}>Error</Button>
);
