import type { DesignSystem } from '@/studio/app/data/types';
import { useEffect, useRef, useState, type ComponentType, type ElementType, type ReactNode, type Ref } from 'react';
import { cn } from '@/lib/utils';

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
function useComputed<T extends HTMLElement = HTMLDivElement>(read: (s: CSSStyleDeclaration) => string): [Ref<T>, string | null] {
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

// Semantic tokens, grouped, one compact row each: [name, utility, role].
type Token = [name: string, utility: string, role: string];
const COLOR_GROUPS: { name: string; tokens: Token[] }[] = [
  { name: 'Surfaces', tokens: [
    ['background', 'bg-background', 'Page background'],
    ['foreground', 'text-foreground', 'Primary text'],
    ['card', 'bg-card', 'Card surfaces'],
    ['card-foreground', 'text-card-foreground', 'Text on cards'],
    ['popover', 'bg-popover', 'Menus and dialogs'],
    ['popover-foreground', 'text-popover-foreground', 'Text on popovers'],
    ['muted', 'bg-muted', 'Muted backgrounds'],
    ['muted-foreground', 'text-muted-foreground', 'Secondary text'],
    ['accent', 'bg-accent', 'Hover and focus highlights'],
    ['accent-foreground', 'text-accent-foreground', 'Text on accent'],
    ['secondary', 'bg-secondary', 'Secondary surfaces'],
    ['secondary-foreground', 'text-secondary-foreground', 'Text on secondary'],
    ['border', 'border-border', 'Borders and dividers'],
    ['input', 'border-input', 'Input borders'],
    ['ring', 'ring-ring', 'Focus rings'],
  ] },
  { name: 'Actions', tokens: [
    ['primary', 'bg-primary', 'Primary actions'],
    ['primary-foreground', 'text-primary-foreground', 'Text on primary'],
    ['destructive', 'bg-destructive', 'Destructive actions'],
  ] },
  { name: 'Charts', tokens: [1, 2, 3, 4, 5].map((n) => [`chart-${n}`, `bg-chart-${n}`, `Chart series ${n}`]) },
  { name: 'Sidebar', tokens: [
    ['sidebar', 'bg-sidebar', 'Sidebar background'],
    ['sidebar-foreground', 'text-sidebar-foreground', 'Sidebar text'],
    ['sidebar-primary', 'bg-sidebar-primary', 'Sidebar primary'],
    ['sidebar-primary-foreground', 'text-sidebar-primary-foreground', 'Text on sidebar primary'],
    ['sidebar-accent', 'bg-sidebar-accent', 'Sidebar hover'],
    ['sidebar-accent-foreground', 'text-sidebar-accent-foreground', 'Sidebar accent text'],
    ['sidebar-border', 'border-sidebar-border', 'Sidebar border'],
    ['sidebar-ring', 'ring-sidebar-ring', 'Sidebar focus ring'],
  ] },
];

function TokenRow({ name, utility, role }: { name: string; utility: string; role: string }) {
  const [ref, value] = useComputed((s) => s.getPropertyValue(`--${name}`).trim());
  return (
    <div ref={ref} className="flex items-center gap-3 py-1.5">
      <div className="h-7 w-10 shrink-0 rounded border border-border" style={{ background: `var(--${name})` }} data-swatch={name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <code className="text-[13px] text-foreground">--{name}</code>
          <code className="truncate text-[12px] text-muted-foreground">{utility}</code>
        </div>
        <p className="truncate text-[12px] text-muted-foreground">{role}</p>
      </div>
      <code className="shrink-0 text-right text-[12px] text-muted-foreground" data-token={name} data-value={value ?? ''}>{value || 'not set'}</code>
    </div>
  );
}

// scopeClass puts the rows inside the system's theme (e.g. .product-theme).
// extraTokens: [groupName, [name, utility, role]] rows appended to an existing group.
export function ColorTokens({ scopeClass, extraTokens = [] }: { scopeClass: string; extraTokens?: [group: string, token: Token][] }) {
  return (
    <div className={cn(scopeClass, 'space-y-10 text-foreground')}>
      {COLOR_GROUPS.map((g) => (
        <div key={g.name}>
          <h3 className="mb-3 text-[16px] font-semibold leading-6 tracking-tight text-foreground">{g.name}</h3>
          <div className="divide-y divide-border/60">
            {[...g.tokens, ...extraTokens.filter(([group]) => group === g.name).map(([, t]) => t)].map(([name, utility, role]) => (
              <TokenRow key={name} name={name} utility={utility} role={role} />
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
// Frame wraps the demo: plain for studio, ProductFrame for product.
export type ComponentSpec = { name: string; file: string; description?: string; demo: ComponentType };

// shadcn/ui's page for a component, from its file name ("input-group.tsx" → .../base/input-group).
export const shadcnDocs = (file: string) => `https://ui.shadcn.com/docs/components/base/${file.replace(/\.tsx$/, '')}`;

export function ComponentDemo({ component, Frame = 'div', dir }: { component: ComponentSpec; Frame?: ElementType; dir: string }) {
  const { file, demo: Demo } = component;
  return (
    <>
      <Frame>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-6">
          <Demo />
        </div>
      </Frame>
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
