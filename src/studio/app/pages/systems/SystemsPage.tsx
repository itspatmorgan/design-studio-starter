import { useEffect, useRef } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { NavGroup, NavHeader, NavList, NavTabs, NavTitle, SectionNav, navLinkClass, navLinkStyle, navTabClass } from '@/studio/app/shell/nav';
import { NotFound } from '@/studio/app/shell/App';
import { ColorTokens, ComponentDemo, IconsPage, PageHeader, RadiusScale, TypeScale, slug } from '@/studio/app/pages/systems/foundations';
import { ComponentDocPage } from '@/studio/app/pages/systems/ComponentDocPage';
import { useManifest } from '@/studio/app/data/useManifest';
import type { DesignSystem } from '@/studio/app/data/types';
import type { SystemComponentDoc } from '@/studio/systemDocs';
import type { PrototypeSystemId } from '@/systems';
import { product } from '@/studio/app/pages/systems/productSystem';
import { studio } from '@/studio/app/pages/systems/studioSystem';

// Systems: one tab per design system, and one page per foundation and component,
// at /systems/<system>/<page> (the system's introduction at /systems/<system>).
// The introduction, theme, and foundations come from each system's spec (productSystem.tsx,
// studioSystem.tsx). A prototype system's component pages come from its files: adding a component
// to src/systems/<system>/components/ adds its page (src/studio/systemDocs.ts). The studio system
// lists its components in its spec. Optional pages show only when the system defines them.
// One spec per system in src/systems/index.ts (a type error if one is missing), then Studio.
const PROTOTYPE_SPECS: Record<PrototypeSystemId, DesignSystem> = { product };
const SYSTEMS: Record<string, DesignSystem> = { ...PROTOTYPE_SPECS, studio };
type SystemId = string;
type NavGroup = { heading?: string; items: [id: string | null, label: string][] };

// Sidebar groups, in order. A null id is the system's introduction. Components found in the
// system's files go under their `category` (front matter), or "Components".
function navGroups(sys: DesignSystem, components: SystemComponentDoc[]): NavGroup[] {
  const categories = new Map<string, [string, string][]>();
  for (const cat of sys.categories ?? []) categories.set(cat.name, cat.components.map((c): [string, string] => [slug(c.name), c.name]));
  for (const c of components) categories.set(c.category ?? 'Components', [...(categories.get(c.category ?? 'Components') ?? []), [c.slug, c.title]]);
  return [
    { items: [[null, 'Introduction'], ['theme', 'Theme']] },
    { heading: 'Foundations', items: [
      ['colors', 'Colors'],
      sys.typeSamples && ['typography', 'Typography'],
      sys.showRadius && ['radius', 'Radius'],
      sys.icons && ['icons', 'Icons'],
    ].filter((item): item is [string, string] => Boolean(item)) },
    ...[...categories].map(([heading, items]) => ({ heading, items })),
  ];
}

// The Systems navigation, built from the shared pieces (shell/nav/): the section's name, the
// systems as tabs, then the open system's pages under their headings.
function SystemNav({ system, components }: { system: SystemId; components: SystemComponentDoc[] }) {
  return (
    <SectionNav label="Systems">
      <NavHeader>
        <NavTitle>Systems</NavTitle>
        <NavTabs label="Design systems">
          {Object.entries(SYSTEMS).map(([id, s]) => (
            <Link key={id} to="/systems/$system" params={{ system: id }} aria-current={id === system ? 'page' : undefined} className={navTabClass(id === system)}>{s.label}</Link>
          ))}
        </NavTabs>
      </NavHeader>
      <NavList>
        {navGroups(SYSTEMS[system], components).map((g, i) => (
          <NavGroup key={g.heading ?? i} heading={g.heading}>
            {g.items.map(([id, label]) => (
              <Link
                key={id ?? 'intro'}
                {...(id ? { to: '/systems/$system/$page', params: { system, page: id } } : { to: '/systems/$system', params: { system } })}
                activeOptions={{ exact: true }}
                style={navLinkStyle}
                className={navLinkClass}
              >
                {label}
              </Link>
            ))}
          </NavGroup>
        ))}
      </NavList>
    </SectionNav>
  );
}

// One page of a system, or null if the system doesn't have it.
function SystemPage({ system, sys, components, page }: { system: SystemId; sys: DesignSystem; components: SystemComponentDoc[]; page?: string }) {
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
  const found = components.find((c) => c.slug === page);
  if (found) return <ComponentDocPage system={system} sys={sys} component={found} />;
  const component = (sys.categories ?? []).flatMap((c) => c.components).find((c) => slug(c.name) === page);
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

  const components = useManifest().systems[system]?.components ?? [];
  const content = sys ? SystemPage({ system, sys, components, page: params.page }) : null;
  if (!sys || !content) return <NotFound />;
  return (
    <div className="flex min-h-0 flex-1">
      <SystemNav system={system} components={components} />
      <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-8 py-10" data-testid={`${system}-set`}>{content}</div>
      </main>
    </div>
  );
}

