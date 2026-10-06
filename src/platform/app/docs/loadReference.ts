import type { MDXContent } from 'mdx/types';
import type { DocFrontmatter } from './types';

type Reference = { default: MDXContent; frontmatter?: DocFrontmatter };
// The build replaces this with owner READMEs and enabled module documents.
const pages = import.meta.glob<Reference>(['/__studio_references__/*'], { query: '?reference' });

export function loadReference(path: string) {
  return Object.hasOwn(pages, path) ? pages[path]() : undefined;
}
