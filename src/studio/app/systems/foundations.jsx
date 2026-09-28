import { useEffect, useRef, useState } from 'react';
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
function useComputed(read) {
  const ref = useRef(null);
  const mode = useColorMode();
  const [value, setValue] = useState(null);
  useEffect(() => {
    if (ref.current) setValue(read(getComputedStyle(ref.current)));
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, value];
}

export function Section({ id, title, description, children }) {
  return (
    <section id={id} data-section className="mb-14 scroll-mt-6">
      <h2 className="mb-1 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {description && <p className="mb-5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </section>
  );
}

export function Code({ children }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">{children}</code>;
}

export function CodeBlock({ children }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-[13px] leading-6 text-foreground">
      {children}
    </pre>
  );
}

export function Prose({ children }) {
  return <div className="max-w-2xl space-y-3 text-sm leading-6 text-foreground/90">{children}</div>;
}

export function SubHeading({ children }) {
  return <h3 className="mt-8 mb-3 text-sm font-semibold text-foreground">{children}</h3>;
}

// --- Colors -----------------------------------------------------------------

// Semantic tokens, grouped. A pair renders the background with its foreground on top.
export const COLOR_GROUPS = [
  { name: 'Surfaces', tokens: [['background', 'foreground'], ['card', 'card-foreground'], ['popover', 'popover-foreground']] },
  { name: 'Roles', tokens: [['primary', 'primary-foreground'], ['secondary', 'secondary-foreground'], ['muted', 'muted-foreground'], ['accent', 'accent-foreground'], ['destructive']] },
  { name: 'Lines and focus', tokens: [['border'], ['input'], ['ring']] },
  { name: 'Charts', tokens: [['chart-1'], ['chart-2'], ['chart-3'], ['chart-4'], ['chart-5']] },
  { name: 'Sidebar', tokens: [['sidebar', 'sidebar-foreground'], ['sidebar-primary', 'sidebar-primary-foreground'], ['sidebar-accent', 'sidebar-accent-foreground'], ['sidebar-border'], ['sidebar-ring']] },
];

function TokenValue({ name }) {
  const [ref, value] = useComputed((s) => s.getPropertyValue(`--${name}`).trim());
  return (
    <div ref={ref} className="text-xs leading-5">
      <div className="font-mono text-foreground">--{name}</div>
      <div className="font-mono break-all text-muted-foreground" data-token={name} data-value={value ?? ''}>{value || 'not set'}</div>
    </div>
  );
}

function Swatch({ bg, fg }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div
        className="flex h-16 items-center px-3 text-sm font-medium"
        style={{ background: `var(--${bg})`, color: fg ? `var(--${fg})` : undefined }}
        data-swatch={bg}
      >
        {fg ? 'Aa' : null}
      </div>
      <div className="space-y-2 border-t border-border bg-background p-2.5">
        <TokenValue name={bg} />
        {fg && <TokenValue name={fg} />}
      </div>
    </div>
  );
}

// scopeClass puts swatches inside the system's theme (e.g. .product-theme).
export function ColorTokens({ scopeClass, extraGroups = [] }) {
  return (
    <div className={cn(scopeClass, 'text-foreground')}>
      {[...COLOR_GROUPS, ...extraGroups].map((g) => (
        <div key={g.name} className="mb-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{g.name}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {g.tokens.map(([bg, fg]) => <Swatch key={bg} bg={bg} fg={fg} />)}
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

function TypeSample({ label, className }) {
  const [ref, value] = useComputed((s) => `${s.fontSize} / ${s.lineHeight}, ${s.fontWeight}`);
  return (
    <div className="grid grid-cols-[180px_1fr_200px] items-baseline gap-4 border-b border-border py-3 last:border-0">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span ref={ref} className={cn('text-foreground', className)}>The quick brown fox</span>
      <span className="font-mono text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

export function TypeScale({ scopeClass, samples }) {
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

function RadiusBox({ cls }) {
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
  const [ref, value] = useComputed((s) => s.getPropertyValue('--radius').trim());
  return <p ref={ref} className="mb-4 text-sm text-muted-foreground">Base <Code>--radius</Code> is <Code>{value}</Code>. The scale is calculated from it.</p>;
}

export function RadiusScale({ scopeClass }) {
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

export function IconGrid({ icons }) {
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

export const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Frame wraps each demo box: plain for studio, ProductFrame for product.
export function ComponentDemo({ component, Frame = 'div' }) {
  const { name, file, demo: Demo } = component;
  return (
    <section id={slug(name)} data-section className="mb-10 scroll-mt-6">
      <div className="mb-3 flex items-baseline gap-3">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{name}</h3>
        <span className="font-mono text-xs text-muted-foreground">{file}</span>
      </div>
      <Frame>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-6">
          <Demo />
        </div>
      </Frame>
    </section>
  );
}
