import type { ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/systems/studio/components/context-menu';
import { FileActionItems } from '@/platform/app/shell/FileActionItems';
import { navLinkClass, navLinkStyle } from '@/platform/app/shell/nav';

export default function FileNavItem({ href, path, label, nested = false, icon, className, reveal }: { href: string; path: string; label: string; nested?: boolean; icon?: ReactNode; className?: string; reveal: () => Promise<unknown> }) {
  const navigate = useNavigate();
  const local = import.meta.env.DEV;
  return <ContextMenu>
    <ContextMenuTrigger><Link title={path} to={href as never} activeOptions={{ exact: true, includeSearch: false }} style={{ ...navLinkStyle, ...(nested ? { paddingLeft: '1.75rem' } : {}) }} className={navLinkClass + (className ? ' ' + className : '')}>{icon}{label}</Link></ContextMenuTrigger>
    <ContextMenuContent className="min-w-44">
      <FileActionItems path={path} href={new URL(import.meta.env.BASE_URL.replace(/\/$/, '') + href, window.location.origin).href}
        sourceShortcut={local}
        edit={local ? () => { void navigate({ to: href as never, search: { mode: 'source' } as never }); } : undefined}
        open={local ? () => { void fetch('/__open-in-editor?file=' + encodeURIComponent(path)); } : undefined}
        reveal={local ? reveal : undefined} />
    </ContextMenuContent>
  </ContextMenu>;
}
