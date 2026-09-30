import type { ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { markdownComponents } from '@/studio/app/docs/markdownComponents';
import { cn } from '@/lib/utils';

// Compiled Markdown, styled as a document with Tailwind Typography (the small size, 14px):
// https://github.com/tailwindlabs/tailwindcss-typography
// `className` adjusts it for one place, like a smaller heading scale.
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MDXProvider components={markdownComponents}>
      <div className={cn("prose prose-sm prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-8 prose-pre:border prose-pre:border-border prose-pre:bg-muted/50 prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none", className)}>
        {children}
      </div>
    </MDXProvider>
  );
}
