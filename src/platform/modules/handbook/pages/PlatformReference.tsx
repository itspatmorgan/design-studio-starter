import { Link, Outlet, getRouteApi } from '@tanstack/react-router';
import { SectionNav, NavList, NavGroup, navLinkClass, navLinkStyle } from '@/platform/app/shell/nav';
import type { PlatformReferenceGroup } from '@/platform/app/data/types';
import HandbookHeader from './HandbookHeader';

const rootApi = getRouteApi('__root__');
export const referenceHref = (source: string) => `/handbook/platform${source}`;

export function PlatformReferenceLayout() {
  const { platformReferences } = rootApi.useLoaderData();
  return <div className="flex h-full min-h-0">
    <SectionNav label="Handbook">
      <HandbookHeader />
      <NavList>
        <Link to={'/handbook/platform' as never} activeOptions={{ exact: true }} style={navLinkStyle} className={navLinkClass}>Overview</Link>
        {platformReferences.map((group) => <NavGroup key={group.id} heading={`${group.label}${group.enabled ? '' : ' · Disabled'}`}>
          {group.references.map((ref) => <Link key={ref.source} to={referenceHref(ref.source) as never} style={navLinkStyle} className={navLinkClass}>{ref.title}</Link>)}
        </NavGroup>)}
      </NavList>
    </SectionNav>
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden"><Outlet /></main>
  </div>;
}

export function RelatedGuidance({ group }: { group?: PlatformReferenceGroup }) {
  if (!group?.related.length) return null;
  return <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm">
    <span className="text-muted-foreground">Related context and instructions</span>
    {group.related.map((link) => <Link key={link.href} to={link.href as never} className="text-foreground underline underline-offset-4">{link.title}</Link>)}
  </div>;
}

export function PlatformReferenceIndex() {
  const { platformReferences, guide } = rootApi.useLoaderData();
  return <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto px-8 py-12">
    <h1 className="text-3xl font-semibold tracking-tight">Platform reference</h1>
    <p className="mt-4 max-w-[65ch] text-muted-foreground">Understand the platform and its capabilities. These references live with the code they describe. Docs provide shared context; Rules and Skills guide the agent's work.</p>
    {guide.length > 0 && <p className="mt-4 text-sm">For a guided introduction, start with the <Link to={'/guide' as never} className="underline underline-offset-4">Guide</Link>.</p>}
    <div className="mt-10 space-y-8">{platformReferences.map((group) => <section key={group.id} aria-labelledby={`reference-${group.id}`} className="border-t border-border pt-6">
      <h2 id={`reference-${group.id}`} className="text-lg font-medium">{group.label}{!group.enabled && <span className="ml-3 text-sm font-normal text-muted-foreground">Disabled</span>}</h2>
      {!group.enabled && <p className="mt-2 text-sm text-muted-foreground">Installed but unavailable. Enable this module to browse its references.</p>}
      {group.enabled && !group.references.length && <p className="mt-2 text-sm text-muted-foreground">No platform references supplied.</p>}
      <ul className="mt-3 space-y-3">{group.references.map((ref) => <li key={ref.source}>
        <Link to={referenceHref(ref.source) as never} className="font-medium underline underline-offset-4">{ref.title}</Link>
        <p className="mt-1 break-words font-mono text-xs text-muted-foreground">src{ref.source}</p>
      </li>)}</ul>
      <RelatedGuidance group={group} />
    </section>)}</div>
  </div>;
}
