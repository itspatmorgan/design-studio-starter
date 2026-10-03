import { Link, Outlet, getRouteApi } from '@tanstack/react-router';
import { SectionNav, NavList, navLinkClass, navLinkStyle } from '@/platform/app/shell/nav';
import type { PlatformReferenceGroup } from '@/platform/app/data/types';
import DocumentationHeader from './DocumentationHeader';

const rootApi = getRouteApi('__root__');
export const referenceHref = (source: string) => `/reference${source}`;

export function ReferenceLayout() {
  const { platformReferences } = rootApi.useLoaderData();
  return <div className="flex h-full min-h-0">
    <SectionNav label="Documentation">
      <DocumentationHeader reference />
      <NavList>
        <Link to="/reference" activeOptions={{ exact: true }} style={navLinkStyle} className={navLinkClass}>Overview</Link>
        {platformReferences.filter((group) => group.references.length).map((group) => <div key={group.id}>
          {group.references.map((ref, index) => <Link key={ref.source} to={referenceHref(ref.source) as never} style={{ ...navLinkStyle, ...(index > 0 ? { paddingLeft: '1.75rem' } : {}) }} className={navLinkClass}>{index === 0 ? group.label : ref.title}</Link>)}
        </div>)}
      </NavList>
    </SectionNav>
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden"><Outlet /></main>
  </div>;
}

export function AboutReference({ source, group }: { source: string; group?: PlatformReferenceGroup }) {
  return <details className="mt-10 border-t border-border pt-4 text-sm">
    <summary className="cursor-pointer text-muted-foreground">About this reference</summary>
    <p className="mt-4 break-words font-mono text-xs text-muted-foreground">src{source}</p>
    <p className="mt-3 text-muted-foreground">Supplied with the platform. Available to the agent when relevant instructions or the current task lead it here.</p>
    {Boolean(group?.related.length) && <><p className="mt-4 font-medium">Related context and instructions</p><ul className="mt-2 space-y-2">{group!.related.map((link) => <li key={link.href}><Link to={link.href as never} className="underline underline-offset-4">{link.title}</Link></li>)}</ul></>}
  </details>;
}

export function ReferenceIndex() {
  const { platformReferences, guide } = rootApi.useLoaderData();
  const disabled = platformReferences.filter((group) => !group.enabled);
  return <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto px-8 py-12">
    <h1 className="text-3xl font-semibold tracking-tight">Reference</h1>
    <p className="mt-4 max-w-[65ch] text-muted-foreground">The complete documentation supplied with the platform: capabilities, boundaries, and file contracts. People and agents can consult it when needed. You do not need to read or customize these files to begin creating.</p>
    {guide.length > 0 && <p className="mt-4 text-sm">For a guided introduction, start with the <Link to={'/guide' as never} className="underline underline-offset-4">Guide</Link>.</p>}
    <ul className="mt-8 divide-y divide-border">{platformReferences.filter((group) => group.references.length).map((group) => <li key={group.id} className="py-4">
      {group.references.map((ref, index) => <div key={ref.source} className={index > 0 ? 'mt-2 pl-4 text-sm' : 'font-medium'}><Link to={referenceHref(ref.source) as never} className="underline underline-offset-4">{index === 0 ? group.label : ref.title}</Link></div>)}
    </li>)}</ul>
    {disabled.length > 0 && <p className="mt-8 text-sm text-muted-foreground">Disabled modules: {disabled.map((group) => group.label).join(', ')}. Their references become available when enabled.</p>}
    <p className="mt-8 text-sm text-muted-foreground">The <Link to={'/handbook' as never} className="underline underline-offset-4">Handbook</Link> holds the studio's curated context, rules, and skills. References remain with the code they describe.</p>
  </div>;
}
