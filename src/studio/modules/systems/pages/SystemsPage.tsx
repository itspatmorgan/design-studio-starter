import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { NavGroup, NavHeader, NavList, NavTabs, NavTitle, SectionNav, navLinkClass, navLinkStyle, navTabClass } from '@/studio/app/shell/nav';
import { NotFound } from '@/studio/app/shell/App';
import { Code, ColorTokens, IconsPage, PageHeader, Prose } from '@/studio/modules/systems/pages/foundations';
import { OtherTokens, RadiusTokens, ShadowTokens, SpacingTokens, TypographyTokens } from '@/studio/modules/systems/pages/tokens';
import { ComponentDocPage } from '@/studio/modules/systems/pages/ComponentDocPage';
import { ComponentEditor } from '@/studio/modules/systems/pages/ComponentEditor';
import { useManifest } from '@/studio/app/data/useManifest';
import type { DesignSystem, SystemIntro } from '@/studio/app/data/types';
import type { SystemComponentDoc } from '@/studio/modules/systems/docs';
import type { ThemeToken, TokenGroup } from '@/studio/modules/systems/themeTokens';
import { PROTOTYPE_SYSTEMS } from '@/studio/modules/systems/data/systems';
import { studio } from '@/studio/modules/systems/pages/studioSystem';

// Systems: one tab per design system, and one page per foundation and component,
// at /systems/<system>/<page> (the system's introduction at /systems/<system>).
// Every system is treated the same, the app's own (Studio) included. What only its people can write
// comes from its spec (src/systems/<id>/intro.tsx, studioSystem.tsx): the introduction (which covers its
// theme), and icons. The rest comes from its files: a component page for each component in its components
// folder (src/studio/modules/systems/docs.ts), and a foundations page for each kind of token its theme
// defines (src/studio/modules/systems/themeTokens.ts). One tab for each prototype system in src/systems/, then Studio.
const intros = import.meta.glob<{ default: SystemIntro }>('/systems/*/intro.tsx', { eager: true });
const introOf = (id: string): SystemIntro => intros[`/systems/${id}/intro.tsx`]?.default ?? {
  intro: <Prose><p>This system has no introduction yet. Add one in <Code>src/systems/{id}/intro.tsx</Code>.</p></Prose>,
};
const PROTOTYPE_SPECS: Record<string, DesignSystem> = Object.fromEntries(Object.entries(PROTOTYPE_SYSTEMS).map(([id, spec]) => [id, {
  label: spec.label, dir: `${spec.dir}components/`, scopeClass: spec.themeClass, ...introOf(id),
}]));
const SYSTEMS: Record<string, DesignSystem> = { ...PROTOTYPE_SPECS, studio };
type SystemId = string;
type NavGroup = { heading?: string; items: [id: string | null, label: string][] };

// Components can be edited in the app while it runs locally.
const canEdit = () => import.meta.env.DEV;

// The foundations pages: page id and name, for each kind of token a theme can define.
const TOKEN_PAGES: { id: string; label: string; group: TokenGroup }[] = [
  { id: 'colors', label: 'Colors', group: 'colors' },
  { id: 'typography', label: 'Typography', group: 'typography' },
  { id: 'radius', label: 'Radius', group: 'radius' },
  { id: 'shadows', label: 'Shadows', group: 'shadows' },
  { id: 'spacing', label: 'Spacing', group: 'spacing' },
  { id: 'tokens', label: 'Other tokens', group: 'other' },
];

// Sidebar groups, in order. A null id is the system's introduction. A foundations page shows when
// the theme defines that kind of token, and Icons when the spec has them. Components found in the
// system's files go under their `category` (front matter), or "Components".
function navGroups(sys: DesignSystem, components: SystemComponentDoc[], tokens: ThemeToken[]): NavGroup[] {
  // Typography always shows: even a theme with no fonts of its own has Tailwind's type scale.
  const foundations = TOKEN_PAGES.filter((p) => p.id === 'typography' || tokens.some((t) => t.group === p.group)).map((p): [string, string] => [p.id, p.label]);
  if (sys.icons) foundations.push(['icons', 'Icons']);
  const categories = new Map<string, [string, string][]>();
  for (const c of components) categories.set(c.category ?? 'Components', [...(categories.get(c.category ?? 'Components') ?? []), [c.slug, c.title]]);
  return [
    { items: [[null, 'Introduction']] },
    { heading: 'Foundations', items: foundations },
    ...[...categories].map(([heading, items]) => ({ heading, items })),
  ];
}

// The Systems navigation, built from the shared pieces (shell/nav/): the section's name, the
// systems as tabs, then the open system's pages under their headings.
function SystemNav({ system, components, tokens }: { system: SystemId; components: SystemComponentDoc[]; tokens: ThemeToken[] }) {
  return (
    <SectionNav label="Systems">
      <NavHeader>
        <NavTitle>Systems</NavTitle>
        <NavTabs label="Design systems">
          {Object.entries(SYSTEMS).map(([id, s]) => (
            <Link key={id} to={"/systems/$system" as never} params={{ system: id } as never} aria-current={id === system ? 'page' : undefined} className={navTabClass(id === system)}>{s.label}</Link>
          ))}
        </NavTabs>
      </NavHeader>
      <NavList>
        {navGroups(SYSTEMS[system], components, tokens).map((g, i) => (
          <NavGroup key={g.heading ?? i} heading={g.heading}>
            {g.items.map(([id, label]) => (
              <Link
                key={id ?? 'intro'}
                to={(id ? '/systems/$system/$page' : '/systems/$system') as never}
                params={(id ? { system, page: id } : { system }) as never}
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
function SystemPage({ system, sys, components, tokens, origin, page, onEdit }: {
  system: SystemId; sys: DesignSystem; components: SystemComponentDoc[]; tokens: ThemeToken[]; origin: 'shadcn' | null; page?: string; onEdit?: () => void;
}) {
  const { scopeClass } = sys;
  const has = (group: TokenGroup) => tokens.some((t) => t.group === group);
  switch (page) {
    case undefined:
      return <><PageHeader title={`${sys.label} system`} />{sys.intro}</>;
    case 'colors':
      return has('colors') ? <><PageHeader title="Colors" description="Every color token in the theme. Values follow the current mode." /><ColorTokens scopeClass={scopeClass} tokens={tokens} /></> : null;
    case 'typography':
      return <><PageHeader title="Typography" description="The fonts, sizes, and weights." /><TypographyTokens tokens={tokens} scopeClass={scopeClass} /></>;
    case 'radius':
      return has('radius') ? <><PageHeader title="Radius" description="How rounded the corners are." /><RadiusTokens tokens={tokens} scopeClass={scopeClass} /></> : null;
    case 'shadows':
      return has('shadows') ? <><PageHeader title="Shadows" description="The shadows the theme defines." /><ShadowTokens tokens={tokens} scopeClass={scopeClass} /></> : null;
    case 'spacing':
      return has('spacing') ? <><PageHeader title="Spacing" description="The spacing values the theme defines." /><SpacingTokens tokens={tokens} scopeClass={scopeClass} /></> : null;
    case 'tokens':
      return has('other') ? <><PageHeader title="Other tokens" description="Everything else the theme defines." /><OtherTokens tokens={tokens} scopeClass={scopeClass} /></> : null;
    case 'icons':
      return sys.icons ? <><PageHeader title="Icons" description={`This system uses ${sys.icons.library}.`} /><IconsPage icons={sys.icons} scopeClass={scopeClass} /></> : null;
  }
  const found = components.find((c) => c.slug === page);
  return found ? <ComponentDocPage system={system} sys={sys} component={found} origin={origin} onEdit={onEdit} /> : null;
}

export default function SystemsPage() {
  // The router's types leave out the modules' routes, so say what this module's routes carry.
  const params = useParams({ strict: false }) as { system?: string; page?: string };
  const system = params.system as SystemId;
  const sys = SYSTEMS[system];
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [system, params.page]);

  const manifestSystem = useManifest().systems[system];
  const components = manifestSystem?.components ?? [];
  const tokens = manifestSystem?.tokens ?? [];
  // Editing a component's files: the editor takes the page's place.
  const [editing, setEditing] = useState(false);
  useEffect(() => { setEditing(false); }, [system, params.page]);
  const editable = canEdit() ? components.find((c) => c.slug === params.page) : undefined;
  const content = sys ? SystemPage({ system, sys, components, tokens, origin: manifestSystem?.origin ?? null, page: params.page, onEdit: editable ? () => setEditing(true) : undefined }) : null;
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
