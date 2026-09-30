// The Handbook's map: how an agent reads its instructions, in order. It's drawn from the manifest's
// handbookMap (src/studio/handbookMap.ts, worked out from AGENTS.md, the rules, and the skills), so
// it's never out of date. Plain HTML and CSS: the shape is fixed, so there's no diagram library.
//
//   AGENTS.md ── 1 Every session ── the rules it says to read first
//            ├── 2 When asked ───── the rules it routes to by task, and when
//            └── 3 Skills ───────── found by their descriptions
//
// The sidebar is a key to the boxes, and a list of what needs attention.
import type { ReactNode } from 'react';
import { Link, getRouteApi } from '@tanstack/react-router';
import type { HandbookMap as Map } from '@/studio/handbookMap';
import type { Prototype } from '@/studio/app/data/types';
import { itemLabel, itemLink } from '@/studio/app/data/manifest';
import HandbookHeader from '@/studio/app/pages/handbook/HandbookHeader';
import { NavGroup, NavList, SectionNav } from '@/studio/app/shell/nav';
import { NotFound } from '@/studio/app/shell/App';
import { cn } from '@/lib/utils';

const rootApi = getRouteApi('__root__');

// A page of the Handbook, by section and path, or undefined.
const pageIn = (handbook: Prototype[], section: string, path: string) => {
  const proto = handbook.find((p) => p.id === section);
  const item = proto?.items.find((i) => i.path === path);
  return proto && item ? { proto, item } : undefined;
};

const box = 'block rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted/60';

function Box({ variant, title, sub, to }: { variant: 'always' | 'ondemand' | 'skill'; title: string; sub?: string; to?: ReturnType<typeof itemLink> }) {
  const className = cn(
    box,
    variant === 'always' && 'border-foreground/60 bg-card',
    variant === 'ondemand' && 'border-dashed border-foreground/35 bg-card',
    variant === 'skill' && 'border-foreground/15 bg-muted',
    !to && 'hover:bg-transparent',
  );
  const body = (
    <>
      <span className="block truncate text-[13px] font-medium leading-tight text-foreground">{title}</span>
      {sub && <span className="mt-0.5 line-clamp-3 block text-xs leading-snug text-muted-foreground">{sub}</span>}
    </>
  );
  return to ? <Link {...to} className={className}>{body}</Link> : <div className={className}>{body}</div>;
}

// The rules a rule links to, one level under it: "then it reads…".
function Then({ map, handbook, from }: { map: Map; handbook: Prototype[]; from: string }) {
  const next = map.via.filter((v) => v.from === from);
  if (!next.length) return null;
  return (
    <ul className="ml-4 space-y-1.5 border-l border-border pl-3">
      {next.map((v) => {
        const page = pageIn(handbook, 'rules', v.path);
        return (
          <li key={v.path} className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">then reads</p>
            <Box variant="ondemand" title={itemLabel(v.path)} to={page && itemLink(page.proto, page.item)} />
            <Then map={map} handbook={handbook} from={v.path} />
          </li>
        );
      })}
    </ul>
  );
}

function Lane({ step, title, hint, children, empty }: { step: number; title: string; hint: string; children?: ReactNode; empty?: string }) {
  return (
    <section aria-label={title} className="flex min-w-0 flex-col">
      <div className="mx-auto hidden h-6 w-px bg-border md:block" aria-hidden />
      <header className="mb-3 flex items-center gap-2">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">{step}</span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-tight">{title}</h2>
          <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
        </div>
      </header>
      <div className="space-y-2">{children}</div>
      {empty && <p className="text-xs text-muted-foreground">{empty}</p>}
    </section>
  );
}

function Diagram({ map, handbook }: { map: Map; handbook: Prototype[] }) {
  return (
    <div className="mt-8 flex flex-col items-center">
      {map.entry ? (
        <div className="w-full max-w-xs rounded-lg border-2 border-foreground bg-card px-4 py-3 text-center">
          <p className="font-mono text-sm font-semibold">AGENTS.md</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Where every agent starts. It only routes.</p>
        </div>
      ) : (
        <div className="w-full max-w-md rounded-lg border-2 border-dashed border-destructive px-4 py-3 text-center">
          <p className="font-mono text-sm font-semibold text-destructive">No AGENTS.md</p>
          <p className="mt-0.5 text-xs text-muted-foreground">An agent that looks for one won't find your instructions. Add it at the top of the repo.</p>
        </div>
      )}
      <div className="hidden h-6 w-px bg-border md:block" aria-hidden />
      <div className="relative grid w-full gap-8 md:grid-cols-3 md:gap-6">
        {/* The rail across the three lanes: from the middle of the first to the middle of the last. */}
        <div className="pointer-events-none absolute top-0 right-[16.667%] left-[16.667%] hidden h-px bg-border md:block" aria-hidden />
        <Lane step={1} title="Every session" hint="Read at the start of every task." empty={map.always.length ? undefined : 'Nothing is read every time.'}>
          {map.always.map((path) => {
            const page = pageIn(handbook, 'rules', path);
            return (
              <div key={path} className="space-y-1.5">
                <Box variant="always" title={itemLabel(path)} to={page && itemLink(page.proto, page.item)} />
                <Then map={map} handbook={handbook} from={path} />
              </div>
            );
          })}
        </Lane>
        <Lane step={2} title="When asked" hint="Read when the task matches." empty={map.onDemand.length ? undefined : 'No rule is routed by task.'}>
          {map.onDemand.map(({ path, when }) => {
            const page = pageIn(handbook, 'rules', path);
            return (
              <div key={path} className="space-y-1.5">
                <Box variant="ondemand" title={itemLabel(path)} sub={`When ${when}`} to={page && itemLink(page.proto, page.item)} />
                <Then map={map} handbook={handbook} from={path} />
              </div>
            );
          })}
        </Lane>
        <Lane step={3} title="Skills" hint="Found by their descriptions." empty={map.skills.length ? undefined : 'No skills yet.'}>
          {map.skills.map((skill) => {
            const page = pageIn(handbook, 'skills', `${skill.folder}/SKILL.md`);
            return (
              <Box
                key={skill.folder}
                variant="skill"
                title={skill.name}
                sub={skill.when ? `When ${skill.when}. ${skill.description}` : skill.description}
                to={page && itemLink(page.proto, page.item)}
              />
            );
          })}
        </Lane>
      </div>
    </div>
  );
}

// A small sample of each kind of box, for the key.
function Swatch({ className }: { className: string }) {
  return <span aria-hidden className={cn('mt-0.5 h-3.5 w-6 shrink-0 rounded border', className)} />;
}

function Key({ map, handbook }: { map: Map; handbook: Prototype[] }) {
  const row = 'mx-1 flex gap-2 py-1 pr-1.5 pl-2 text-[12px] leading-snug text-sidebar-foreground/80';
  return (
    <NavList>
      <NavGroup heading="Key">
        <p className={row}><Swatch className="border-foreground/60 bg-card" /> Read every session</p>
        <p className={row}><Swatch className="border-dashed border-foreground/35 bg-card" /> Read when the task matches</p>
        <p className={row}><Swatch className="border-foreground/15 bg-muted" /> A skill, found by its description</p>
        <p className={row}>Open any box to read the file. Rules a rule links to appear under it.</p>
      </NavGroup>
      <NavGroup heading="Needs attention">
        {map.unrouted.length === 0 && map.missing.length === 0 && <p className={row}>Every rule is routed, and every link works.</p>}
        {map.unrouted.length > 0 && (
          <>
            <p className={row}>Nothing links to these rules, so no agent will read them. Add a line for each to AGENTS.md.</p>
            {map.unrouted.map((path) => {
              const page = pageIn(handbook, 'rules', path);
              return page
                ? <Link key={path} {...itemLink(page.proto, page.item)} className={cn(row, 'rounded-md text-destructive hover:bg-sidebar-foreground/5')}>{itemLabel(path)}</Link>
                : <p key={path} className={cn(row, 'text-destructive')}>{itemLabel(path)}</p>;
            })}
          </>
        )}
        {map.missing.length > 0 && (
          <>
            <p className={row}>AGENTS.md links to files that aren't there:</p>
            {map.missing.map((file) => <p key={file} className={cn(row, 'break-all font-mono text-destructive')}>{file}</p>)}
          </>
        )}
      </NavGroup>
    </NavList>
  );
}

export default function HandbookMapPage() {
  const { handbook, handbookMap: map } = rootApi.useLoaderData();
  if (!map) return <NotFound />;
  return (
    <div className="flex min-h-0 flex-1">
      <SectionNav label="Handbook navigation">
        <HandbookHeader />
        <Key map={map} handbook={handbook} />
      </SectionNav>
      <main data-doc-scroll className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-8 py-10">
          <h1 className="text-2xl font-semibold tracking-tight">How your agent reads the Handbook</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            It starts at AGENTS.md, which points to the rules to read. Skills are found by their descriptions. This is drawn from the files themselves, so it changes when they do.
          </p>
          <Diagram map={map} handbook={handbook} />
        </div>
      </main>
    </div>
  );
}
