import DocumentationNavItem from './DocumentationNavItem';
import { Link, Outlet, getRouteApi } from '@tanstack/react-router';
import { SectionNav, NavList, navLinkClass, navLinkStyle } from '@/platform/app/shell/nav';
import type { PlatformReferenceGroup } from '@/platform/app/data/types';
import DocumentationHeader from './DocumentationHeader';

const rootApi = getRouteApi('__root__');
export const referenceHref = (source: string) => `/documentation/reference${source}`;

export function ReferenceLayout() {
  const { platformReferences } = rootApi.useLoaderData();
  return <div className="flex h-full min-h-0">
    <SectionNav label="Documentation">
      <DocumentationHeader reference />
      <NavList>
        <Link to="/documentation/reference" activeOptions={{ exact: true }} style={navLinkStyle} className={navLinkClass}>Overview</Link>
        {platformReferences.filter((group) => group.references.length).map((group) => <div key={group.id}>
          {group.references.map((ref, index) => <DocumentationNavItem key={ref.source} href={referenceHref(ref.source)} path={'src' + ref.source} label={index === 0 ? group.label : ref.title} nested={index > 0} />)}
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
    {guide.length > 0 && <p className="mt-4 text-sm">For a guided introduction, start with the <Link to={'/documentation/guide' as never} className="underline underline-offset-4">Guide</Link>.</p>}
    <p className="mt-4 text-sm">The <Link to={'/handbook/rules/documentation-standards' as never} className="underline underline-offset-4">Documentation standards</Link> define where context belongs and how to keep it accurate.</p>
    <section className="mt-10 max-w-[65ch] space-y-4">
      <h2 className="text-xl font-semibold">What this documentation contributes</h2>
      <p>Reference describes the environment an agent is operating: what a prototype may depend on, how files are structured, and what each capability provides. It helps the agent make changes that fit the platform.</p>
      <p>The Guide explains how to use the studio. Reference supplies the detailed contracts behind that guidance, including developer sections omitted from Guide chapters. Both can present the same module README.</p>
    </section>
    <section className="mt-10 max-w-[65ch] space-y-4">
      <h2 className="text-xl font-semibold">How it joins the working context</h2>
      <ol className="list-decimal space-y-3 pl-5">
        <li>Your request establishes the outcome and scope.</li>
        <li>Repository instructions, Rules, and Skills lead the agent to relevant contracts and procedures.</li>
        <li>Handbook Context supplies the team's product context. Prototype documents supply the local intent and decisions.</li>
        <li>The agent reads the relevant files, applies their guidance, and checks the resulting work.</li>
      </ol>
      <p className="text-muted-foreground">This is context available to the agent, not a record of what it read. Listing a file here does not automatically load it into a conversation.</p>
    </section>
    <section className="mt-10 max-w-[65ch] space-y-4">
      <h2 className="text-xl font-semibold">When to consult or change a reference</h2>
      <p>Consult a contract when you or your agent need to understand a boundary, troubleshoot behavior, or extend a capability. Routine prototype work should not require changing platform documentation.</p>
      <p>References live beside the code they describe. Local file menus let you inspect and edit the complete source. These are shared changes: coordinate them with the maintainer and keep guidance aligned with the implementation.</p>
      <p>Guide and Reference can share a source file. Editing a module README changes both presentations. Published documentation supports reading and copying; local editing preserves checks for external file changes.</p>
    </section>
    {disabled.length > 0 && <p className="mt-8 text-sm text-muted-foreground">Disabled modules: {disabled.map((group) => group.label).join(', ')}. Their references become available when enabled.</p>}
    <p className="mt-8 text-sm text-muted-foreground">The <Link to={'/handbook' as never} className="underline underline-offset-4">Handbook</Link> holds the studio's curated context, rules, and skills. References remain with the code they describe.</p>
  </div>;
}
