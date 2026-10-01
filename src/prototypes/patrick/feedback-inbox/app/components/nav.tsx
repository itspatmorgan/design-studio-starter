// Moving between this prototype's screens. A prototype's address changes if it is renamed or moved to
// another contributor, so the links are built from the address you're on instead of being written out.
import type { ReactNode } from 'react';
import { Link, useLocation, useParams } from '@tanstack/react-router';

export function useScreenPath() {
  const { contributor, prototype } = useParams({ strict: false }) as { contributor?: string; prototype?: string };
  return (screen: string) => `/${contributor}/${prototype}/${screen}`;
}

export function ScreenLink({ to, className, onClick, children }: { to: string; className?: string; onClick?: () => void; children: ReactNode }) {
  const path = useScreenPath()(to);
  return <Link to={path as never} className={className} onClick={onClick}>{children}</Link>;
}

export function useIsOn(screen: string) {
  return useLocation().pathname.endsWith(`/${screen}`);
}
