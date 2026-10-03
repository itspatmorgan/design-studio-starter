import { Link, useNavigate } from '@tanstack/react-router';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/platform/components/context-menu';
import { FileActionItems } from '@/platform/app/shell/FileActionItems';
import { navLinkClass, navLinkStyle } from '@/platform/app/shell/nav';
import { documentationRequest } from './documentationSource';

export default function DocumentationNavItem({ href, path, label, nested = false }: { href: string; path: string; label: string; nested?: boolean }) {
  const navigate = useNavigate();
  const local = import.meta.env.DEV;
  return <ContextMenu>
    <ContextMenuTrigger><Link to={href as never} activeOptions={{ exact: true, includeSearch: false }} style={{ ...navLinkStyle, ...(nested ? { paddingLeft: '1.75rem' } : {}) }} className={navLinkClass}>{label}</Link></ContextMenuTrigger>
    <ContextMenuContent className="min-w-44">
      <FileActionItems path={path} href={new URL(import.meta.env.BASE_URL.replace(/\/$/, '') + href, window.location.origin).href}
        edit={local ? () => { void navigate({ to: href as never, search: { mode: 'source' } as never }); } : undefined}
        open={local ? () => { void fetch('/__open-in-editor?file=' + encodeURIComponent(path)); } : undefined}
        reveal={local ? () => documentationRequest('reveal', path) : undefined} />
    </ContextMenuContent>
  </ContextMenu>;
}
