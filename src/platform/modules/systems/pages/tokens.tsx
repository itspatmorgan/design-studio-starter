// The foundations pages other than Colors, built from the tokens a prototype system's theme.css
// defines (src/platform/modules/systems/themeTokens.ts): typography, radius, shadows, spacing, and everything else.
// Each token is drawn with its own value (`var(--name)`), inside the system's theme class, and its
// value is read live, so the pages follow the color mode and the theme file.
import type { ReactNode } from 'react';
import { useComputed } from '@/platform/modules/systems/pages/foundations';
import type { ThemeToken, TokenGroup } from '@/platform/modules/systems/themeTokens';

type Props = { tokens: ThemeToken[] };

const inGroup = (tokens: ThemeToken[], group: TokenGroup) => tokens.filter((t) => t.group === group);
// A token as a style value. Names come from our own parsed theme (themeTokens.ts checks them); this
// is the last check before one goes into a style. The declared value is the fallback, for a token
// the browser doesn't hold (an @theme inline one, which Tailwind uses but doesn't write out).
const ref = ({ name, value }: ThemeToken) => (/^--[\w-]+$/.test(name) ? `var(${name}, ${value})` : 'inherit');

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-[16px] font-semibold leading-6 tracking-tight text-foreground">{title}</h3>
      {children}
    </section>
  );
}

// A token's name, an optional sample of it, and its value as it is right now.
function TokenLine({ token, sample }: { token: ThemeToken; sample?: ReactNode }) {
  const { name } = token;
  const [valueRef, live] = useComputed((s) => s.getPropertyValue(name).trim());
  const value = live || token.value;
  return (
    <div ref={valueRef} className="grid grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,220px)] items-center gap-4 border-b border-border py-2.5 last:border-0">
      <code className="truncate font-mono text-xs text-foreground">{name}</code>
      <div className="min-w-0">{sample}</div>
      <code className="truncate text-right font-mono text-xs text-muted-foreground" title={value}>{value}</code>
    </div>
  );
}

const Lines = ({ children }: { children: ReactNode }) => <div className="rounded-lg border border-border px-4">{children}</div>;

function FontFamily({ token }: { token: ThemeToken }) {
  const [familyRef, live] = useComputed((s) => s.getPropertyValue(token.name).trim());
  const value = live || token.value;
  return (
    <div ref={familyRef} className="rounded-lg border border-border p-4">
      <p className="truncate text-2xl text-foreground" style={{ fontFamily: ref(token) }}>The quick brown fox jumps over the lazy dog</p>
      <p className="mt-2 truncate font-mono text-xs text-muted-foreground" title={value}><span className="text-foreground">{token.name}</span>: {value}</p>
    </div>
  );
}

export function TypographyTokens({ tokens }: Props) {
  const all = inGroup(tokens, 'typography');
  const weights = all.filter((t) => t.name.startsWith('--font-weight-'));
  const families = all.filter((t) => t.name.startsWith('--font-') && !weights.includes(t) && !t.name.startsWith('--font-size'));
  // Tailwind's text-xs also sets its line height in --text-xs--line-height: a size has one "--".
  const sizes = all.filter((t) => /^--text-[^-]+(-[^-]+)*$/.test(t.name) && !t.name.includes('--', 2));
  const rest = all.filter((t) => ![...weights, ...families, ...sizes].includes(t));
  return (
    <div className="space-y-10 text-foreground">
      {families.length > 0 && <Section title="Font families"><div className="space-y-3">{families.map((t) => <FontFamily key={t.name} token={t} />)}</div></Section>}
      <Section title="Sizes">
        <Lines>
          {sizes.map((t) => <TokenLine key={t.name} token={t} sample={<span className="block truncate text-foreground" style={{ fontSize: ref(t), lineHeight: `var(${t.name}--line-height, normal)` }}>Quick brown fox</span>} />)}
        </Lines>
        {sizes.length === 0 && <p className="mt-2 text-xs text-muted-foreground">This system does not declare font sizes in its theme.</p>}
      </Section>
      <Section title="Weights">
        <Lines>
          {weights.map((t) => <TokenLine key={t.name} token={t} sample={<span className="text-lg text-foreground" style={{ fontWeight: ref(t) }}>The quick brown fox</span>} />)}
        </Lines>
        {weights.length === 0 && <p className="mt-2 text-xs text-muted-foreground">This system does not declare font weights in its theme.</p>}
      </Section>
      {rest.length > 0 && <Section title="Other"><Lines>{rest.map((t) => <TokenLine key={t.name} token={t} />)}</Lines></Section>}
    </div>
  );
}

// Preview exactly the radius tokens declared by this system.
export function RadiusTokens({ tokens }: Props) {
  return <Lines>{inGroup(tokens, 'radius').map((t) => <TokenLine key={t.name} token={t} sample={<div className="size-12 border-2 border-primary/60 bg-primary/10" style={{ borderRadius: ref(t) }} />} />)}</Lines>;
}

export function ShadowTokens({ tokens }: Props) {
  return (
    <div className="text-foreground">
      <Lines>{inGroup(tokens, 'shadows').map((t) => <TokenLine key={t.name} token={t} sample={<div className="h-12 w-24 rounded-md border border-border bg-background" style={t.name.startsWith('--drop-shadow') ? { filter: `drop-shadow(${ref(t)})` } : { boxShadow: ref(t) }} />} />)}</Lines>
    </div>
  );
}

export function SpacingTokens({ tokens }: Props) {
  return (
    <div className="text-foreground">
      <Lines>{inGroup(tokens, 'spacing').map((t) => <TokenLine key={t.name} token={t} sample={<div className="h-3 rounded-sm bg-primary/60" style={{ width: ref(t), maxWidth: '100%', minWidth: 1 }} />} />)}</Lines>
    </div>
  );
}

export function OtherTokens({ tokens }: Props) {
  return (
    <div className="text-foreground">
      <Lines>{inGroup(tokens, 'other').map((t) => <TokenLine key={t.name} token={t} />)}</Lines>
    </div>
  );
}
