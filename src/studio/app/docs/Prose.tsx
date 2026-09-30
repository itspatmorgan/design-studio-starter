import type { ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { markdownComponents } from '@/studio/app/docs/markdownComponents';

// Compiled Markdown, styled as a document with Tailwind Typography:
// https://github.com/tailwindlabs/tailwindcss-typography
export function Prose({ children }: { children: ReactNode }) {
  return (
    <MDXProvider components={markdownComponents}>
      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-pre:border prose-pre:border-border prose-pre:bg-muted/50 prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none">
        {children}
      </div>
    </MDXProvider>
  );
}
