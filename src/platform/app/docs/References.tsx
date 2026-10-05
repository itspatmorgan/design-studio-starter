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
  const foundationGroup = (section: 'understand' | 'operate' | 'extend', heading: string) => {
    const pages = foundations.filter(ref => (ref.section ?? 'extend') === section);
    return pages.length > 0 && <NavGroup heading={heading}>{pages.map(ref => <DocumentationNavItem key={ref.source} href={referenceHref(ref.source)} path={'src' + ref.source} label={ref.title} />)}</NavGroup>;
  };
  const modules = platformReferences.filter((group) => group.id !== 'core' && group.id !== 'modules' && group.references.length);
  return <div className="flex h-full min-h-0">
    <SectionNav label="Documentation">
      <DocumentationHeader reference />
      <NavList>
        <Link to="/documentation/reference" activeOptions={{ exact: true }} style={navLinkStyle} className={navLinkClass}>Overview</Link>
        {foundationGroup('understand', 'Understand Studio')}
        {foundationGroup('operate', 'Operate Studio')}
        {modules.length > 0 && <NavGroup heading="Capabilities">
          {modules.map((group) => {
            if (group.references.length === 1) {
              const ref = group.references[0];
              return <DocumentationNavItem key={group.id} href={referenceHref(ref.source)} path={'src' + ref.source} label={ref.title} />;
            }
            const readme = group.references.find((ref) => ref.source.endsWith('/README.md'));
            const contracts = group.references.filter((ref) => ref !== readme);
            return <div key={group.id}>
              {readme ? <DocumentationNavItem href={referenceHref(readme.source)} path={'src' + readme.source} label={readme.title} /> : <p className="px-2 pt-2 text-sm font-medium">{group.label}</p>}
              {contracts.map((ref) => <DocumentationNavItem key={ref.source} href={referenceHref(ref.source)} path={'src' + ref.source} label={ref.title} nested />)}
            </div>;
          })}
        </NavGroup>}
        {foundationGroup('extend', 'Extend Studio')}
      </NavList>
    </SectionNav>
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden"><Outlet /></main>
  </div>;
}

export function AboutReference({ source, group }: { source: string; group?: PlatformReferenceGroup }) {
  const related = group?.references.find(ref => ref.source === source)?.related ?? [];
  return <details className="mt-10 border-t border-border pt-4 text-sm">
    <summary className="cursor-pointer text-muted-foreground">About this reference</summary>
    <p className="mt-4 break-words font-mono text-xs text-muted-foreground">src{source}</p>
    <p className="mt-3 text-muted-foreground">This source owns the technical behavior it describes. Studio rules and skills consult it when relevant to a task. Availability does not mean an agent has read it.</p>
    {Boolean(related.length) && <><p className="mt-4 font-medium">Related operating instructions and intent</p><ul className="mt-2 space-y-2">{related.map((link) => <li key={link.href}><Link to={link.href as never} className="underline underline-offset-4">{link.title}</Link></li>)}</ul></>}
  </details>;
}

export function ReferenceIndex() {
  const { platformReferences, guide } = rootApi.useLoaderData();
  const disabled = platformReferences.filter(group => !group.enabled);
  const hasGuide = (slug: string) => guide.some(page => page.slug === slug);
  const ref = (file: string) => referenceHref('/platform/core/' + file + '.md');
  const questions = [
    {
      title: 'What can I change?',
      description: 'Your prototypes are your working area. Systems, configuration, and platform code are shared capabilities; coordinate changes with the maintainer.',
      links: [
        { title: 'Platform and system responsibilities', href: ref('contracts-and-instructions') },
        { title: 'Contributor scope', href: '/systems/studio/rules/contributor-scope' },
        ...(hasGuide('customize') ? [{ title: 'Customize your studio', href: '/documentation/guide/customize' }] : []),
      ],
    },
    {
      title: 'Which system applies?',
      description: 'A prototype’s assignment selects its toolkit and product instructions. None keeps components and styles local. The browser’s Systems selector only changes what you browse.',
      links: [
        { title: 'System choice and boundaries', href: referenceHref('/modules/systems/reference.md') },
        { title: 'Configure the default', href: ref('config') },
      ],
    },
    {
      title: 'How does my agent get instructions?',
      description: 'Repository instructions lead the agent to platform operating rules, relevant procedures, and the assigned system’s knowledge. The agent reads those files; Studio does not inject a context bundle.',
      links: [
        ...(hasGuide('agent-context') ? [{ title: 'See the context flow', href: '/documentation/guide/agent-context' }] : []),
        { title: 'Agent context routing', href: ref('agent-context') },
      ],
    },
    {
      title: 'How do I save and share?',
      description: 'Save updates local files. Commit records a version; push shares it through Git. Publishing creates a viewing site through a separately configured host.',
      links: [
        { title: 'Editing and saving', href: ref('source') },
        ...(hasGuide('collaborate') ? [{ title: 'Collaborate through Git', href: '/documentation/guide/collaborate' }] : []),
        { title: 'Publishing', href: ref('publishing') },
      ],
    },
    {
      title: 'What should I check when something breaks?',
      description: 'Give your agent the error and what you were trying to do. Check the affected files, system assignment, and enabled capabilities. A successful build checks supported boundaries; it does not prove that an agent followed every instruction.',
      links: [
        { title: 'Checks and troubleshooting', href: ref('checks') },
        { title: 'Inspect studio configuration', href: ref('config') },
      ],
    },
  ];
  return <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto px-8 py-12">
    <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
    <p className="mt-4 max-w-[65ch] leading-7 text-muted-foreground">Understand how Studio operates, find the instructions behind your work, and consult detailed contracts when you need them.</p>
    {guide.length > 0 && <p className="mt-4 text-sm">New to Studio? Start with the <Link to={'/documentation/guide' as never} className="underline underline-offset-4">Guide</Link>.</p>}
    <ol className="mt-10 max-w-[65ch] space-y-8">
      {questions.map(question => <li key={question.title}>
        <h2 className="text-xl font-semibold">{question.title}</h2>
        <p className="mt-3 text-sm leading-6 text-foreground/80">{question.description}</p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">{question.links.map(link => <li key={link.href}><Link to={link.href as never} className="underline underline-offset-4">{link.title}</Link></li>)}</ul>
      </li>)}
    </ol>
    <p className="mt-10 max-w-[65ch] text-sm leading-6 text-muted-foreground">Reference presents the original files that define platform behavior. Studio rules direct agent work; context supplies intent; skills describe procedures. Each responsibility has one owning source. Use search (⌘K / Ctrl+K) to find a page by title.</p>
    {disabled.length > 0 && <p className="mt-6 text-sm text-muted-foreground">Disabled capabilities: {disabled.map(group => group.label).join(', ')}. Their references become available when enabled.</p>}
  </div>;
}
