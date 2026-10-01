import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MDXContent } from 'mdx/types';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/platform/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/platform/components/tooltip';
import { CodeBlock, PageHeader, SystemFrame } from '@/platform/modules/systems/pages/foundations';
import { Prose } from '@/platform/app/docs/Prose';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/platform/components/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/platform/components/table';
import { loadComponentDoc, loadExamples, loadExamplesSource, loadProps, useDocsVersion, type Example } from '@/platform/modules/systems/data/loadDocs';
import type { ComponentPropsDoc, PropDoc, SystemComponentDoc } from '@/platform/modules/systems/docs';
import { shadcnDocsUrl } from '@/platform/modules/systems/sources';
import type { DesignSystem } from '@/platform/app/data/types';

// One component's page in the Systems section, built from its files: the title and description
// and the Markdown page, then live examples, then its props read from the code. Whatever the
// component doesn't have yet is left out, with a note on the file to add.
type Loaded = { doc?: MDXContent; examples?: Example[]; source?: string; props?: ComponentPropsDoc[] };

// The page's Markdown headings match the page's own sections (18px, under the 26px title), not the
// 21px h2 the small prose size gives.
const PAGE_PROSE = 'prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-lg prose-h2:font-semibold prose-h2:tracking-tight prose-h3:text-base';

// "WithIcon" → "With icon".
const sentence = (name: string) => name.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()).replace(/ ([A-Z])(?![A-Z])/g, (_, c: string) => ` ${c.toLowerCase()}`);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}

const Note = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;

// One line of a table cell. If the cell is too narrow for it, it ends in an ellipsis and the whole
// text shows in a tooltip on hover or focus (only then: a text that fits needs none).
function Truncated({ children }: { children: string }) {
  // The trigger is a span (below), though the tooltip's types say button.
  const ref = useRef<HTMLButtonElement>(null);
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setCut(el.scrollWidth > el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);
  return (
    <Tooltip disabled={!cut}>
      <TooltipTrigger ref={ref} render={<span tabIndex={cut ? 0 : undefined} className={`block max-w-full truncate outline-none ${cut ? 'cursor-help focus-visible:text-foreground' : ''}`} />}>{children}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-md font-mono text-xs break-words whitespace-normal">{children}</TooltipContent>
    </Tooltip>
  );
}

// The columns keep fixed shares of the width, so a long type can't crowd out the others.
function PropsTable({ props }: { props: PropDoc[] }) {
  return (
    <div className="rounded-lg border border-border">
      <Table className="table-fixed text-[13px]">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[28%] px-3 text-xs text-muted-foreground">Prop</TableHead>
            <TableHead className="w-[52%] px-3 text-xs text-muted-foreground">Type</TableHead>
            <TableHead className="w-[20%] px-3 text-xs text-muted-foreground">Default</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((p) => (
            <TableRow key={p.name}>
              <TableCell className="px-3 py-2 align-top font-mono text-xs break-words whitespace-normal text-foreground">
                {/* The description is a tooltip on the name (hover or focus), so the table stays short. */}
                {p.description ? (
                  <Tooltip>
                    <TooltipTrigger render={<span tabIndex={0} className="cursor-help underline decoration-muted-foreground/50 decoration-dotted underline-offset-4 outline-none focus-visible:decoration-foreground" />}>{p.name}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="max-w-xs font-sans">{p.description}</TooltipContent>
                  </Tooltip>
                ) : p.name}
                {p.required && <span className="text-destructive" title="Required"> *</span>}
              </TableCell>
              <TableCell className="px-3 py-2 align-top font-mono text-xs text-foreground/90"><Truncated>{p.type}</Truncated></TableCell>
              <TableCell className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">{p.default ? <Truncated>{p.default}</Truncated> : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// A link from a page's frontmatter, if it's a web address (never javascript: or the like).
function webLink(url: string | null) {
  try { const u = new URL(url ?? ''); return u.protocol === 'https:' || u.protocol === 'http:' ? u : null; } catch { return null; }
}

// `onEdit` shows an Edit button that opens the component's files in the editor (dev only). `origin`
// is where the system's components come from: 'shadcn' links the page to that component's shadcn/ui
// docs, unless its frontmatter gives a link of its own.
export function ComponentDocPage({ system, sys, component, origin, onEdit }: { system: string; sys: DesignSystem; component: SystemComponentDoc; origin: 'shadcn' | null; onEdit?: () => void }) {
  const { source, examples, doc } = component.files;
  const [loaded, setLoaded] = useState<Loaded>({});
  const version = useDocsVersion();
  useEffect(() => {
    let current = true;
    const settle = <T,>(load: (() => Promise<T> | undefined) | null, key: keyof Loaded) => {
      Promise.resolve(load?.()).then((value) => { if (current && value !== undefined) setLoaded((l) => ({ ...l, [key]: value })); }).catch(() => {});
    };
    settle(doc ? () => loadComponentDoc(system, doc) : null, 'doc');
    settle(examples ? () => loadExamples(system, examples) : null, 'examples');
    settle(examples ? () => loadExamplesSource(system, examples) : null, 'source');
    settle(source ? () => loadProps(system, source) : null, 'props');
    return () => { current = false; };
  }, [system, source, examples, doc, version]);

  const stem = (source ?? component.name).replace(/^.*\//, '').replace(/\.[jt]sx$/, '');
  const docsLink = webLink(component.docsUrl) ?? webLink(origin === 'shadcn' && source ? shadcnDocsUrl(stem) : null);
  const Doc = loaded.doc;
  return (
    <>
      <div className="relative">
        <PageHeader
          title={component.title}
          description={component.description || docsLink ? (
            <>
              {component.description}
              {docsLink && (
                <a href={docsLink.href} target="_blank" rel="noreferrer" className={`block font-medium text-foreground underline underline-offset-4 ${component.description ? 'mt-2' : ''}`}>
                  {docsLink.hostname === 'ui.shadcn.com' ? 'shadcn/ui docs' : `Docs on ${docsLink.hostname}`} ↗
                </a>
              )}
            </>
          ) : undefined}
        />
        {onEdit && <Button variant="outline" size="sm" onClick={onEdit} className="absolute top-1 right-0">Edit</Button>}
      </div>
      {Doc ? <Prose className={PAGE_PROSE}><Doc /></Prose> : !doc && <Note>No page yet. Add <code>{stem}.md</code> next to the component to describe it and say when to use it.</Note>}

      <Section title="Examples">
        {!examples ? (
          <Note>No examples yet. Add <code>{stem}.examples.tsx</code> next to the component: each export named with a capital is one example.</Note>
        ) : loaded.examples && (
          <>
            <SystemFrame themeClass={sys.scopeClass}>
              <div className="space-y-5">
                {loaded.examples.map(({ name, Component }) => (
                  <div key={name}>
                    <h3 className="mb-2 text-xs font-medium text-muted-foreground">{sentence(name)}</h3>
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-6"><Component /></div>
                  </div>
                ))}
              </div>
            </SystemFrame>
            {loaded.source && (
              <Collapsible className="mt-4">
                <CollapsibleTrigger className="group flex cursor-pointer items-center gap-1.5 rounded-sm text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="text-muted-foreground transition-transform group-not-data-panel-open:-rotate-90" />
                  Show code
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2"><CodeBlock>{loaded.source}</CodeBlock></CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </Section>

      {source && loaded.props && (
        <Section title="Props">
          <div className="space-y-6">
            {loaded.props.map((c) => (
              <div key={c.name}>
                {loaded.props!.length > 1 && <h3 className="mb-2 font-mono text-sm text-foreground">{c.name}</h3>}
                {c.props.length > 0 && <PropsTable props={c.props} />}
                <p className={`text-sm text-muted-foreground ${c.props.length > 0 ? 'mt-2' : ''}`}>
                  {c.props.length === 0 && !c.native ? 'No props.' : c.native ? `${c.props.length ? 'Also accepts' : 'Accepts'} every native attribute of the element it renders.` : null}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <dl className="mt-12 text-sm">
        <dt className="text-muted-foreground">File</dt>
        <dd className="font-mono text-xs text-foreground">{sys.dir}{source ?? doc ?? examples}</dd>
      </dl>
    </>
  );
}
