import { useEffect, useRef } from 'react';
import type { MDXContent } from 'mdx/types';
import { DocToc } from '@/studio/app/docs/DocToc';
import { Prose } from '@/studio/app/docs/Prose';

type DocLayoutProps = { Component: MDXContent; title?: string; description?: string; toc?: boolean };

// A Markdown document: title and description from its frontmatter, the content,
// and an "On this page" list when the frontmatter says `toc: true`.
export function DocLayout({ Component, title, description, toc }: DocLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Open at the heading in the URL (/guide/prototypes#groups), or at the top.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (target) target.scrollIntoView({ block: 'start' });
    else contentRef.current?.closest('[data-doc-scroll]')?.scrollTo({ top: 0 });
  }, [Component]);

  return (
    <div className="mx-auto flex max-w-5xl items-start justify-center gap-12 px-8 pt-12 pb-24">
      <article ref={contentRef} className="min-w-0 max-w-[65ch] flex-1">
        {(title || description) && (
          <header className="mb-10">
            {title && <h1 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>}
            {description && <p className="text-base leading-relaxed text-muted-foreground">{description}</p>}
          </header>
        )}
        <Prose><Component /></Prose>
      </article>
      {toc && <DocToc contentRef={contentRef} watch={Component} />}
    </div>
  );
}
