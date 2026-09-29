import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import tailwindcss from '@tailwindcss/vite';
import importGuard from './scripts/vite-import-guard-plugin.js';
import manifestWatch from './scripts/vite-manifest-watch-plugin.js';
import spa404 from './scripts/vite-spa-404-plugin.js';
import files from './scripts/vite-files-plugin.js';
import mdxRefresh from './scripts/vite-mdx-refresh-plugin.js';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: { outDir: '../dist', emptyOutDir: true },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    // Markdown pages (Guide pages in src/studio/guide/, and prototype documents): frontmatter,
    // GitHub-style Markdown, heading ids, and code highlighting with Shiki in both color modes.
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: { light: 'github-light', dark: 'github-dark' }, keepBackground: false }]],
      }),
    },
    // Prototype documents refresh through scripts/vite-mdx-refresh-plugin.js instead.
    react({ include: /\.(mdx|[jt]sx)$/, exclude: /[\\/]prototypes[\\/].*\.mdx$/ }),
    mdxRefresh(),
    tailwindcss(),
    importGuard(),
    manifestWatch(),
    files(),
    spa404(),
  ],
});
