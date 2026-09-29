// One document, in the app's own style (not its prototype's design system), inside an error
// boundary: a document that fails to render shows the error, with a button to copy it.
import type { MDXContent } from 'mdx/types';
import { ErrorBoundary } from 'react-error-boundary';
import { DocBase } from '@/studio/app/docs/DocBase';
import { DocLayout } from '@/studio/app/docs/DocLayout';
import type { DocFrontmatter } from '@/studio/app/docs/types';
import ViewError from '@/studio/app/pages/prototype/ViewError';

// docKey (contributor/prototype/path) resets the error boundary when the document changes,
// and so does a new Component (the file was fixed, in dev).
export default function DocumentPage({ Component, frontmatter, docKey, base }: {
  Component: MDXContent;
  frontmatter: DocFrontmatter;
  docKey: string;
  base: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <ErrorBoundary resetKeys={[docKey, Component]} FallbackComponent={ViewError}>
        {/* data-doc-scroll: where DocLayout scrolls to the top or to a heading */}
        <div data-doc-scroll className="h-full overflow-y-auto bg-background text-foreground">
          <DocBase.Provider value={base}>
            <DocLayout Component={Component} title={frontmatter.title} description={frontmatter.description} toc={frontmatter.toc} scrollKey={docKey} />
          </DocBase.Provider>
        </div>
      </ErrorBoundary>
    </div>
  );
}
