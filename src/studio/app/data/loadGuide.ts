import type { MDXContent } from 'mdx/types';

export type GuideModule = { default: MDXContent; frontmatter?: { title?: string; description?: string; toc?: boolean } };

// Every Guide page. Vite only loads one when it is asked for.
export let pages = import.meta.glob<GuideModule>('/guide/*.mdx');

// A Guide page's module, by its slug (file name without .mdx), or undefined.
export function loadGuidePage(slug: string) {
  return pages[`/guide/${slug}.mdx`]?.();
}

// In dev, adding or removing a page changes the list above. Take it in place, like loadView.ts.
if (import.meta.hot) {
  import.meta.hot.accept((next) => { if (next) pages = next.pages; });
}
