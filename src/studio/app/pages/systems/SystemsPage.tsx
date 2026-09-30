import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { NavGroup, NavHeader, NavList, NavTabs, NavTitle, SectionNav, navLinkClass, navLinkStyle, navTabClass } from '@/studio/app/shell/nav';
import { NotFound } from '@/studio/app/shell/App';
import { ColorTokens, ComponentDemo, IconsPage, PageHeader, RadiusScale, TypeScale, slug } from '@/studio/app/pages/systems/foundations';
import { OtherTokens, RadiusTokens, ShadowTokens, SpacingTokens, TypographyTokens } from '@/studio/app/pages/systems/tokens';
import { ComponentDocPage } from '@/studio/app/pages/systems/ComponentDocPage';
import { ComponentEditor } from '@/studio/app/pages/systems/ComponentEditor';
import { PROTOTYPE_SYSTEMS } from '@/systems';
import { useManifest } from '@/studio/app/data/useManifest';
import type { DesignSystem } from '@/studio/app/data/types';
import type { SystemComponentDoc } from '@/studio/systemDocs';
import type { ThemeToken, TokenGroup } from '@/studio/themeTokens';
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

// Components can be edited in the app while it runs locally, in the prototype systems.
const canEdit = (system: string) => import.meta.env.DEV && Object.hasOwn(PROTOTYPE_SYSTEMS, system);

// The foundations pages: page id and name. A prototype system has a page for each kind of token
// its theme defines (themeTokens.ts); the studio system, which has no scoped theme, lists them in
// its spec. Icons come from the spec either way.
const TOKEN_PAGES: { id: string; label: string; group: TokenGroup }[] = [
  { id: 'colors', label: 'Colors', group: 'colors' },
  { id: 'typography', label: 'Typography', group: 'typography' },
  { id: 'radius', label: 'Radius', group: 'radius' },
  { id: 'shadows', label: 'Shadows', group: 'shadows' },
  { id: 'spacing', label: 'Spacing', group: 'spacing' },
  { id: 'tokens', label: 'Other tokens', group: 'other' },
];
function foundations(sys: DesignSystem, tokens: ThemeToken[] | null): [id: string, label: string][] {
  const pages: [string, string][] = tokens
    ? TOKEN_PAGES.filter((p) => tokens.some((t) => t.group === p.group) || (p.id === 'typography' && sys.typeSamples) || (p.id === 'radius' && sys.showRadius)).map((p): [string, string] => [p.id, p.label])
    : [['colors', 'Colors'], ...(sys.typeSamples ? [['typography', 'Typography']] : []), ...(sys.showRadius ? [['radius', 'Radius']] : [])] as [string, string][];
  return sys.icons ? [...pages, ['icons', 'Icons']] : pages;
}

// Sidebar groups, in order. A null id is the system's introduction. Components found in the
// system's files go under their `category` (front matter), or "Components".
function navGroups(sys: DesignSystem, components: SystemComponentDoc[], tokens: ThemeToken[] | null): NavGroup[] {
  const categories = new Map<string, [string, string][]>();
  for (const cat of sys.categories ?? []) categories.set(cat.name, cat.components.map((c): [string, string] => [slug(c.name), c.name]));
  for (const c of components) categories.set(c.category ?? 'Components', [...(categories.get(c.category ?? 'Components') ?? []), [c.slug, c.title]]);
  return [
    { items: [[null, 'Introduction'], ['theme', 'Theme']] },
    { heading: 'Foundations', items: foundations(sys, tokens) },
    ...[...categories].map(([heading, items]) => ({ heading, items })),
  ];
}

// The Systems navigation, built from the shared pieces (shell/nav/): the section's name, the
// systems as tabs, then the open system's pages under their headings.
function SystemNav({ system, components, tokens }: { system: SystemId; components: SystemComponentDoc[]; tokens: ThemeToken[] | null }) {
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
        {navGroups(SYSTEMS[system], components, tokens).map((g, i) => (
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
function SystemPage({ system, sys, components, tokens, page, onEdit }: { system: SystemId; sys: DesignSystem; components: SystemComponentDoc[]; tokens: ThemeToken[] | null; page?: string; onEdit?: () => void }) {
  const { scopeClass } = sys;
  const has = (group: TokenGroup) => Boolean(tokens?.some((t) => t.group === group));
  switch (page) {
    case undefined:
      return <><PageHeader title={`${sys.label} system`} />{sys.intro}</>;
    case 'theme':
      return <><PageHeader title="Theme" />{sys.theme}</>;
    case 'colors':
      return <><PageHeader title="Colors" description="Every color token in the theme, read live. Values follow the current mode." /><ColorTokens scopeClass={scopeClass} tokens={tokens ?? undefined} /></>;
    case 'typography':
      // A hand-made type scale (the studio system's) if the spec has one, and the theme's tokens.
      if (!sys.typeSamples && !(tokens && has('typography'))) return null;
      return (
        <>
          <PageHeader title="Typography" description={tokens ? 'The fonts, sizes, and weights the theme defines, read live.' : 'The font and the sizes and weights the components use. Values are measured live.'} />
          {sys.typeSamples && <TypeScale scopeClass={scopeClass} samples={sys.typeSamples} />}
          {tokens && has('typography') && <TypographyTokens tokens={tokens} scopeClass={scopeClass} />}
        </>
      );
    case 'radius':
      if (!sys.showRadius && !(tokens && has('radius'))) return null;
      return (
        <>
          <PageHeader title="Radius" description="How rounded the corners are, read live from the theme." />
          {tokens ? <RadiusTokens tokens={tokens} scopeClass={scopeClass} /> : <RadiusScale scopeClass={scopeClass} />}
        </>
      );
    case 'shadows':
      return tokens && has('shadows') ? <><PageHeader title="Shadows" description="The shadows the theme defines, read live." /><ShadowTokens tokens={tokens} scopeClass={scopeClass} /></> : null;
    case 'spacing':
      return tokens && has('spacing') ? <><PageHeader title="Spacing" description="The spacing values the theme defines, read live." /><SpacingTokens tokens={tokens} scopeClass={scopeClass} /></> : null;
    case 'tokens':
      return tokens && has('other') ? <><PageHeader title="Other tokens" description="Everything else the theme defines, read live." /><OtherTokens tokens={tokens} scopeClass={scopeClass} /></> : null;
    case 'icons':
      return sys.icons ? <><PageHeader title="Icons" description={`This system uses ${sys.icons.library}.`} /><IconsPage icons={sys.icons} scopeClass={scopeClass} /></> : null;
  }
  const found = components.find((c) => c.slug === page);
  if (found) return <ComponentDocPage system={system} sys={sys} component={found} onEdit={onEdit} />;
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

  const manifestSystem = useManifest().systems[system];
  const components = manifestSystem?.components ?? [];
  // The tokens its theme defines. The studio system has no scoped theme (its own is the app's), so no list.
  const tokens = manifestSystem?.tokens ?? null;
  // Editing a component's files: the editor takes the page's place.
  const [editing, setEditing] = useState(false);
  useEffect(() => { setEditing(false); }, [system, params.page]);
  const editable = canEdit(system) ? components.find((c) => c.slug === params.page) : undefined;
  const content = sys ? SystemPage({ system, sys, components, tokens, page: params.page, onEdit: editable ? () => setEditing(true) : undefined }) : null;
  if (!sys || !content) return <NotFound />;
  return (
    <div className="flex min-h-0 flex-1">
      <SystemNav system={system} components={components} tokens={tokens} />
      {editing && editable ? (
        <main className="flex min-h-0 min-w-0 flex-1 flex-col"><ComponentEditor system={system} component={editable} onDone={() => setEditing(false)} /></main>
      ) : (
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-8 py-10" data-testid={`${system}-set`}>{content}</div>
        </main>
      )}
    </div>
  );
}

