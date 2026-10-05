import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/systems/studio/components/collapsible';
import { Link, useParams } from '@tanstack/react-router';
import { useManifest } from '@/platform/app/data/useManifest';
import { contentId, SYSTEM_CONTENT_SECTIONS } from '@/platform/core/roots';
import { artifactLabel, findArtifact } from '@/platform/app/data/manifest';
import { SectionNav, NavList } from '@/platform/app/shell/nav';
import FileTree from '@/modules/prototypes/viewer/FileTree';
import SystemContentPage from '@/modules/systems/content/SystemContentPage';
import DocumentationHeader from './DocumentationHeader';
import DocumentationNavItem from './DocumentationNavItem';
import { markdownPath } from './referenceLinks';
import { NotFound } from '@/platform/app/shell/App';

const guidanceExpansion = new Map<string, boolean>();

function GuidanceBranch({ label, path, active = false, defaultExpanded = false, children }: { label: string; path: string; active?: boolean; defaultExpanded?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(() => guidanceExpansion.get(path) ?? (active || defaultExpanded));
  useEffect(() => { if (active) setOpen(true); }, [active]);
  useEffect(() => { guidanceExpansion.set(path, open); }, [path, open]);
  return <Collapsible open={open} onOpenChange={setOpen}>
    <CollapsibleTrigger title={path} className="mx-1 flex h-7 w-[calc(100%-8px)] items-center gap-1.5 rounded-md px-2 text-left text-[12px] font-medium hover:bg-sidebar-foreground/5"><ChevronDown aria-hidden="true" className={'size-3.5 shrink-0 text-muted-foreground transition-transform ' + (open ? '' : '-rotate-90')} /><span className="truncate">{label}</span></CollapsibleTrigger>
    <CollapsibleContent className="space-y-0.5 pl-3">{children}</CollapsibleContent>
  </Collapsible>;
}

export default function KnowledgePage({ overview }: { overview?: ReactNode }) {
  const { owner: id, page, _splat: slug } = useParams({ strict: false }) as { owner?: string; page?: string; _splat?: string };
  const manifest = useManifest();
  const owners = [...new Map(manifest.systemContent.filter(p => p.owner && p.owner.kind !== 'system').map(p => [p.owner!.id, p.owner!])).values()];
  const owner = owners.find(o => o.id === id);
  const sections = manifest.systemContent.filter(p => p.owner?.id === id);
  const selected = sections.find(p => p.id === contentId(id ?? '', page ?? ''));
  if (!owner || (page && page !== 'reference' && !selected)) return <NotFound />;
  const ownerTree = (navOwner: typeof owners[number]) => <GuidanceBranch key={navOwner.id} label={navOwner.label} path={navOwner.root + '/'} active={id === navOwner.id}>
    {manifest.platformReferences.flatMap(g => g.references).filter(r => r.source === '/' + navOwner.root.slice(4) + '/README.md').map(r => <DocumentationNavItem key={r.source} href={markdownPath(r.source)} path={'src' + r.source} label="README.md" />)}
    {manifest.platformReferences.flatMap(g => g.references).filter(r => r.source.startsWith('/' + navOwner.root.slice(4) + '/') && !r.source.endsWith('/README.md')).map(r => <DocumentationNavItem key={r.source} href={markdownPath(r.source)} path={'src' + r.source} label={r.source.split('/').at(-1)!} />)}
    {manifest.systemContent.filter(proto => proto.owner?.id === navOwner.id && (proto.artifacts.length > 0 || selected?.id === proto.id)).map(proto => <FileTree key={proto.id} proto={proto} current={selected?.id === proto.id && slug ? findArtifact(proto, slug) : undefined} embedded fileNames branch={{ label: proto.title.toLowerCase() + '/', path: navOwner.root + '/' + proto.title.toLowerCase() + '/', active: selected?.id === proto.id, defaultExpanded: selected?.id === proto.id }} />)}
  </GuidanceBranch>;
  return <div className="flex min-h-0 flex-1">
    <SectionNav label="Documentation">
      <DocumentationHeader reference />
      <NavList>
        {owners.filter(o => o.kind === 'platform').map(navOwner => ownerTree(navOwner))}
        <GuidanceBranch defaultExpanded label="Modules" path="src/modules/" active={owner.kind === 'module'}>
          {owners.filter(o => o.kind === 'module').map(navOwner => ownerTree(navOwner))}
        </GuidanceBranch>
      </NavList>
    </SectionNav>
    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
      {overview ?? (selected ? <SystemContentPage key={selected.id + '/' + (slug ?? '')} proto={selected} slug={slug} /> : <div className="overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold">{owner.label}</h1>
          <p className="mt-3 text-muted-foreground">{owner.kind === 'platform' ? 'Shared knowledge and workflows for operating Design Studio.' : `Knowledge and workflows supplied by this ${owner.kind}.`}</p>
          {Object.entries(SYSTEM_CONTENT_SECTIONS).map(([section, spec]) => {
            const proto = sections.find(p => p.id === contentId(owner.id, section));
            const entries = proto?.artifacts.filter(a => section !== 'skills' || /^[^/]+\/SKILL\.md$/.test(a.path)) ?? [];
            return <section key={section} className="mt-8"><h2 className="text-lg font-semibold">{spec.title}</h2><p className="mt-2 text-sm text-muted-foreground">{spec.description}</p><ul className="mt-3 space-y-2">{entries.map(a => <li key={a.path}><Link to={`/documentation/context/${id}/${section}/${a.path.replace(/\.md$/, '')}` as never} className="text-sm hover:underline">{section === 'skills' ? artifactLabel(a.path.split('/')[0]) : artifactLabel(a.path)}</Link></li>)}</ul>{!entries.length && <p className="mt-3 text-sm text-muted-foreground">No {spec.title.toLowerCase()} added.</p>}</section>;
          })}
        </div>
      </div>)}
    </main>
  </div>;
}
