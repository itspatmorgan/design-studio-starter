import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useManifest } from '@/platform/app/data/useManifest';
import { contentId, SYSTEM_CONTENT_SECTIONS } from '@/platform/core/roots';
import { artifactLabel, findArtifact } from '@/platform/app/data/manifest';
import { SectionNav, NavHeader, NavList } from '@/platform/app/shell/nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/systems/studio/components/select';
import FileTree from '@/modules/prototypes/viewer/FileTree';
import SystemContentPage from '@/modules/systems/content/SystemContentPage';
import DocumentationHeader from './DocumentationHeader';
import DocumentationNavItem from './DocumentationNavItem';
import { markdownPath } from './referenceLinks';
import { NotFound } from '@/platform/app/shell/App';

export default function KnowledgePage({ overview }: { overview?: ReactNode }) {
  const { owner: id, page, _splat: slug } = useParams({ strict: false }) as { owner?: string; page?: string; _splat?: string };
  const manifest = useManifest();
  const navigate = useNavigate();
  const owners = [...new Map(manifest.systemContent.filter(p => p.owner).map(p => [p.owner!.id, p.owner!])).values()];
  const owner = owners.find(o => o.id === id);
  const sections = manifest.systemContent.filter(p => p.owner?.id === id);
  const selected = sections.find(p => p.id === contentId(id ?? '', page ?? ''));
  if (!owner || (page && page !== 'reference' && !selected)) return <NotFound />;
  return <div className="flex min-h-0 flex-1">
    <SectionNav label="Documentation">
      <DocumentationHeader reference />
      <NavHeader>
        <div className="px-1">
          <Select items={owners.map(o => ({ value: o.id, label: o.label }))} value={id} onValueChange={value => { if (value) void navigate({ to: `/documentation/context/${value}` as never }); }}>
            <SelectTrigger aria-label="Context and skills" className="w-full min-w-0"><SelectValue className="min-w-0 truncate" /></SelectTrigger>
            <SelectContent align="start">{owners.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </NavHeader>
      <NavList>
        {manifest.platformReferences.flatMap(g => g.references).filter(r => r.source === '/' + owner.root.slice(4) + '/README.md').map(r => <DocumentationNavItem key={r.source} href={`/documentation/context/${id}`} path={'src' + r.source} label="Overview" />)}
        {manifest.platformReferences.flatMap(g => g.references).filter(r => r.source.startsWith('/' + owner.root.slice(4) + '/') && !r.source.endsWith('/README.md')).map(r => <DocumentationNavItem key={r.source} href={markdownPath(r.source)} path={'src' + r.source} label={r.title} />)}
        {sections.map(proto => <FileTree key={proto.id} proto={proto} current={page && slug ? findArtifact(proto, slug) : undefined} embedded branch={{ label: proto.title, path: `${owner.root}/${proto.title.toLowerCase()}/`, active: selected?.id === proto.id, defaultExpanded: true }} />)}
        {owner.kind === 'system' && <Link to={`/systems/${id}` as never} className="block px-3 py-2 text-sm text-muted-foreground">Components and theme</Link>}
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
