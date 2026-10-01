import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkHtmlAsText from './scripts/remark-html-as-text.js';
import remarkTitleFromHeading from './scripts/remark-title-from-heading.js';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import tailwindcss from '@tailwindcss/vite';
import importGuard from './scripts/vite-import-guard-plugin.js';
import manifestWatch from './scripts/vite-manifest-watch-plugin.js';
import spa404 from './scripts/vite-spa-404-plugin.js';
import files from './scripts/vite-files-plugin.js';
import markdownRefresh from './scripts/vite-markdown-refresh-plugin.js';
import systemProps from './scripts/vite-system-props-plugin.js';
import globs from './scripts/vite-globs-plugin.js';
import { PROTOTYPE_DIRS } from './scripts/lib/modules.js';

// Prototype documents (src/prototypes/ and the modules' prototype-shaped folders, like src/tools/) refresh in
// place through scripts/vite-markdown-refresh-plugin.js, so React Fast Refresh leaves them alone.
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const prototypeFolders = ['prototypes', ...PROTOTYPE_DIRS.map((dir: string) => path.basename(dir))].map(escapeRegExp).join('|');

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: { outDir: '../dist', emptyOutDir: true },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    // Markdown pages (Guide pages in src/studio/guide/, and prototype documents), as plain
    // Markdown (no JSX or expressions, so any .md file compiles; raw HTML shows as text): frontmatter (a first heading is the title when there's no `title`), GitHub-style Markdown, heading ids, and code highlighting with Shiki in both color modes.
    {
      enforce: 'pre',
      ...mdx({
        format: 'md',
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkFrontmatter, remarkTitleFromHeading, remarkMdxFrontmatter, remarkGfm, remarkHtmlAsText],
        rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: { light: 'github-light', dark: 'github-dark' }, keepBackground: false }]],
      }),
    },
    // Prototype documents refresh through scripts/vite-markdown-refresh-plugin.js instead.
    react({ include: /\.(md|[jt]sx)$/, exclude: new RegExp(`[\\\\/](${prototypeFolders})[\\\\/].*\\.md$`) }),
    markdownRefresh(),
    tailwindcss(),
    importGuard(),
    globs(),
    manifestWatch(),
    files(),
    systemProps(),
    spa404(),
  ],
});
