import type { MDXContent } from 'mdx/types';
import { createLoader } from '@/studio/app/data/createLoader';
import type { DocFrontmatter } from '@/studio/app/docs/types';

// A document's compiled Markdown: its content, and its frontmatter block.
export type DocumentModule = { default: MDXContent; frontmatter?: DocFrontmatter };

// Every .md file in a prototype or tool, at any depth, and in the Handbook. Helpers (names starting with an underscore) aren't documents.
// studioGlobs() is replaced by the list of patterns when Vite reads this file (scripts/build/vite-globs-plugin.js).
export const documents = createLoader<DocumentModule>(
  import.meta.glob<DocumentModule>(studioGlobs()),
  import.meta.hot,
);

// Vite runs this file again when a file is added or removed, with the new list (createLoader.ts).
if (import.meta.hot) import.meta.hot.accept();
