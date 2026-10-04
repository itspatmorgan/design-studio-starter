import type { MDXContent } from 'mdx/types';
import type { DocFrontmatter } from '@/platform/app/docs/types';

export type GuideModule = { default: MDXContent; frontmatter?: DocFrontmatter };

// Every Guide page: the Guide's own, and the READMEs of modules and file types, which are pages when they open with
// Guide frontmatter (the manifest says which). Vite only loads one when it is asked for.
const glob = import.meta.glob<GuideModule>(['/modules/documentation/pages/*.md', '/modules/*/README.md']);

// In dev, adding or removing a page makes Vite run this file again with a new list. The app
// keeps calling the function from the first run, so the list lives in state Vite keeps
// across runs (like loadView.ts).
const state: { pages: typeof glob } = import.meta.hot?.data.state ?? { pages: glob };

// A Guide page's module, by its slug (file name without .md, or its README's `source`), or undefined.
export function loadGuidePage(slug: string, source?: string) {
  return state.pages[source ?? `/modules/documentation/pages/${slug}.md`]?.();
}

if (import.meta.hot) {
  import.meta.hot.data.state = state;
  state.pages = glob;
  import.meta.hot.accept();
}
