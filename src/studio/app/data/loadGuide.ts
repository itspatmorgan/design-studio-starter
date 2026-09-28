import type { MDXContent } from 'mdx/types';

export type GuideModule = { default: MDXContent; frontmatter?: { title?: string; description?: string; toc?: boolean } };

// Every Guide page. Vite only loads one when it is asked for.
const pages = import.meta.glob<GuideModule>('/guide/*.mdx');

// A Guide page's module, by its slug (file name without .mdx), or undefined.
export function loadGuidePage(slug: string) {
  return pages[`/guide/${slug}.mdx`]?.();
}
