import { PortalContext } from '@/lib/portal';
import type { DesignSystem } from '@/studio/app/data/types';
import { useEffect, useRef, useState, type ComponentType, type ReactNode, type Ref } from 'react';
import { cn } from '@/lib/utils';
import { KNOWN_COLORS, type ThemeToken } from '@/studio/themeTokens';

// Shared building blocks for the Systems page. Everything here reads live values
// from the CSS at runtime, so it stays true when someone edits a theme file.

// Re-render when the app switches light/dark (the .dark class on <html>).
export function useColorMode() {
  const [mode, setMode] = useState(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  useEffect(() => {
    const html = document.documentElement;
    const obs = new MutationObserver(() => setMode(html.classList.contains('dark') ? 'dark' : 'light'));
    obs.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return mode;
}

// Read a computed style from an element after each render that changes the mode.
export function useComputed<T extends HTMLElement = HTMLDivElement>(read: (s: CSSStyleDeclaration) => string): [Ref<T>, string | null] {
  const ref = useRef<T>(null);
  const mode = useColorMode();
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    if (ref.current) setValue(read(getComputedStyle(ref.current)));
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, value];
}

// A page's header: title and an optional one-line description.
export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <header className="mb-8">
      <h1 className="mb-2 text-[26px] font-semibold leading-9 tracking-[-0.01em] text-foreground">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </header>
  );
}

type Children = { children: ReactNode };

export function Code({ children }: Children) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">{children}</code>;
}

export function CodeBlock({ children }: Children) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-[13px] leading-6 text-foreground">
      {children}
    </pre>
  );
}

export function Prose({ children }: Children) {
  return <div className="max-w-2xl space-y-3 text-sm leading-6 text-foreground/90">{children}</div>;
}

// --- Colors -----------------------------------------------------------------

// One row per color token. A token shadcn/ui defines shows what it's for and its Tailwind class;
// any other just shows its name and value.
export function TokenRow({ name, utility, role }: { name: string; utility?: string; role?: string }) {
  const [ref, value] = useComputed((s) => s.getPropertyValue(`--${name}`).trim());
  return (
    <div ref={ref} className="flex items-center gap-3 py-1.5">
      <div className="h-7 w-10 shrink-0 rounded border border-border" style={{ background: `var(--${name})` }} data-swatch={name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <code className="text-[13px] text-foreground">--{name}</code>
          {utility && <code className="truncate text-[12px] text-muted-foreground">{utility}</code>}
        </div>
        {role && <p className="truncate text-[12px] text-muted-foreground">{role}</p>}
      </div>
      <code className="shrink-0 text-right text-[12px] text-muted-foreground" data-token={name} data-value={value ?? ''}>{value || 'not set'}</code>
    </div>
  );
}

// The color tokens in groups: shadcn/ui's first, in their usual order, then any others by the
// group their name gives them (a ramp like blue-500 is "Blue"), then the rest.
const KNOWN_ORDER = ['Surfaces', 'Actions', 'Charts', 'Sidebar'];
function colorGroups(tokens: Pick<ThemeToken, 'name' | 'subgroup'>[]) {
  const groups = new Map<string, string[]>();
  for (const t of tokens) {
    const heading = t.subgroup ?? 'Other colors';
    groups.set(heading, [...(groups.get(heading) ?? []), t.name.slice(2)]);
  }
  const rank = (heading: string) => (KNOWN_ORDER.includes(heading) ? KNOWN_ORDER.indexOf(heading) : heading === 'Other colors' ? 99 : 50);
  return [...groups].sort(([a], [b]) => rank(a) - rank(b));
}

// scopeClass puts the rows inside the system's theme (e.g. .product-theme). `tokens` are the ones
// its theme defines; without them (the studio system), shadcn/ui's are listed.
export function ColorTokens({ scopeClass, tokens }: { scopeClass: string; tokens?: ThemeToken[] }) {
  const colors = tokens
    ? tokens.filter((t) => t.group === 'colors')
    : Object.entries(KNOWN_COLORS).map(([name, { group }]) => ({ name: `--${name}`, subgroup: group }));
  return (
    <div className={cn(scopeClass, 'space-y-10 text-foreground')}>
      {colorGroups(colors).map(([heading, names]) => (
        <div key={heading}>
          <h3 className="mb-3 text-[16px] font-semibold leading-6 tracking-tight text-foreground">{heading}</h3>
          <div className="divide-y divide-border/60">
            {names.map((name) => (
              <TokenRow key={name} name={name} utility={KNOWN_COLORS[name.replace(/^color-/, '')]?.utility} role={KNOWN_COLORS[name.replace(/^color-/, '')]?.role} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Typography -------------------------------------------------------------

function FontFamily() {
  const [ref, value] = useComputed((s) => s.fontFamily);
  return (
    <div ref={ref} className="mb-6 rounded-lg border border-border p-4">
      <p className="text-2xl font-semibold text-foreground">Inter Variable</p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">font-family: {value}</p>
    </div>
  );
}

export type TypeSampleSpec = { label: string; className: string };

function TypeSample({ label, className }: TypeSampleSpec) {
  const [ref, value] = useComputed<HTMLSpanElement>((s) => `${s.fontSize} / ${s.lineHeight}, ${s.fontWeight}`);
  return (
    <div className="grid grid-cols-[180px_1fr_200px] items-baseline gap-4 border-b border-border py-3 last:border-0">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span ref={ref} className={cn('text-foreground', className)}>The quick brown fox</span>
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

export function TypeScale({ scopeClass, samples }: { scopeClass: string; samples: TypeSampleSpec[] }) {
  return (
    <div className={cn(scopeClass, 'text-foreground')}>
      <FontFamily />
      <div className="rounded-lg border border-border px-4">
        {samples.map((s) => <TypeSample key={s.label} {...s} />)}
      </div>
    </div>
  );
}

// --- Radius -----------------------------------------------------------------

const RADII = ['rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-4xl', 'rounded-full'];

function RadiusBox({ cls }: { cls: string }) {
  const [ref, value] = useComputed((s) => s.borderTopLeftRadius);
  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={ref} className={cn('size-20 border-2 border-primary/60 bg-primary/10', cls)} />
      <span className="font-mono text-xs text-foreground">{cls}</span>
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

function BaseRadius() {
  const [ref, value] = useComputed<HTMLParagraphElement>((s) => s.getPropertyValue('--radius').trim());
  return <p ref={ref} className="mb-4 text-sm text-muted-foreground">Base <Code>--radius</Code> is <Code>{value}</Code>. The scale is calculated from it.</p>;
}

export function RadiusScale({ scopeClass }: { scopeClass: string }) {
  return (
    <div className={cn(scopeClass, 'text-foreground')}>
      <BaseRadius />
      <div className="flex flex-wrap gap-6 rounded-lg border border-border p-6">
        {RADII.map((c) => <RadiusBox key={c} cls={c} />)}
      </div>
    </div>
  );
}

// --- Icons ------------------------------------------------------------------

export function IconGrid({ icons }: { icons: { name: string; node: ReactNode }[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
      {icons.map(({ name, node }) => (
        <div key={name} className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-foreground">
          {node}
          <span className="w-full truncate text-center font-mono text-[11px] text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}

// --- Components -------------------------------------------------------------

// The Icons page: how to use the system's icon library, and a sample.
export function IconsPage({ icons, scopeClass }: { icons: NonNullable<DesignSystem['icons']>; scopeClass: string }) {
  return (
    <>
      <div className="mb-4"><CodeBlock>{icons.snippet}</CodeBlock></div>
      <p className="mb-4 text-sm">
        <a href={icons.href} target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-4">
          Browse all icons
        </a>
      </p>
      <div className={cn(scopeClass, 'text-foreground')}>{icons.grid}</div>
    </>
  );
}

export const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// One component page: its name, what it's for, where it lives, a live demo, and its docs.
// Prototype systems' demos render in SystemFrame, so they get the system's theme.
export type ComponentSpec = { name: string; file: string; description?: string; demo: ComponentType };

// shadcn/ui's page for a component, from its file name ("input-group.tsx" → .../base/input-group).
export const shadcnDocs = (file: string) => `https://ui.shadcn.com/docs/components/base/${file.replace(/\.tsx$/, '')}`;

// A prototype system's theme class and portal container, like ViewFrame gives each view,
// so demos and their pop-ups keep the system's look. The studio system has no class.
export function SystemFrame({ themeClass, children }: { themeClass: string; children: ReactNode }) {
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  if (!themeClass) return <>{children}</>;
  return (
    <div className={cn(themeClass, 'text-foreground')}>
      <PortalContext.Provider value={portal}>{children}</PortalContext.Provider>
      <div ref={setPortal} />
    </div>
  );
}

export function ComponentDemo({ component, themeClass, dir }: { component: ComponentSpec; themeClass: string; dir: string }) {
  const { file, demo: Demo } = component;
  return (
    <>
      <SystemFrame themeClass={themeClass}>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-6">
          <Demo />
        </div>
      </SystemFrame>
      <dl className="mt-8 space-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">File</dt>
          <dd className="font-mono text-xs text-foreground">{dir}{file}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Docs</dt>
          <dd>
            <a href={shadcnDocs(file)} target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-4">
              shadcn/ui
            </a>
            <span className="text-muted-foreground">, which links to the Base UI API it's built on</span>
          </dd>
        </div>
      </dl>
    </>
  );
}
