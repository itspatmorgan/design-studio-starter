import { useContext, type ComponentProps, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import type { MDXComponents } from 'mdx/types';
import { DocBase } from '@/studio/app/docs/DocBase';
import { fileTypeOf } from '@/studio/app/data/fileTypes';
import { itemSlug } from '@/fileTypes';

// Styling for Markdown comes from Tailwind Typography's `prose` classes (see Prose).
// This map covers only what CSS can't: app links navigate without a reload, and
// outside links open in a new tab. In a prototype document, a link like ./main or
// ../lofi/main.tsx is relative to the document, so it keeps working if the prototype's
// folder is renamed. (Moving the document or the file it points to still breaks it.)
function MdxLink({ href = '', ...props }: ComponentProps<'a'>) {
  const base = useContext(DocBase);
  if (href.startsWith('/') && !href.startsWith('//')) return <Link to={href as never} {...props} />;
  if (href.startsWith('#')) return <a href={href} {...props} />;
  if (base !== null && !href.startsWith('?') && !/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
    const url = new URL(href, `http://doc${base}/`);
    const to = fileTypeOf(url.pathname) ? itemSlug(url.pathname) : url.pathname;
    return <Link to={to as never} hash={url.hash.slice(1) || undefined} {...props} />;
  }
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
