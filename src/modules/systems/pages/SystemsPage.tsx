import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { ChevronDown, Compass, Blocks, NotebookText, WandSparkles, SwatchBook, Type, SquareRoundCorner, Layers2, Ruler, MoveRight, Sparkles, Braces, Smile, Search, ChevronsDownUp, ChevronsUpDown, X, type LucideIcon } from 'lucide-react';
import { Input } from '@/systems/studio/components/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/systems/studio/components/tooltip';
import { artifactLabel, findArtifact } from '@/platform/app/data/manifest';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/systems/studio/components/collapsible';
import FileTree from '@/modules/prototypes/viewer/FileTree';
import { contentId, SYSTEM_CONTENT_SECTIONS } from '@/platform/core/roots';
import SystemContentPage from '../content/SystemContentPage';
import type { Prototype } from '@/platform/app/data/types';
import { NavHeader, NavList, NavTitle, SectionNav } from '@/platform/app/shell/nav';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/systems/studio/components/select';
import { NotFound } from '@/platform/app/shell/App';
import { ColorTokens, IconsPage, PageHeader } from '@/modules/systems/pages/foundations';
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
import SystemOverview from './SystemOverview';
import SystemAssets from './SystemAssets';
import { assetLink, systemAssets } from '../data/assets';
import { navLinkClass, navLinkStyle } from '@/platform/app/shell/nav';

const ComponentEditor = import.meta.env.DEV ? lazy(() => import('./ComponentEditor').then((module) => ({ default: module.ComponentEditor }))) : null;

const SystemSourceEditor = import.meta.env.DEV ? lazy(() => import('./SystemSourceEditor')) : null;

// Systems: a selector for design systems, and one page per theme category and component,
// at /systems/<system>/<page> (the system's introduction at /systems/<system>).
// Every system is treated the same, the app's own (Studio) included. What only its people can write
// comes from src/systems/<id>/intro.tsx: overview summaries, optional additional content, and icons. The rest comes from its files: a component page for each component in its components
// folder (src/modules/systems/docs.ts), and a theme page for each kind of token its theme
// defines (src/modules/systems/themeTokens.ts). Prototype systems appear in the selector, followed by Studio.
const intros = import.meta.glob<{ default: SystemIntro }>('/systems/*/intro.tsx', { eager: true });
const introOf = (id: string): SystemIntro => intros[`/systems/${id}/intro.tsx`]?.default ?? {};
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
  if (page === 'assets') return null;
  if (!page || page === 'icons') return intros['/systems/' + system + '/intro.tsx'] ? source.dir + 'intro.tsx' : source.dir + 'system.ts';
  const component = components.find((c) => c.slug === page);
  if (component) {
    const file = component.files.doc ?? component.files.examples ?? component.files.source;
    return file ? source.components + '/' + file : null;
  }
  return source.theme;
}

// The theme pages: page id and name, for each kind of token a theme can define.
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

// Stable semantic icons distinguish system guidance and theme pages from source files.
const PAGE_ICONS: Record<string, LucideIcon> = {
  intro: Compass, colors: SwatchBook, typography: Type, radius: SquareRoundCorner,
  shadows: Layers2, spacing: Ruler, motion: MoveRight, effects: Sparkles, tokens: Braces, icons: Smile,
};
const CONTENT_ICONS: Record<string, LucideIcon> = { context: NotebookText, skills: WandSparkles };
const navIcon = (Icon: LucideIcon) => <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />;

// Different Systems routes mount separate page instances. Keep tree choices for the session.
const systemTreeState = new Map<string, {
  openGroups: Record<string, boolean>;
  folderCommand: { version: number; expanded: boolean };
  foldersExpanded: Record<string, boolean>;
}>();

// A fixed system folder and its readable contents. Page changes preserve branch state.
function SystemBranch({ label, path, open, onOpenChange, children }: { label: string; path: string; open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  return <Collapsible open={open} onOpenChange={onOpenChange}>
    <CollapsibleTrigger title={path} className="mx-1 flex h-7 w-[calc(100%-8px)] items-center gap-1.5 rounded-md px-2 text-left text-[12px] font-medium leading-tight hover:bg-sidebar-foreground/5"><ChevronDown className={'size-3.5 shrink-0 text-muted-foreground transition-transform ' + (open ? '' : '-rotate-90')} />{label}</CollapsibleTrigger>
    <CollapsibleContent className="space-y-0.5 pl-5">{children}</CollapsibleContent>
  </Collapsible>;
}

function TreeAction({ label, onClick, disabled = false, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return <Tooltip>
    <TooltipTrigger render={<button type="button" aria-label={label} disabled={disabled} onClick={onClick} className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 disabled:opacity-40" />}>{children}</TooltipTrigger>
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>;
}

// The Systems navigation, built from the shared pieces (shell/nav/): the section's name, the
// system selector, then the open system's pages under their headings.
function SystemNav({ system, components, tokens, page }: { system: SystemId; components: SystemComponentDoc[]; tokens: ThemeToken[]; page?: string }) {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { _splat?: string };
  const manifest = useManifest();
  const source = system === PLATFORM_ID ? PLATFORM_SOURCE : sourceOf(system, PROTOTYPE_SYSTEMS[system]);
  const foundations = TOKEN_PAGES.filter((p) => p.id === 'typography' || tokens.some((t) => t.group === p.group));
  const savedTree = systemTreeState.get(system);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => savedTree?.openGroups ?? { context: true, skills: true, theme: true, assets: true, components: true });
  const [folderCommand, setFolderCommand] = useState(() => savedTree?.folderCommand ?? { version: 0, expanded: true });
  const [foldersExpanded, setFoldersExpanded] = useState<Record<string, boolean>>(() => savedTree?.foldersExpanded ?? {});
  useEffect(() => { systemTreeState.set(system, { openGroups, folderCommand, foldersExpanded }); }, [system, openGroups, folderCommand, foldersExpanded]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  const q = query.trim().toLowerCase();
  const matches = (label: string) => !q || label.toLowerCase().includes(q);
  const activeGroup = page && (Object.hasOwn(SYSTEM_CONTENT_SECTIONS, page) ? page : page === 'assets' || page === 'icons' ? 'assets' : foundations.some(p => p.id === page) ? 'theme' : components.some(c => c.slug === page) ? 'components' : undefined);
  useEffect(() => { if (activeGroup) setOpenGroups(prev => ({ ...prev, [activeGroup]: true })); }, [activeGroup, page, params._splat]);
  const groupOpen = (id: string) => Boolean(q) || openGroups[id];
  const changeGroup = (id: string, open: boolean) => { if (!q) setOpenGroups(prev => ({ ...prev, [id]: open })); };
  const allExpanded = Object.values(openGroups).every(Boolean) && Object.values(foldersExpanded).every(Boolean);
  const toggleAll = () => {
    const expanded = !allExpanded;
    setOpenGroups({ context: expanded, skills: expanded, theme: expanded, assets: expanded, components: expanded });
    setFolderCommand(prev => ({ version: prev.version + 1, expanded }));
  };
  const contentSections = Object.entries(SYSTEM_CONTENT_SECTIONS).flatMap(([id, section]) => {
    const proto = manifest.systemContent.find(p => p.id === contentId(system, id));
    return proto ? [{ id, section, proto }] : [];
  });
  const matchingFoundations = foundations.filter(p => matches('Theme') || matches(p.label));
  const matchingComponents = components.filter(c => matches('Components') || matches(c.title));
  const iconsMatch = SYSTEMS[system].icons && (matches('Assets') || matches('Icons'));
  const matchingAssets = systemAssets(system).filter(asset => matches('Assets') || matches(asset.path) || matches(asset.kind));
  const assetsMatch = matches('Assets') || matchingAssets.length > 0;
  const anyMatch = matches('Overview') || assetsMatch || matchingFoundations.length > 0 || iconsMatch || matchingComponents.length > 0 || contentSections.some(({ section, proto }) => matches(section.title) || proto.artifacts.some(a => matches(artifactLabel(a.path, proto)) || matches(a.path)));
  const file = (id: string | undefined, label: string) => {
    const path = sourcePath(system, id, components);
    return path && <FileNavItem key={id ?? 'intro'} href={'/systems/' + system + (id ? '/' + id : '')} path={path} label={label} className={id ? undefined : 'h-7'} icon={navIcon(id && components.some((c) => c.slug === id) ? Blocks : PAGE_ICONS[id ?? 'intro'] ?? Blocks)} reveal={() => systemSourceRequest('reveal', path)} />;
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
      <div className="shrink-0 px-3 pt-3">
        <div className="flex h-7 items-center justify-between pl-2">
          <p className="text-[12px] font-semibold">Resources</p>
          <div className="flex items-center gap-0.5">
            <TreeAction label="Search" onClick={() => { setSearchOpen(open => !open); setQuery(''); }}>{navIcon(Search)}</TreeAction>
            <TreeAction label={allExpanded ? 'Collapse all' : 'Expand all'} onClick={toggleAll} disabled={Boolean(q)}>{navIcon(allExpanded ? ChevronsDownUp : ChevronsUpDown)}</TreeAction>
          </div>
        </div>
        {searchOpen && <div className="relative mt-1">
          <Input ref={searchRef} aria-label="Search system" placeholder="Search system" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); if (query) setQuery(''); else setSearchOpen(false); } }} className="h-8 pr-8 text-[13px] shadow-none" />
          {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus(); }} className="absolute right-1 top-0.5 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground">{navIcon(X)}</button>}
        </div>}
      </div>
      <NavList>
        {matches('Overview') && file(undefined, 'Overview')}
        {contentSections.map(({ id, section, proto }) => <FileTree key={proto.id} proto={proto} current={page === id && params._splat ? findArtifact(proto, params._splat) : undefined} embedded contentIcon={navIcon(CONTENT_ICONS[id])} branch={{ label: section.title, path: source.dir + id + '/', active: page === id }} navigation={{ query: matches(section.title) ? '' : q, searching: Boolean(q), expanded: groupOpen(id), onExpandedChange: open => changeGroup(id, open), folderCommand, onFoldersExpanded: open => setFoldersExpanded(prev => prev[id] === open ? prev : { ...prev, [id]: open }) }} />)}
        {(matchingFoundations.length > 0 || matches('Theme')) && <SystemBranch label="Theme" path={source.theme} open={groupOpen('theme')} onOpenChange={open => changeGroup('theme', open)}>
          {matchingFoundations.map(p => file(p.id, p.label))}
        </SystemBranch>}
        {(assetsMatch || iconsMatch) && <SystemBranch label="Assets" path={source.dir + 'assets/'} open={groupOpen('assets')} onOpenChange={open => changeGroup('assets', open)}>
          {assetsMatch && <Link to={`/systems/${system}/assets` as never} activeOptions={{ exact: true, includeSearch: false }} className={navLinkClass} style={navLinkStyle}>{navIcon(Layers2)}All assets</Link>}
          {iconsMatch && file('icons', 'Icon library')}
          {matchingAssets.map(asset => <Link key={asset.path} to={assetLink(system, asset.path) as never} title={asset.path} activeOptions={{ exact: true, includeSearch: false }} className={navLinkClass} style={navLinkStyle}>{navIcon(asset.kind === 'Fonts' ? Type : Smile)}<span className="truncate">{asset.path}</span></Link>)}
        </SystemBranch>}
        {(matchingComponents.length > 0 || matches('Components')) && <SystemBranch label="Components" path={source.components} open={groupOpen('components')} onOpenChange={open => changeGroup('components', open)}>
          {matchingComponents.map(c => file(c.slug, c.title))}
          {!components.length && <p className="px-3 py-1 text-[12px] text-muted-foreground">Empty folder</p>}
        </SystemBranch>}
        {q && !anyMatch && <p role="status" className="px-3 py-1 text-[12px] text-muted-foreground">No matching items.</p>}
      </NavList>
    </SectionNav>
  );
}

// One page of a system, or null if the system doesn't have it.
function SystemPage({ system, sys, components, tokens, origin, page, assetPath }: {
  system: SystemId; sys: DesignSystem; components: SystemComponentDoc[]; tokens: ThemeToken[]; origin: 'shadcn' | null; page?: string; assetPath?: string;
}) {
  const has = (group: TokenGroup) => tokens.some((t) => t.group === group);
  switch (page) {
    case undefined:
      return <SystemOverview system={system} sys={sys} components={components} tokens={tokens} />;
    case 'assets':
      return <SystemAssets system={system} sys={sys} path={assetPath} />;
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
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [system, params.page, params._splat]);

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
  const content = selected ? <SystemContentPage key={selected.id + '/' + (params._splat ?? '')} proto={selected} slug={params._splat} /> : sys ? SystemPage({ system, sys, components, tokens, origin: manifestSystem?.origin ?? null, page: params.page, assetPath: params._splat }) : null;
  if (!sys || !content) return <NotFound />;
  return (
    <div className="flex min-h-0 flex-1">
      <SystemNav system={system} components={components} tokens={tokens} page={params.page} key={system} />
      {selected ? <main className="flex min-h-0 min-w-0 flex-1 flex-col">{content}</main> : editing && path ? (
        <main className="flex min-h-0 min-w-0 flex-1 flex-col"><Suspense fallback={<p className="p-4 text-sm">Loading editor…</p>}>{editable && ComponentEditor ? <ComponentEditor key={system + '/' + editable.slug} system={system} component={editable} onDone={toggle} /> : SystemSourceEditor && <SystemSourceEditor path={path} onDone={toggle} />}</Suspense></main>
      ) : (
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          <ThemeScope themeClass={params.page && params.page !== 'assets' ? sys.scopeClass : platform.scopeClass} className="min-h-full bg-background text-foreground">
            <div ref={rendered} tabIndex={-1} className="mx-auto w-full max-w-3xl px-8 py-10 outline-none" data-testid={`${system}-set`}>{content}</div>
          </ThemeScope>
        </main>
      )}
    </div>
  );
}
