import { useEffect, useRef } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { navTabClass } from '@/studio/app/shell/nav';
import { NotFound } from '@/studio/app/shell/App';
import { ColorTokens, ComponentDemo, IconsPage, PageHeader, RadiusScale, TypeScale, slug } from '@/studio/app/pages/systems/foundations';
import type { DesignSystem } from '@/studio/app/data/types';
import type { PrototypeSystemId } from '@/systems';
import { product } from '@/studio/app/pages/systems/productSystem';
import { studio } from '@/studio/app/pages/systems/studioSystem';

// Systems: one tab per design system, and one page per foundation and component,
// at /systems/<system>/<page> (the system's introduction at /systems/<system>).
// Pages come from each system's spec (productSystem.tsx, studioSystem.tsx), so adding
// a component there adds its page. Optional pages show only when the system defines them.
// One spec per system in src/systems/index.ts (a type error if one is missing), then Studio.
const PROTOTYPE_SPECS: Record<PrototypeSystemId, DesignSystem> = { product };
const SYSTEMS: Record<string, DesignSystem> = { ...PROTOTYPE_SPECS, studio };
type SystemId = string;
type NavGroup = { heading?: string; items: [id: string | null, label: string][] };

// Sidebar groups, in order. A null id is the system's introduction.
function navGroups(sys: DesignSystem): NavGroup[] {
  return [
    { items: [[null, 'Introduction'], ['theme', 'Theme']] },
    { heading: 'Foundations', items: [
      ['colors', 'Colors'],
      sys.typeSamples && ['typography', 'Typography'],
      sys.showRadius && ['radius', 'Radius'],
      sys.icons && ['icons', 'Icons'],
    ].filter((item): item is [string, string] => Boolean(item)) },
    ...sys.categories.map((cat) => ({ heading: cat.name, items: cat.components.map((c): [string, string] => [slug(c.name), c.name]) })),
  ];
}

// The Systems navigation, in the Handbook's style: the section's name, the systems as tabs, then
// the open system's pages.
function SystemNav({ system }: { system: SystemId }) {
  const row = 'mx-1 block rounded-md px-2.5 py-1 text-[12px] leading-tight text-sidebar-foreground/80 transition-colors';
  return (
    <nav aria-label="Systems" className="flex min-h-0 w-52 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 px-2 pt-3">
        <div className="flex min-h-8 items-center px-2.5">
          <h2 className="truncate text-sm font-semibold leading-tight">Systems</h2>
        </div>
        <div className="mt-1 flex gap-1 px-1" role="tablist" aria-label="Design systems">
          {Object.entries(SYSTEMS).map(([id, s]) => (
            <Link key={id} to="/systems/$system" params={{ system: id }} role="tab" aria-selected={id === system} className={navTabClass(id === system)}>{s.label}</Link>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pt-3 pb-3">
        {navGroups(SYSTEMS[system]).map((g, i) => (
          <div key={g.heading ?? i} className="space-y-0.5">
            {g.heading && <p className="mt-4 px-2.5 py-1 text-[12px] font-semibold leading-none text-sidebar-foreground">{g.heading}</p>}
            {g.items.map(([id, label]) => (
              <Link
                key={id ?? 'intro'}
                {...(id ? { to: '/systems/$system/$page', params: { system, page: id } } : { to: '/systems/$system', params: { system } })}
                activeOptions={{ exact: true }}
                className={cn(
                  row,
                  'hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground',
                  'data-[status=active]:bg-sidebar-foreground/10 data-[status=active]:font-medium data-[status=active]:text-sidebar-accent-foreground',
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}

// One page of a system, or null if the system doesn't have it.
function SystemPage({ sys, page }: { sys: DesignSystem; page?: string }) {
  const { scopeClass } = sys;
  switch (page) {
    case undefined:
      return <><PageHeader title={`${sys.label} system`} />{sys.intro}</>;
    case 'theme':
      return <><PageHeader title="Theme" />{sys.theme}</>;
    case 'colors':
      return <><PageHeader title="Colors" description="Every semantic token, read live from the theme. Values follow the current mode." /><ColorTokens scopeClass={scopeClass} /></>;
    case 'typography':
      return sys.typeSamples ? <><PageHeader title="Typography" description="The font and the sizes and weights the components use. Values are measured live." /><TypeScale scopeClass={scopeClass} samples={sys.typeSamples} /></> : null;
    case 'radius':
      return sys.showRadius ? <><PageHeader title="Radius" description="Tailwind radius classes, measured live from the theme." /><RadiusScale scopeClass={scopeClass} /></> : null;
    case 'icons':
      return sys.icons ? <><PageHeader title="Icons" description={`This system uses ${sys.icons.library}.`} /><IconsPage icons={sys.icons} scopeClass={scopeClass} /></> : null;
  }
  const component = sys.categories.flatMap((c) => c.components).find((c) => slug(c.name) === page);
  if (!component) return null;
  return (
    <>
      <PageHeader title={component.name} description={component.description} />
      <ComponentDemo component={component} themeClass={scopeClass} dir={sys.dir} />
    </>
  );
}

export default function SystemsPage() {
  const params = useParams({ strict: false });
  const system = params.system as SystemId;
  const sys = SYSTEMS[system];
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [system, params.page]);

  const content = sys ? SystemPage({ sys, page: params.page }) : null;
  if (!sys || !content) return <NotFound />;
  return (
    <div className="flex min-h-0 flex-1">
      <SystemNav system={system} />
      <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-8 py-10" data-testid={`${system}-set`}>{content}</div>
      </main>
    </div>
  );
}

