import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { useManifest } from '@/platform/app/data/useManifest';
import { systemUsage } from '@/platform/app/data/manifest';
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
    { id: 'context', label: 'Context documents' },
    { id: 'rules', label: 'Rules' },
    { id: 'skills', label: 'Skills' },
  ].map(section => {
    const proto = manifest.systemContent.find(proto => proto.id === contentId(system, section.id));
    const artifacts = proto?.artifacts.filter(artifact => section.id !== 'skills' || isSkillFile('skills', artifact.path)) ?? [];
    return { ...section, proto, artifacts };
  });
  const usage = systemUsage(manifest.prototypes, system);
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
        <h2 id="system-guidance" className={sectionHeading}>Instructions</h2>
        <Metrics items={guidance.map(section => ({ label: section.label, count: section.artifacts.length }))} />
        {sys.overview?.guidance ? <p className="text-sm leading-6 text-muted-foreground">{sys.overview.guidance}</p> : !guidanceCount && <p className="text-sm leading-6 text-muted-foreground">No system instructions have been added yet.</p>}
      </section>
      <section className="py-6" aria-labelledby="system-code">
        <h2 id="system-code" className={sectionHeading}>Code</h2>
        <Metrics items={[{ label: 'Components', count: components.length }, { label: 'Theme tokens', count: new Set(tokens.map(token => token.name)).size }]} />
        {sys.overview?.code && <p className="text-sm leading-6 text-muted-foreground">{sys.overview.code}</p>}
      </section>
    </div>

    <section className="mb-8" aria-labelledby="system-usage">
      <h2 id="system-usage" className={sectionHeading}>Where it’s used</h2>
      {platform ? <p className="text-sm leading-6 text-muted-foreground">Studio’s navigation, menus, editors, and documentation use this system. It is maintained with platform releases and is unavailable as a prototype system.</p> : usage.count ? <>
        <Metrics items={[{ label: 'Active prototypes', count: usage.count }]} />
        <ul className="divide-y divide-border rounded-lg border border-border">{usage.recent.map(proto => <li key={proto.contributorKey + '/' + proto.id}><Link {...prototypeLink(proto)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted"><span className="min-w-0 flex-1 truncate">{proto.title}</span><span className="max-w-36 truncate text-[12px] text-muted-foreground">{proto.contributor}</span><ArrowUpRight aria-hidden className="size-3.5" /></Link></li>)}</ul>
        <Link to={'/prototypes' as never} search={{ system } as never} className="mt-3 inline-flex items-center gap-1 text-sm hover:underline">View all prototypes<ArrowUpRight aria-hidden className="size-3.5" /></Link>
      </> : <p className="text-sm text-muted-foreground">No active prototypes use this system yet. Choose {sys.label} when creating a prototype.</p>}
    </section>

    <details className="border-t border-border pt-5">
      <summary className="cursor-pointer text-sm font-semibold">Working with this system</summary>
      <ThemeScope themeClass={sys.scopeClass} className="mt-4 rounded-lg border border-border bg-background p-5 text-foreground">{sys.intro}</ThemeScope>
    </details>
  </>;
}

function Metrics({ items }: { items: { label: string; count: number }[] }) {
  return <dl className="mb-4 flex flex-wrap gap-x-8 gap-y-4">
    {items.map(item => <div key={item.label} className="flex flex-col gap-1">
      <dt className="order-2 text-xs text-muted-foreground">{item.label}</dt>
      <dd className="text-3xl font-semibold tracking-tight tabular-nums">{item.count}</dd>
    </div>)}
  </dl>;
}
