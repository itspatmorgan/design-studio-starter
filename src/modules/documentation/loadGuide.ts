import { createMarkdownLoader } from '@/platform/app/docs/createMarkdownLoader';
import type { MDXContent } from 'mdx/types';
import type { DocFrontmatter } from '@/platform/app/docs/types';

export type GuideModule = { default: MDXContent; frontmatter?: DocFrontmatter };

// Human chapters live only in the Guide folder. Vite loads a chapter on demand.
const glob = import.meta.glob<GuideModule>('/modules/documentation/pages/*.md');

const load = createMarkdownLoader(glob, import.meta.hot);

export function loadGuidePage(slug: string, source?: string) {
  return load(source ?? `/modules/documentation/pages/${slug}.md`);
}

if (import.meta.hot) import.meta.hot.accept();
