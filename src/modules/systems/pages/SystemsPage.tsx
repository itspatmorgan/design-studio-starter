import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { ChevronDown, FileCode, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/systems/studio/components/collapsible';
import FileTree from '@/modules/prototypes/viewer/FileTree';
import { contentId, SYSTEM_CONTENT_SECTIONS } from '@/platform/core/roots';
import { findArtifact } from '@/platform/app/data/manifest';
import SystemContentPage from '../content/SystemContentPage';
import type { Prototype } from '@/platform/app/data/types';
import { NavHeader, NavList, NavTitle, SectionNav } from '@/platform/app/shell/nav';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/systems/studio/components/select';
import { NotFound } from '@/platform/app/shell/App';
import { Code, ColorModeSupport, ColorTokens, IconsPage, PageHeader, Prose } from '@/modules/systems/pages/foundations';
import { OtherTokens, RadiusTokens, ShadowTokens, SpacingTokens, TypographyTokens } from '@/modules/systems/pages/tokens';
import { ComponentDocPage } from '@/modules/systems/pages/ComponentDocPage';
import { useManifest } from '@/platform/app/data/useManifest';
import type { DesignSystem, SystemIntro } from '@/platform/app/data/types';
import type { SystemComponentDoc } from '@/modules/systems/docs';
import type { ThemeToken, TokenGroup } from '@/modules/systems/themeTokens';
import { ThemeScope } from '@/modules/systems/ThemeScope';
import { DEFAULT_SYSTEM, PROTOTYPE_SYSTEMS, SYSTEM_SPECS } from '@/modules/systems/data/systems';
import { useSourceView } from '@/platform/core/source/useSourceView';
import FileNavItem from '@/platform/app/shell/FileNavItem';
import { sourceOf } from '../sources';
import { PLATFORM_ID, PLATFORM_SOURCE } from '../data/systems';
import { systemSourceRequest } from './systemSource';

const ComponentEditor = import.meta.env.DEV ? lazy(() => import('./ComponentEditor').then((module) => ({ default: module.ComponentEditor }))) : null;

const SystemSourceEditor = import.meta.env.DEV ? lazy(() => import('./SystemSourceEditor')) : null;

// Systems: a selector for design systems, and one page per foundation and component,
// at /systems/<system>/<page> (the system's introduction at /systems/<system>).
// Every system is treated the same, the app's own (Studio) included. What only its people can write
// comes from its spec (src/systems/<id>/intro.tsx): the introduction (which covers its
// theme), and icons. The rest comes from its files: a component page for each component in its components
// folder (src/modules/systems/docs.ts), and a foundations page for each kind of token its theme
// defines (src/modules/systems/themeTokens.ts). Prototype systems appear in the selector, followed by Studio.
const intros = import.meta.glob<{ default: SystemIntro }>('/systems/*/intro.tsx', { eager: true });
const introOf = (id: string): SystemIntro => intros[`/systems/${id}/intro.tsx`]?.default ?? {
  intro: <><Prose><p>This system has no introduction yet. Add one in <Code>src/systems/{id}/intro.tsx</Code>.</p></Prose><h2 className="mt-10 mb-3 text-lg font-semibold tracking-tight text-foreground">Theme</h2><Prose><ColorModeSupport modes={SYSTEM_SPECS[id].colorModes} /></Prose></>,
};
const PROTOTYPE_SPECS: Record<string, DesignSystem> = Object.fromEntries(Object.entries(SYSTEM_SPECS).map(([id, spec]) => [id, {
  label: spec.label, dir: `${spec.dir}components/`, scopeClass: spec.themeClass, ...introOf(id),
}]));
const SYSTEMS: Record<string, DesignSystem> = PROTOTYPE_SPECS;
const platform = SYSTEMS[PLATFORM_ID];
const SYSTEM_CHOICES = [
  ...Object.entries(PROTOTYPE_SPECS).filter(([id]) => id !== PLATFORM_ID).sort(([a], [b]) => a === DEFAULT_SYSTEM ? -1 : b === DEFAULT_SYSTEM ? 1 : a.localeCompare(b)),
  [PLATFORM_ID, platform] as const,
].map(([value, spec]) => ({ value, label: spec.label }));
type SystemId = string;


// Map a rendered Systems page to its actual source files.
function sourcePath(system: string, page: string | undefined, components: SystemComponentDoc[]) {
  const source = system === PLATFORM_ID ? PLATFORM_SOURCE : sourceOf(system, PROTOTYPE_SYSTEMS[system]);
  if (!page || page === 'icons') return intros['/systems/' + system + '/intro.tsx'] ? source.dir + 'intro.tsx' : source.dir + 'system.ts';
  const component = components.find((c) => c.slug === page);
  if (component) {
    const file = component.files.doc ?? component.files.examples ?? component.files.source;
    return file ? source.components + '/' + file : null;
  }
  return source.theme;
}

// The foundations pages: page id and name, for each kind of token a theme can define.
const TOKEN_PAGES: { id: string; label: string; group: TokenGroup }[] = [
  { id: 'colors', label: 'Colors', group: 'colors' },
  { id: 'typography', label: 'Typography', group: 'typography' },
  { id: 'radius', label: 'Radius', group: 'radius' },
  { id: 'shadows', label: 'Shadows', group: 'shadows' },
  { id: 'spacing', label: 'Spacing', group: 'spacing' },
  { id: 'motion', label: 'Motion', group: 'motion' },
  { id: 'effects', label: 'Effects', group: 'effects' },
  { id: 'tokens', label: 'Other tokens', group: 'other' },
];

// A fixed system folder and its readable contents. Page changes preserve branch state.
function SystemBranch({ label, path, active, children }: { label: string; path: string; active: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(active);
  useEffect(() => { if (active) setOpen(true); }, [active]);
  return <Collapsible open={open} onOpenChange={setOpen}>
    <CollapsibleTrigger title={path} className="mx-1 flex h-7 w-[calc(100%-8px)] items-center gap-1.5 rounded-md px-2 text-left text-[12px] font-medium leading-tight hover:bg-sidebar-foreground/5"><ChevronDown className={'size-3.5 shrink-0 text-muted-foreground transition-transform ' + (open ? '' : '-rotate-90')} />{label}</CollapsibleTrigger>
    <CollapsibleContent className="space-y-0.5 pl-4">{children}</CollapsibleContent>
  </Collapsible>;
}

// The Systems navigation, built from the shared pieces (shell/nav/): the section's name, the
// system selector, then the open system's pages under their headings.
function SystemNav({ system, components, tokens, page }: { system: SystemId; components: SystemComponentDoc[]; tokens: ThemeToken[]; page?: string }) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { _splat?: string };
  const manifest = useManifest();
  const source = system === PLATFORM_ID ? PLATFORM_SOURCE : sourceOf(system, PROTOTYPE_SYSTEMS[system]);
  const foundations = TOKEN_PAGES.filter((p) => p.id === 'typography' || tokens.some((t) => t.group === p.group));
  const file = (id: string | undefined, label: string) => {
    const path = sourcePath(system, id, components);
    return path && <FileNavItem key={id ?? 'intro'} href={'/systems/' + system + (id ? '/' + id : '')} path={path} label={label} className={id ? undefined : 'h-7'} icon={id && components.some((c) => c.slug === id) ? <FileCode className="size-3.5 shrink-0 text-muted-foreground" /> : <FileText className="size-3.5 shrink-0 text-muted-foreground" />} reveal={() => systemSourceRequest('reveal', path)} />;
  };
  return (
    <SectionNav label="Systems">
      <NavHeader>
        <NavTitle>Systems</NavTitle>
        <div className="mt-2 px-1">
          <Select items={SYSTEM_CHOICES} value={system} onValueChange={(value) => {
            if (value && value !== system) void navigate({ to: '/systems/$system' as never, params: { system: value } as never });
          }}>
            <SelectTrigger aria-label="System" className="w-full min-w-0">
              <SelectValue className="min-w-0 truncate" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectLabel>Prototype systems</SelectLabel>
                {SYSTEM_CHOICES.filter((choice) => choice.value !== PLATFORM_ID).map((choice) => (
                  <SelectItem key={choice.value} value={choice.value}>{choice.label}</SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Studio</SelectLabel>
                <SelectItem value={PLATFORM_ID}>{platform.label}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </NavHeader>
      <NavList>
        {file(undefined, 'Introduction')}
        <SystemBranch label="Theme" path={source.theme} active={foundations.some((p) => p.id === page) || page === 'icons'}>
          {foundations.map((p) => file(p.id, p.label))}
          {SYSTEMS[system].icons && file('icons', 'Icons')}
        </SystemBranch>
        <SystemBranch label="Components" path={source.components} active={components.some((c) => c.slug === page)}>
          {components.map((c) => file(c.slug, c.title))}
          {!components.length && <p className="px-3 py-1 text-[12px] text-muted-foreground">Empty folder</p>}
        </SystemBranch>
        {Object.entries(SYSTEM_CONTENT_SECTIONS).map(([id, section]) => {
          const proto = manifest.systemContent.find((p) => p.id === contentId(system, id));
          return proto && <FileTree key={proto.id} proto={proto} current={page === id && params._splat ? findArtifact(proto, params._splat) : undefined} embedded branch={{ label: section.title, path: source.dir + id + '/', active: page === id }} />;
        })}
      </NavList>
    </SectionNav>
  );
}

// One page of a system, or null if the system doesn't have it.
function SystemPage({ system, sys, components, tokens, origin, page }: {
  system: SystemId; sys: DesignSystem; components: SystemComponentDoc[]; tokens: ThemeToken[]; origin: 'shadcn' | null; page?: string;
}) {
  const has = (group: TokenGroup) => tokens.some((t) => t.group === group);
  switch (page) {
    case undefined:
      return <><PageHeader title={`${sys.label} system`} />{sys.intro}</>;
    case 'colors':
      return has('colors') ? <><PageHeader title="Colors" description="Every color token in the theme. Values reflect this system's active mode." /><ColorTokens tokens={tokens} /></> : null;
    case 'typography':
      return <><PageHeader title="Typography" description="The fonts, sizes, and weights." /><TypographyTokens tokens={tokens} /></>;
    case 'radius':
      return has('radius') ? <><PageHeader title="Radius" description="How rounded the corners are." /><RadiusTokens tokens={tokens} /></> : null;
    case 'shadows':
      return has('shadows') ? <><PageHeader title="Shadows" description="The shadows the theme defines." /><ShadowTokens tokens={tokens} /></> : null;
    case 'motion':
      return has('motion') ? <><PageHeader title="Motion" description="Animation, easing, and transition values declared by this system." /><OtherTokens tokens={tokens} group="motion" /></> : null;
    case 'effects':
      return has('effects') ? <><PageHeader title="Effects" description="Blur, perspective, and aspect ratio values declared by this system." /><OtherTokens tokens={tokens} group="effects" /></> : null;
    case 'spacing':
      return has('spacing') ? <><PageHeader title="Spacing" description="The spacing values the theme defines." /><SpacingTokens tokens={tokens} /></> : null;
    case 'tokens':
      return has('other') ? <><PageHeader title="Other tokens" description="Everything else the theme defines." /><OtherTokens tokens={tokens} /></> : null;
    case 'icons':
      return sys.icons ? <><PageHeader title="Icons" description={`This system uses ${sys.icons.library}.`} /><IconsPage icons={sys.icons} /></> : null;
  }
  const found = components.find((c) => c.slug === page);
  return found ? <ComponentDocPage system={system} sys={sys} component={found} origin={origin} /> : null;
}

export default function SystemsPage() {
  // The router's types leave out the modules' routes, so say what this module's routes carry.
  const params = useParams({ strict: false }) as { system?: string; page?: string; _splat?: string };
  const system = params.system as SystemId;
  const sys = SYSTEMS[system];
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [system, params.page]);

  const manifest = useManifest();
  const manifestSystem = manifest.systems[system];
  const selected = manifest.systemContent.find((p) => p.id === contentId(system, params.page ?? '')) as Prototype | undefined;
  const components = manifestSystem?.components ?? [];
  const tokens = manifestSystem?.tokens ?? [];
  const search = useSearch({ strict: false }) as { mode?: 'source' };
  const editing = import.meta.env.DEV && search.mode === 'source';
  const path = sys && !selected ? sourcePath(system, params.page, components) : null;
  const { toggle, rendered } = useSourceView(import.meta.env.DEV && Boolean(path), editing && !selected);
  const editable = components.find((c) => c.slug === params.page);
  const content = selected ? <SystemContentPage key={selected.id + '/' + (params._splat ?? '')} proto={selected} slug={params._splat} /> : sys ? SystemPage({ system, sys, components, tokens, origin: manifestSystem?.origin ?? null, page: params.page }) : null;
  if (!sys || !content) return <NotFound />;
  return (
    <div className="flex min-h-0 flex-1">
      <SystemNav system={system} components={components} tokens={tokens} page={params.page} key={system} />
      {selected ? <main className="flex min-h-0 min-w-0 flex-1 flex-col">{content}</main> : editing && path ? (
        <main className="flex min-h-0 min-w-0 flex-1 flex-col"><Suspense fallback={<p className="p-4 text-sm">Loading editor…</p>}>{editable && ComponentEditor ? <ComponentEditor key={system + '/' + editable.slug} system={system} component={editable} onDone={toggle} /> : SystemSourceEditor && <SystemSourceEditor path={path} onDone={toggle} />}</Suspense></main>
      ) : (
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          <ThemeScope themeClass={sys.scopeClass} className="min-h-full bg-background text-foreground">
            <div ref={rendered} tabIndex={-1} className="mx-auto w-full max-w-3xl px-8 py-10 outline-none" data-testid={`${system}-set`}>{content}</div>
          </ThemeScope>
        </main>
      )}
    </div>
  );
}
