import { useEffect, useState } from 'react';
import type { MDXContent } from 'mdx/types';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { CodeBlock, PageHeader, SystemFrame } from '@/studio/app/pages/systems/foundations';
import { Prose } from '@/studio/app/docs/Prose';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/studio/components/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/studio/components/table';
import { loadComponentDoc, loadExamples, loadExamplesSource, loadProps, type Example } from '@/studio/app/data/loadSystemDocs';
import type { ComponentPropsDoc, PropDoc, SystemComponentDoc } from '@/studio/systemDocs';
import type { DesignSystem } from '@/studio/app/data/types';

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

function PropsTable({ props }: { props: PropDoc[] }) {
  return (
    <div className="rounded-lg border border-border">
      <Table className="text-[13px]">
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="px-3 text-xs text-muted-foreground">Prop</TableHead>
            <TableHead className="px-3 text-xs text-muted-foreground">Type</TableHead>
            <TableHead className="px-3 text-xs text-muted-foreground">Default</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((p) => (
            <TableRow key={p.name} className="align-top">
              <TableCell className="px-3 py-2 align-top font-mono text-xs text-foreground">
                {p.name}{p.required && <span className="text-destructive" title="Required"> *</span>}
                {p.description && <div className="mt-1 max-w-xs font-sans text-xs font-normal whitespace-normal text-muted-foreground">{p.description}</div>}
              </TableCell>
              <TableCell className="px-3 py-2 align-top font-mono text-xs whitespace-normal text-foreground/90" title={p.type}>{p.type.length > 70 ? `${p.type.slice(0, 70)}…` : p.type}</TableCell>
              <TableCell className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">{p.default ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ComponentDocPage({ system, sys, component }: { system: string; sys: DesignSystem; component: SystemComponentDoc }) {
  const { source, examples, doc } = component.files;
  const [loaded, setLoaded] = useState<Loaded>({});
  useEffect(() => {
    let current = true;
    setLoaded({});
    const settle = <T,>(load: (() => Promise<T> | undefined) | null, key: keyof Loaded) => {
      Promise.resolve(load?.()).then((value) => { if (current && value !== undefined) setLoaded((l) => ({ ...l, [key]: value })); }).catch(() => {});
    };
    settle(doc ? () => loadComponentDoc(system, doc) : null, 'doc');
    settle(examples ? () => loadExamples(system, examples) : null, 'examples');
    settle(examples ? () => loadExamplesSource(system, examples) : null, 'source');
    settle(source ? () => loadProps(system, source) : null, 'props');
    return () => { current = false; };
  }, [system, source, examples, doc]);

  const stem = (source ?? component.name).replace(/^.*\//, '').replace(/\.[jt]sx$/, '');
  const Doc = loaded.doc;
  return (
    <>
      <PageHeader title={component.title} description={component.description || undefined} />
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
