import { Avatar, AvatarFallback } from '@/studio/components/avatar';

// A contributor's initials in shadcn/ui's Avatar ("Patrick Morgan" → "PM").
export function ContributorAvatar({ name, size = 'sm' }: { name?: string; size?: 'sm' | 'default' | 'lg' }) {
  const initials = name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <Avatar size={size} aria-hidden>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
