import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/studio/components/tabs';
import { CodeBlock, ColorTokens, ComponentDemo, RadiusScale, Section, TypeScale, slug } from './systems/foundations';
import type { DesignSystem } from './types';
import { product } from './systems/productSystem';
import { studio } from './systems/studioSystem';

// Systems page: one tab per design system. Each documents its purpose, theme,
// foundations (read live from the CSS), icons, and components. Optional sections
// (typography, radius, icons) show only when the system defines them.
const SYSTEMS = { product, studio };
type SystemId = keyof typeof SYSTEMS;
type NavGroup = { heading?: string; items: [id: string, label: string][] };

// Sidebar groups, in page order. Component categories come from the system.
function navGroups(sys: DesignSystem): NavGroup[] {
  return [
    { items: [['intro', 'Introduction'], ['theme', 'Theme']] },
    { heading: 'Foundations', items: [
      ['colors', 'Colors'],
      sys.typeSamples && ['typography', 'Typography'],
      sys.showRadius && ['radius', 'Radius'],
      sys.icons && ['icons', 'Icons'],
    ].filter((item): item is [string, string] => Boolean(item)) },
    ...sys.categories.map((cat) => ({ heading: cat.name, items: cat.components.map((c): [string, string] => [slug(c.name), c.name]) })),
  ];
}

type SystemNavProps = { system: SystemId; setSystem: (id: SystemId) => void; active: string; onPick: (id: string) => void };

function SystemNav({ system, setSystem, active, onPick }: SystemNavProps) {
  return (
    <nav aria-label="Systems" className="flex min-h-0 w-52 shrink-0 flex-col border-r border-border bg-muted/40">
      <Tabs value={system} onValueChange={(id) => setSystem(id as SystemId)} className="border-b border-border p-3">
        <TabsList className="w-full">
          {Object.entries(SYSTEMS).map(([id, s]) => (
            <TabsTrigger key={id} value={id}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        {navGroups(SYSTEMS[system]).map((g, i) => (
          <div key={g.heading ?? i}>
            {g.heading && <p className="mt-5 mb-2 px-2.5 text-sm font-semibold text-foreground">{g.heading}</p>}
            {g.items.map(([id, label]) => (
              <NavItem key={id} label={label} active={active === id} onClick={() => onPick(id)} />
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}

function NavItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'block w-full rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors',
        active
          ? 'bg-sidebar-accent-active font-semibold text-sidebar-accent-foreground'
          : 'text-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      {label}
    </button>
  );
}

function SystemContent({ sys }: { sys: DesignSystem }) {
  const { scopeClass, Frame } = sys;
  return (
    <>
      <header id="intro" data-section className="mb-14 scroll-mt-6">
        <h1 className="mb-4 text-[26px] font-semibold leading-9 tracking-[-0.01em] text-foreground">{sys.label}</h1>
        {sys.intro}
      </header>
      <Section id="theme" title="Theme">{sys.theme}</Section>
      <Section id="colors" title="Colors" description="Every semantic token, read live from the theme. Values follow the current mode.">
        <ColorTokens scopeClass={scopeClass} extraTokens={sys.extraColorTokens} />
      </Section>
      {sys.typeSamples && <Section id="typography" title="Typography" description="The font and the sizes and weights the components use. Values are measured live.">
        <TypeScale scopeClass={scopeClass} samples={sys.typeSamples} />
      </Section>}
      {sys.showRadius && <Section id="radius" title="Radius" description="Tailwind radius classes, measured live from the theme.">
        <RadiusScale scopeClass={scopeClass} />
      </Section>}
      {sys.icons && <Section id="icons" title="Icons" description={`This system uses ${sys.icons.library}.`}>
        <div className="mb-4"><CodeBlock>{sys.icons.snippet}</CodeBlock></div>
        <p className="mb-4 text-sm">
          <a href={sys.icons.href} target="_blank" rel="noreferrer" className="font-medium text-foreground underline underline-offset-4">
            Browse all icons
          </a>
        </p>
        <div className={cn(scopeClass, 'text-foreground')}>{sys.icons.grid}</div>
      </Section>}
      {sys.categories.map((cat) => (
        <div key={cat.name} className="mb-6">
          <h2 className="mb-5 border-b border-border pb-2 text-lg font-semibold tracking-tight text-foreground">{cat.name}</h2>
          {cat.components.map((c) => <ComponentDemo key={c.name} component={c} Frame={Frame} />)}
        </div>
      ))}
    </>
  );
}

export default function SystemsPage() {
  const [system, setSystem] = useState<SystemId>('product');
  const [active, setActive] = useState('intro');
  const mainRef = useRef<HTMLElement>(null);
  const lockUntil = useRef(0);

  // Scroll spy: the active item is the last section whose top has passed the top of the pane.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    const onScroll = () => {
      if (Date.now() < lockUntil.current) return;
      const top = main.getBoundingClientRect().top + 80;
      const all = [...main.querySelectorAll('[data-section]')];
      let current = 'intro';
      for (const el of all as HTMLElement[]) if (el.getBoundingClientRect().top <= top) current = el.id;
      if (main.scrollTop + main.clientHeight >= main.scrollHeight - 2) current = all.at(-1)?.id ?? current;
      setActive(current);
    };
    main.addEventListener('scroll', onScroll, { passive: true });
    return () => main.removeEventListener('scroll', onScroll);
  }, [system]);

  const pick = (id: string) => {
    setActive(id);
    lockUntil.current = Date.now() + 800; // keep the clicked item active during the smooth scroll
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const switchSystem = (id: SystemId) => {
    setSystem(id);
    setActive('intro');
    mainRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="flex min-h-0 flex-1">
      <SystemNav system={system} setSystem={switchSystem} active={active} onPick={pick} />
      <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-8 py-10" data-testid={`${system}-set`}>
          <SystemContent key={system} sys={SYSTEMS[system]} />
        </div>
      </main>
    </div>
  );
}
