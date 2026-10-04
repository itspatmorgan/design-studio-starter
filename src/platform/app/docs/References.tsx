import DocumentationNavItem from './DocumentationNavItem';
import { Link, Outlet, getRouteApi } from '@tanstack/react-router';
import { SectionNav, NavList, NavGroup, navLinkClass, navLinkStyle } from '@/platform/app/shell/nav';
import type { PlatformReferenceGroup } from '@/platform/app/data/types';
import DocumentationHeader from './DocumentationHeader';

const rootApi = getRouteApi('__root__');
export const referenceHref = (source: string) => `/documentation/reference${source}`;

export function ReferenceLayout() {
  const { platformReferences } = rootApi.useLoaderData();
  const foundations = platformReferences.filter((group) => group.id === 'core' || group.id === 'modules')
    .flatMap((group) => group.references)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title));
  const modules = platformReferences.filter((group) => group.id !== 'core' && group.id !== 'modules' && group.references.length);
  return <div className="flex h-full min-h-0">
    <SectionNav label="Documentation">
      <DocumentationHeader reference />
      <NavList>
        <Link to="/documentation/reference" activeOptions={{ exact: true }} style={navLinkStyle} className={navLinkClass}>Overview</Link>
        <NavGroup heading="Platform foundations">
          {foundations.map((ref) => <DocumentationNavItem key={ref.source} href={referenceHref(ref.source)} path={'src' + ref.source} label={ref.title} />)}
        </NavGroup>
        {modules.length > 0 && <NavGroup heading="Modules">
          {modules.map((group) => {
            const readme = group.references.find((ref) => ref.source.endsWith('/README.md'));
            const contracts = group.references.filter((ref) => ref !== readme);
            return <div key={group.id}>
              {readme ? <DocumentationNavItem href={referenceHref(readme.source)} path={'src' + readme.source} label={readme.title} /> : <p className="px-2 pt-2 text-sm font-medium">{group.label}</p>}
              {contracts.map((ref) => <DocumentationNavItem key={ref.source} href={referenceHref(ref.source)} path={'src' + ref.source} label={ref.title} nested />)}
            </div>;
          })}
        </NavGroup>}
      </NavList>
    </SectionNav>
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden"><Outlet /></main>
  </div>;
}

export function AboutReference({ source, group }: { source: string; group?: PlatformReferenceGroup }) {
  return <details className="mt-10 border-t border-border pt-4 text-sm">
    <summary className="cursor-pointer text-muted-foreground">About this reference</summary>
    <p className="mt-4 break-words font-mono text-xs text-muted-foreground">src{source}</p>
    <p className="mt-3 text-muted-foreground">This source owns the technical behavior it describes. Studio rules and skills consult it when relevant to a task. Availability does not mean an agent has read it.</p>
    {Boolean(group?.related.length) && <><p className="mt-4 font-medium">Related operating instructions and intent</p><ul className="mt-2 space-y-2">{group!.related.map((link) => <li key={link.href}><Link to={link.href as never} className="underline underline-offset-4">{link.title}</Link></li>)}</ul></>}
  </details>;
}

export function ReferenceIndex() {
  const { platformReferences, guide } = rootApi.useLoaderData();
  const disabled = platformReferences.filter((group) => !group.enabled);
  return <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto px-8 py-12">
    <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
    <p className="mt-4 max-w-[65ch] text-muted-foreground">The complete documentation supplied with the platform: capabilities, boundaries, and file contracts. People and agents can consult it when needed. You do not need to read or customize these files to begin creating.</p>
    {guide.length > 0 && <p className="mt-4 text-sm">For a guided introduction, start with the <Link to={'/documentation/guide' as never} className="underline underline-offset-4">Guide</Link>.</p>}
    <p className="mt-4 text-sm">The <Link to={'/systems/studio/rules/documentation-standards' as never} className="underline underline-offset-4">Documentation standards</Link> define where context belongs and how to keep it accurate.</p>
    <section className="mt-10 max-w-[65ch] space-y-4">
      <h2 className="text-xl font-semibold">Contracts and Studio instructions</h2>
      <p>Core and module contracts are the technical system of record: supported file structures, behavior, interfaces, and dependency boundaries. Reference displays those source files.</p>
      <p>The Studio system owns operating instructions for working within those contracts. Rules direct agent behavior, Skills provide task procedures, and Context explains Design Studio’s intent. These files link to contracts instead of redefining their technical requirements.</p>
      <p>See <Link to={'/documentation/reference/platform/core/contracts-and-instructions.md' as never} className="underline underline-offset-4">Contracts and operating instructions</Link> for ownership, examples, and how to update each source.</p>
      <p>The Guide explains how to use the studio. Reference supplies the detailed contracts behind that guidance, including developer sections omitted from Guide chapters. Both can present the same module README.</p>
    </section>
    <section className="mt-10 max-w-[65ch] space-y-4">
      <h2 className="text-xl font-semibold">How it joins the working context</h2>
      <ol className="list-decimal space-y-3 pl-5">
        <li>Your request establishes the outcome and scope.</li>
        <li>Repository instructions, Rules, and Skills lead the agent to relevant contracts and procedures.</li>
        <li>Your system’s Context supplies the team's product context. Prototype documents supply the local intent and decisions.</li>
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
    <p className="mt-8 text-sm text-muted-foreground">The <Link to={'/systems' as never} className="underline underline-offset-4">Systems</Link> own their context, rules, and skills. References remain with the code they describe.</p>
  </div>;
}
