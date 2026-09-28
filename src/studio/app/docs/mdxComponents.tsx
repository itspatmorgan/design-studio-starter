import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import type { MDXComponents } from 'mdx/types';

// Styling for Markdown comes from Tailwind Typography's `prose` classes (see Prose).
// This map covers only what CSS can't: app links navigate without a reload, and
// outside links open in a new tab.
function MdxLink({ href = '', ...props }: ComponentProps<'a'>) {
  if (href.startsWith('/')) return <Link to={href as never} {...props} />;
  if (href.startsWith('#')) return <a href={href} {...props} />;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
}

// A highlighted note. In MDX: <Callout title="Heads up">Text</Callout>
function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm leading-relaxed">
      {title && <p className="mb-1 font-semibold text-foreground">{title}</p>}
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

export const mdxComponents: MDXComponents = { a: MdxLink, Callout };
