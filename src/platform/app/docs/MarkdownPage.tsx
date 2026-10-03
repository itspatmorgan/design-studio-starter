// One document, in the app's own style (not its prototype's design system), inside an error
// boundary: a document that fails to render shows the error, with a button to copy it.
import type { ReactNode } from 'react';
import type { MDXContent } from 'mdx/types';
import { ErrorBoundary } from 'react-error-boundary';
import { DocBase } from '@/platform/app/docs/DocBase';
import { DocLayout } from '@/platform/app/docs/DocLayout';
import type { DocFrontmatter } from '@/platform/app/docs/types';
import ViewError from '@/platform/modules/prototypes/viewer/ViewError';

// docKey (contributor/prototype/path) resets the error boundary when the document changes,
// and so does a new Component (the file was fixed, in dev).
export default function MarkdownPage({ Component, frontmatter, docKey, base, footer }: {
  Component: MDXContent;
  frontmatter: DocFrontmatter;
  docKey: string;
  base: string;
  footer?: ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <ErrorBoundary resetKeys={[docKey, Component]} FallbackComponent={ViewError}>
        {/* data-doc-scroll: where DocLayout scrolls to the top or to a heading. `relative` keeps the
            hidden heading Markdown footnotes add (position: absolute) inside this box; otherwise it
            sits against the page, which then scrolls when you follow a footnote link. */}
        <div data-doc-scroll className="relative h-full overflow-y-auto bg-background text-foreground">
          <DocBase.Provider value={base}>
            <DocLayout Component={Component} title={frontmatter.title} description={frontmatter.description} toc={frontmatter.toc} scrollKey={docKey} footer={footer} />
          </DocBase.Provider>
        </div>
      </ErrorBoundary>
    </div>
  );
}
