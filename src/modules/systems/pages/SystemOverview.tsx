import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Blocks, NotebookText, ListChecks, WandSparkles, Palette } from 'lucide-react';
import { useManifest } from '@/platform/app/data/useManifest';
import { artifactLabel, artifactLink, prototypeLink } from '@/platform/app/data/manifest';
import { contentId } from '@/platform/core/roots';
import { ThemeScope } from '../ThemeScope';
import { SYSTEM_SPECS, PLATFORM_ID } from '../data/systems';
import { isSkillFile } from '../content/rules';
import type { DesignSystem } from '@/platform/app/data/types';
import type { SystemComponentDoc } from '../docs';
import type { ThemeToken } from '../themeTokens';
import { ColorModeSupport, PageHeader } from './foundations';

export default function SystemOverview({ system, sys, components, tokens, foundations }: {
  system: string; sys: DesignSystem; components: SystemComponentDoc[]; tokens: ThemeToken[]; foundations: { id: string; label: string }[];
}) {
  const manifest = useManifest();
  const platform = system === PLATFORM_ID;
  const spec = SYSTEM_SPECS[system];
  const base = '/systems/' + system;
  const guidance = [
    { id: 'context', label: 'Context', icon: NotebookText },
    { id: 'rules', label: 'Rules', icon: ListChecks },
    { id: 'skills', label: 'Skills', icon: WandSparkles },
  ].map(section => {
    const proto = manifest.systemContent.find(proto => proto.id === contentId(system, section.id));
    const artifacts = proto?.artifacts.filter(artifact => section.id !== 'skills' || isSkillFile('skills', artifact.path)) ?? [];
    return { ...section, proto, artifacts };
  });
  const prototypes = manifest.prototypes.filter(proto => proto.system === system && proto.status !== 'archived');
  const sectionHeading = 'mb-3 text-lg font-semibold tracking-tight';
  const cardClass = 'flex min-w-0 flex-col rounded-lg border border-border bg-card p-4';

  return <>
    <PageHeader title={`${sys.label} system`} description={sys.summary ?? `Resources and guidance for work using ${sys.label}.`} />
    <div className="mb-8 space-y-2 text-[13px] text-muted-foreground">
      <p className="font-medium text-foreground">{platform ? 'Required application system' : 'Prototype system'}</p>
      <ColorModeSupport modes={spec.colorModes} />
    </div>

    <section className="mb-8" aria-labelledby="system-resources">
      <h2 id="system-resources" className={sectionHeading}>Available resources</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {guidance.map(section => <div key={section.id} className={cardClass}>
          <div className="mb-2 flex items-center gap-2"><section.icon aria-hidden className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">{section.label}</h3><span className="ml-auto text-[12px] text-muted-foreground">{section.artifacts.length}</span></div>
          {section.artifacts.length ? <ul className="space-y-1 text-[13px]">{section.artifacts.slice(0, 3).map(artifact => <li key={artifact.path}><Link {...artifactLink(section.proto!, artifact)} className="hover:underline">{artifactLabel(artifact.path, section.proto)}</Link></li>)}</ul> : <p className="text-[13px] text-muted-foreground">No {section.label.toLowerCase()} yet. Use New in this section to add useful material.</p>}
        </div>)}
        <div className={cardClass}>
          <div className="mb-2 flex items-center gap-2"><Palette aria-hidden className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Theme</h3><span className="ml-auto text-[12px] text-muted-foreground">{new Set(tokens.map(token => token.name)).size} tokens</span></div>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">{foundations.map(page => <li key={page.id}><Link to={(base + '/' + page.id) as never} className="hover:underline">{page.label}</Link></li>)}{sys.icons && <li><Link to={(base + '/icons') as never} className="hover:underline">Icons</Link></li>}</ul>
        </div>
        <div className={cardClass + ' sm:col-span-2'}>
          <div className="mb-2 flex items-center gap-2"><Blocks aria-hidden className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Components</h3><span className="ml-auto text-[12px] text-muted-foreground">{components.length}</span></div>
          {components.length ? <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">{components.slice(0, 5).map(component => <li key={component.slug}><Link to={(base + '/' + component.slug) as never} className="hover:underline">{component.title}</Link></li>)}</ul> : <p className="text-[13px] text-muted-foreground">No components yet. Ask your agent to import or build your toolkit.</p>}
          <p className="mt-auto pt-4 text-[12px] text-muted-foreground">Browse the full collection in navigation.</p>
        </div>
      </div>
    </section>

    <section className="mb-8" aria-labelledby="system-usage">
      <h2 id="system-usage" className={sectionHeading}>Where it’s used</h2>
      {platform ? <p className="text-sm leading-6 text-muted-foreground">Studio’s navigation, menus, editors, and documentation use this system. It is maintained with platform releases and is unavailable as a prototype system.</p> : prototypes.length ? <ul className="divide-y divide-border rounded-lg border border-border">{prototypes.map(proto => <li key={proto.contributorKey + '/' + proto.id}><Link {...prototypeLink(proto)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted"><span className="flex-1">{proto.title}</span><span className="text-[12px] text-muted-foreground">{proto.contributor}</span><ArrowUpRight aria-hidden className="size-3.5" /></Link></li>)}</ul> : <p className="text-sm text-muted-foreground">No active prototypes use this system yet. Choose {sys.label} when creating a prototype.</p>}
    </section>

    <section aria-labelledby="system-working">
      <h2 id="system-working" className={sectionHeading}>Working with this system</h2>
      <ThemeScope themeClass={sys.scopeClass} className="rounded-lg border border-border bg-background p-5 text-foreground">{sys.intro}</ThemeScope>
    </section>
  </>;
}
