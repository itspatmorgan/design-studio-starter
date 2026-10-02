import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/systems/product/components/avatar';

export const WithFallback = () => (
  <Avatar>
    <AvatarFallback>PM</AvatarFallback>
  </Avatar>
);

export const Sizes = () => (
  <>
    <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
    <Avatar><AvatarFallback>MD</AvatarFallback></Avatar>
    <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
  </>
);

export const WithBadge = () => (
  <Avatar>
    <AvatarFallback>AB</AvatarFallback>
    <AvatarBadge />
  </Avatar>
);

export const Group = () => (
  <AvatarGroup>
    <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
    <Avatar><AvatarFallback>CD</AvatarFallback></Avatar>
    <Avatar><AvatarFallback>EF</AvatarFallback></Avatar>
    <AvatarGroupCount>+3</AvatarGroupCount>
  </AvatarGroup>
);
