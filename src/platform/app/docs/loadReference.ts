import { createMarkdownLoader } from './createMarkdownLoader';
import type { MDXContent } from 'mdx/types';
import type { DocFrontmatter } from './types';

type Reference = { default: MDXContent; frontmatter?: DocFrontmatter };
// The build replaces this with owner READMEs and enabled module documents.
const pages = import.meta.glob<Reference>(['/__studio_references__/*'], { query: '?reference' });

export const loadReference = createMarkdownLoader(pages, import.meta.hot, true);
if (import.meta.hot) import.meta.hot.accept();
