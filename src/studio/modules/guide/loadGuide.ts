import type { MDXContent } from 'mdx/types';
import type { DocFrontmatter } from '@/studio/app/docs/types';

export type GuideModule = { default: MDXContent; frontmatter?: DocFrontmatter };

// Every Guide page. Vite only loads one when it is asked for.
const glob = import.meta.glob<GuideModule>('/studio/guide/*.md');

// In dev, adding or removing a page makes Vite run this file again with a new list. The app
// keeps calling the function from the first run, so the list lives in state Vite keeps
// across runs (like loadView.ts).
const state: { pages: typeof glob } = import.meta.hot?.data.state ?? { pages: glob };

// A Guide page's module, by its slug (file name without .md), or undefined.
export function loadGuidePage(slug: string) {
  return state.pages[`/studio/guide/${slug}.md`]?.();
}

if (import.meta.hot) {
  import.meta.hot.data.state = state;
  state.pages = glob;
  import.meta.hot.accept();
}
