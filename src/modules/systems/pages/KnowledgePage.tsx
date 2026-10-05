import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useManifest } from '@/platform/app/data/useManifest';
import { contentId, SYSTEM_CONTENT_SECTIONS } from '@/platform/core/roots';
import { artifactLabel, findArtifact } from '@/platform/app/data/manifest';
import { SectionNav, NavHeader, NavTitle, NavList } from '@/platform/app/shell/nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/systems/studio/components/select';
import FileTree from '@/modules/prototypes/viewer/FileTree';
import SystemContentPage from '../content/SystemContentPage';
import { NotFound } from '@/platform/app/shell/App';

export default function KnowledgePage() {
  const { owner: id, page, _splat: slug } = useParams({ strict: false }) as { owner?: string; page?: string; _splat?: string };
  const manifest = useManifest();
  const navigate = useNavigate();
  const owners = [...new Map(manifest.systemContent.filter(p => p.owner && p.owner.kind !== 'system').map(p => [p.owner!.id, p.owner!])).values()];
  const owner = owners.find(o => o.id === id);
  const sections = manifest.systemContent.filter(p => p.owner?.id === id);
  const selected = sections.find(p => p.id === contentId(id ?? '', page ?? ''));
  if (!owner || (page && !selected)) return <NotFound />;
  return <div className="flex min-h-0 flex-1">
    <SectionNav label="Platform and modules">
      <NavHeader>
        <NavTitle>Context and skills</NavTitle>
        <Select items={owners.map(o => ({ value: o.id, label: o.label }))} value={id} onValueChange={value => { if (value) void navigate({ to: `/knowledge/${value}` as never }); }}>
          <SelectTrigger aria-label="Knowledge owner"><SelectValue /></SelectTrigger>
          <SelectContent>{owners.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent>
        </Select>
      </NavHeader>
      <NavList>
        <Link to={`/knowledge/${id}` as never} className="block px-3 py-2 text-sm">Overview</Link>
        {sections.map(proto => <FileTree key={proto.id} proto={proto} current={page && slug ? findArtifact(proto, slug) : undefined} embedded branch={{ label: proto.title, path: `${owner.root}/${proto.title.toLowerCase()}/`, active: selected?.id === proto.id }} />)}
        <Link to={'/systems' as never} className="block px-3 py-2 text-sm text-muted-foreground">Design systems</Link>
      </NavList>
    </SectionNav>
    <main className="flex min-h-0 min-w-0 flex-1 flex-col">
      {selected ? <SystemContentPage key={selected.id + '/' + (slug ?? '')} proto={selected} slug={slug} /> : <div className="overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold">{owner.label}</h1>
          <p className="mt-3 text-muted-foreground">{owner.kind === 'platform' ? 'Shared knowledge and workflows for operating Design Studio.' : 'Knowledge and workflows supplied by this module.'}</p>
          {Object.entries(SYSTEM_CONTENT_SECTIONS).map(([section, spec]) => {
            const proto = sections.find(p => p.id === contentId(owner.id, section));
            const entries = proto?.artifacts.filter(a => section !== 'skills' || /^[^/]+\/SKILL\.md$/.test(a.path)) ?? [];
            return <section key={section} className="mt-8"><h2 className="text-lg font-semibold">{spec.title}</h2><p className="mt-2 text-sm text-muted-foreground">{spec.description}</p><ul className="mt-3 space-y-2">{entries.map(a => <li key={a.path}><Link to={`/knowledge/${id}/${section}/${a.path.replace(/\.md$/, '')}` as never} className="text-sm hover:underline">{section === 'skills' ? artifactLabel(a.path.split('/')[0]) : artifactLabel(a.path)}</Link></li>)}</ul>{!entries.length && <p className="mt-3 text-sm text-muted-foreground">No {spec.title.toLowerCase()} added.</p>}</section>;
          })}
        </div>
      </div>}
    </main>
  </div>;
}
