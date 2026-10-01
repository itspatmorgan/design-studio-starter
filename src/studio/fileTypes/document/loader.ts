import type { MDXContent } from 'mdx/types';
import { createLoader } from '@/studio/app/data/createLoader';
import type { DocFrontmatter } from '@/studio/app/docs/types';

// A document's compiled Markdown: its content, and its frontmatter block.
export type DocumentModule = { default: MDXContent; frontmatter?: DocFrontmatter };

// Every .md file in a prototype, at any depth, and in the Handbook. Helpers (names starting with an underscore) aren't documents.
export const documents = createLoader<DocumentModule>(
  import.meta.glob<DocumentModule>(['/prototypes/**/*.md', '!/prototypes/**/_*/**', '!/prototypes/**/_*', '/handbook/**/*.md']),
  import.meta.hot,
);

// Vite runs this file again when a file is added or removed, with the new list (createLoader.ts).
if (import.meta.hot) import.meta.hot.accept();
