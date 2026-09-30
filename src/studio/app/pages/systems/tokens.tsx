// The foundations pages other than Colors, built from the tokens a prototype system's theme.css
// defines (src/studio/themeTokens.ts): typography, radius, shadows, spacing, and everything else.
// Each token is drawn with its own value (`var(--name)`), inside the system's theme class, and its
// value is read live, so the pages follow the color mode and the theme file.
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { RadiusScale, useComputed } from '@/studio/app/pages/systems/foundations';
import type { ThemeToken, TokenGroup } from '@/studio/themeTokens';

type Props = { tokens: ThemeToken[]; scopeClass: string };

const inGroup = (tokens: ThemeToken[], group: TokenGroup) => tokens.filter((t) => t.group === group).map((t) => t.name);
// Token names come from our own parsed theme (themeTokens.ts checks them); this is the last check
// before one goes into a style.
const ref = (name: string) => (/^--[\w-]+$/.test(name) ? `var(${name})` : 'inherit');

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-[16px] font-semibold leading-6 tracking-tight text-foreground">{title}</h3>
      {children}
    </section>
  );
}

// A token's name, an optional sample of it, and its value as it is right now.
function TokenLine({ name, sample }: { name: string; sample?: ReactNode }) {
  const [valueRef, value] = useComputed((s) => s.getPropertyValue(name).trim());
  return (
    <div ref={valueRef} className="grid grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,220px)] items-center gap-4 border-b border-border py-2.5 last:border-0">
      <code className="truncate font-mono text-xs text-foreground">{name}</code>
      <div className="min-w-0">{sample}</div>
      <code className="truncate text-right font-mono text-xs text-muted-foreground" title={value ?? ''}>{value || 'not set'}</code>
    </div>
  );
}

const Lines = ({ children }: { children: ReactNode }) => <div className="rounded-lg border border-border px-4">{children}</div>;

function FontFamily({ name }: { name: string }) {
  const [familyRef, value] = useComputed((s) => s.getPropertyValue(name).trim());
  return (
    <div ref={familyRef} className="rounded-lg border border-border p-4">
      <p className="truncate text-2xl text-foreground" style={{ fontFamily: ref(name) }}>The quick brown fox jumps over the lazy dog</p>
      <p className="mt-2 truncate font-mono text-xs text-muted-foreground" title={value ?? ''}><span className="text-foreground">{name}</span>: {value}</p>
    </div>
  );
}

export function TypographyTokens({ tokens, scopeClass }: Props) {
  const names = inGroup(tokens, 'typography');
  const weights = names.filter((n) => n.startsWith('--font-weight-'));
  const families = names.filter((n) => n.startsWith('--font-') && !weights.includes(n) && !n.startsWith('--font-size'));
  // Tailwind's text-xs also sets its line height in --text-xs--line-height: a size has one "--".
  const sizes = names.filter((n) => /^--text-[^-]+(-[^-]+)*$/.test(n) && !n.includes('--', 2));
  const rest = names.filter((n) => ![...weights, ...families, ...sizes].includes(n));
  return (
    <div className={cn(scopeClass, 'space-y-10 text-foreground')}>
      {families.length > 0 && <Section title="Font families"><div className="space-y-3">{families.map((n) => <FontFamily key={n} name={n} />)}</div></Section>}
      {sizes.length > 0 && (
        <Section title="Sizes">
          <Lines>{sizes.map((n) => <TokenLine key={n} name={n} sample={<span className="block truncate text-foreground" style={{ fontSize: ref(n) }}>Quick brown fox</span>} />)}</Lines>
        </Section>
      )}
      {weights.length > 0 && (
        <Section title="Weights">
          <Lines>{weights.map((n) => <TokenLine key={n} name={n} sample={<span className="text-lg text-foreground" style={{ fontWeight: ref(n) }}>The quick brown fox</span>} />)}</Lines>
        </Section>
      )}
      {rest.length > 0 && <Section title={families.length + sizes.length + weights.length ? 'Other' : 'Tokens'}><Lines>{rest.map((n) => <TokenLine key={n} name={n} />)}</Lines></Section>}
    </div>
  );
}

// shadcn/ui's radius is one value (--radius) that the rounded-* scale is calculated from, so that
// scale is shown; any other radius token the theme defines is drawn as it is.
export function RadiusTokens({ tokens, scopeClass }: Props) {
  const names = inGroup(tokens, 'radius');
  const hasBase = names.includes('--radius');
  const extra = names.filter((n) => n !== '--radius');
  return (
    <div className={cn(scopeClass, 'space-y-10 text-foreground')}>
      {hasBase && <RadiusScale scopeClass="" />}
      {extra.length > 0 && (
        <Section title={hasBase ? 'Other radii' : 'Radii'}>
          <Lines>{extra.map((n) => <TokenLine key={n} name={n} sample={<div className="size-12 border-2 border-primary/60 bg-primary/10" style={{ borderRadius: ref(n) }} />} />)}</Lines>
        </Section>
      )}
    </div>
  );
}

export function ShadowTokens({ tokens, scopeClass }: Props) {
  return (
    <div className={cn(scopeClass, 'text-foreground')}>
      <Lines>{inGroup(tokens, 'shadows').map((n) => <TokenLine key={n} name={n} sample={<div className="h-12 w-24 rounded-md border border-border bg-background" style={{ boxShadow: ref(n) }} />} />)}</Lines>
    </div>
  );
}

export function SpacingTokens({ tokens, scopeClass }: Props) {
  return (
    <div className={cn(scopeClass, 'text-foreground')}>
      <Lines>{inGroup(tokens, 'spacing').map((n) => <TokenLine key={n} name={n} sample={<div className="h-3 rounded-sm bg-primary/60" style={{ width: ref(n), maxWidth: '100%', minWidth: 1 }} />} />)}</Lines>
    </div>
  );
}

export function OtherTokens({ tokens, scopeClass }: Props) {
  return (
    <div className={cn(scopeClass, 'text-foreground')}>
      <Lines>{inGroup(tokens, 'other').map((n) => <TokenLine key={n} name={n} />)}</Lines>
    </div>
  );
}
