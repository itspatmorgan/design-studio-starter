import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/studio/components/tabs';
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

function SystemNav({ system }: { system: SystemId }) {
  const navigate = useNavigate();
  return (
    <nav aria-label="Systems" className="flex min-h-0 w-52 shrink-0 flex-col border-r border-border bg-muted/40">
      <Tabs value={system} onValueChange={(id) => navigate({ to: '/systems/$system', params: { system: id as string } })} className="border-b border-border p-3">
        <TabsList className="w-full">
          {Object.entries(SYSTEMS).map(([id, s]) => (
            <TabsTrigger key={id} value={id}>{s.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        {navGroups(SYSTEMS[system]).map((g, i) => (
          <div key={g.heading ?? i}>
            {g.heading && <p className="mt-5 mb-2 px-2.5 text-sm font-semibold text-foreground">{g.heading}</p>}
            {g.items.map(([id, label]) => (
              <Link
                key={id ?? 'intro'}
                {...(id ? { to: '/systems/$system/$page', params: { system, page: id } } : { to: '/systems/$system', params: { system } })}
                activeOptions={{ exact: true }}
                className={cn(
                  'block rounded-md px-2.5 py-1.5 text-sm text-foreground/80 transition-colors',
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

