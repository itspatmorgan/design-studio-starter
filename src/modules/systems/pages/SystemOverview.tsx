import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { useManifest } from '@/platform/app/data/useManifest';
import { prototypeLink } from '@/platform/app/data/manifest';
import { contentId } from '@/platform/core/roots';
import { ThemeScope } from '../ThemeScope';
import { SYSTEM_SPECS, PLATFORM_ID } from '../data/systems';
import { isSkillFile } from '../content/rules';
import type { DesignSystem } from '@/platform/app/data/types';
import type { SystemComponentDoc } from '../docs';
import type { ThemeToken } from '../themeTokens';
import { ColorModeSupport, PageHeader } from './foundations';

export default function SystemOverview({ system, sys, components, tokens }: {
  system: string; sys: DesignSystem; components: SystemComponentDoc[]; tokens: ThemeToken[];
}) {
  const manifest = useManifest();
  const platform = system === PLATFORM_ID;
  const spec = SYSTEM_SPECS[system];
  const guidance = [
    { id: 'context', label: 'context documents' },
    { id: 'rules', label: 'rules' },
    { id: 'skills', label: 'skills' },
  ].map(section => {
    const proto = manifest.systemContent.find(proto => proto.id === contentId(system, section.id));
    const artifacts = proto?.artifacts.filter(artifact => section.id !== 'skills' || isSkillFile('skills', artifact.path)) ?? [];
    return { ...section, proto, artifacts };
  });
  const prototypes = manifest.prototypes.filter(proto => proto.system === system && proto.status !== 'archived');
  const sectionHeading = 'mb-3 text-lg font-semibold tracking-tight';
  const guidanceCount = guidance.reduce((count, section) => count + section.artifacts.length, 0);

  return <>
    <PageHeader title={`${sys.label} system`} description={sys.summary ?? `The guidance and code included in ${sys.label}.`} />
    <div className="mb-8 space-y-2 text-[13px] text-muted-foreground">
      <p className="font-medium text-foreground">{platform ? 'Required application system' : 'Prototype system'}</p>
      <ColorModeSupport modes={spec.colorModes} />
    </div>

    <div className="mb-8 divide-y divide-border border-y border-border">
      <section className="py-6" aria-labelledby="system-guidance">
        <h2 id="system-guidance" className={sectionHeading}>Guidance</h2>
        {sys.overview?.guidance ? <p className="text-sm leading-6 text-muted-foreground">{sys.overview.guidance}</p> : !guidanceCount && <p className="text-sm leading-6 text-muted-foreground">No system guidance has been added yet.</p>}
        <p className="mt-3 text-xs text-muted-foreground">{guidance.map(section => section.artifacts.length + ' ' + section.label).join(' · ')}</p>
      </section>
      <section className="py-6" aria-labelledby="system-code">
        <h2 id="system-code" className={sectionHeading}>Code</h2>
        {sys.overview?.code && <p className="text-sm leading-6 text-muted-foreground">{sys.overview.code}</p>}
        <p className="mt-3 text-xs text-muted-foreground">{components.length} components · {new Set(tokens.map(token => token.name)).size} theme tokens</p>
      </section>
    </div>

    <section className="mb-8" aria-labelledby="system-usage">
      <h2 id="system-usage" className={sectionHeading}>Where it’s used</h2>
      {platform ? <p className="text-sm leading-6 text-muted-foreground">Studio’s navigation, menus, editors, and documentation use this system. It is maintained with platform releases and is unavailable as a prototype system.</p> : prototypes.length ? <ul className="divide-y divide-border rounded-lg border border-border">{prototypes.map(proto => <li key={proto.contributorKey + '/' + proto.id}><Link {...prototypeLink(proto)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted"><span className="flex-1">{proto.title}</span><span className="text-[12px] text-muted-foreground">{proto.contributor}</span><ArrowUpRight aria-hidden className="size-3.5" /></Link></li>)}</ul> : <p className="text-sm text-muted-foreground">No active prototypes use this system yet. Choose {sys.label} when creating a prototype.</p>}
    </section>

    <details className="border-t border-border pt-5">
      <summary className="cursor-pointer text-sm font-semibold">Working with this system</summary>
      <ThemeScope themeClass={sys.scopeClass} className="mt-4 rounded-lg border border-border bg-background p-5 text-foreground">{sys.intro}</ThemeScope>
    </details>
  </>;
}
