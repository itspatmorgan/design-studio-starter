import moduleEntries from './scripts/build/vite-module-entries-plugin.js';
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkHtmlAsText from './scripts/build/remark-html-as-text.js';
import remarkTitleFromHeading from './scripts/build/remark-title-from-heading.js';
import remarkReadmeGuide from './scripts/build/remark-readme-guide.js';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import tailwindcss from '@tailwindcss/vite';
import importGuard from './scripts/build/vite-import-guard-plugin.js';
import manifestWatch from './scripts/build/vite-manifest-watch-plugin.js';
import spa404 from './scripts/build/vite-spa-404-plugin.js';
import files from './scripts/build/vite-files-plugin.js';
import markdownRefresh from './scripts/build/vite-markdown-refresh-plugin.js';
import systemProps from './src/platform/modules/systems/node/props-plugin.js';
import globs from './scripts/build/vite-globs-plugin.js';
import css from './scripts/build/vite-css-plugin.js';
import { ENABLED_MODULES, PROTOTYPE_DIRS } from './scripts/lib/modules.js';

// Prototype documents (src/prototypes/ and the modules' prototype-shaped folders, like src/examples/) refresh in
// place through scripts/build/vite-markdown-refresh-plugin.js, so React Fast Refresh leaves them alone.
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const prototypeFolders = ['prototypes', ...PROTOTYPE_DIRS.map((dir: string) => path.basename(dir))].map(escapeRegExp).join('|');

// References use the same plain-Markdown pipeline, with the full README retained.
function markdown(reference = false) {
  const plugin = mdx({
    format: 'md',
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [remarkFrontmatter, ...(reference ? [remarkTitleFromHeading, () => remarkReadmeGuide({ full: true })] : [remarkReadmeGuide, remarkTitleFromHeading]), remarkMdxFrontmatter, remarkGfm, remarkHtmlAsText],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: { light: 'github-light', dark: 'github-dark' }, keepBackground: false }]],
  });
  const transform = plugin.transform;
  return {
    ...plugin,
    name: reference ? 'studio-reference-markdown' : 'studio-markdown',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (id.includes('?reference') !== reference) return null;
      return transform.call(this, code, id);
    },
  };
}

// A module with `lib: true` gives prototypes one door in: `import ... from '@module/<id>'` is its lib/index.
const moduleLibs = ENABLED_MODULES.filter((m: { lib?: boolean }) => m.lib).map((m: { id: string }) => ({
  find: `@module/${m.id}`, replacement: fileURLToPath(new URL(`./src/platform/modules/${m.id}/lib/index`, import.meta.url)),
}));

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: { outDir: '../dist', emptyOutDir: true },
  // The Source view's editor (SourcePane.tsx) loads its languages on demand, so Vite would find these packages
  // only when you first open it, re-bundle them, and end up with two copies of @codemirror/state: the editor
  // then fails with "Unrecognized extension value". Listing them bundles them together at start.
  optimizeDeps: {
    include: [
      '@codemirror/state', '@codemirror/view', '@codemirror/commands', '@codemirror/autocomplete', '@codemirror/language',
      '@codemirror/search', '@codemirror/lang-javascript', '@codemirror/lang-markdown', '@codemirror/lang-yaml',
      '@lezer/common', '@lezer/highlight', '@lezer/markdown',
    ],
  },
  resolve: {
    alias: [{ find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) }, ...moduleLibs],
  },
  plugins: [
    // Markdown pages (Guide pages in src/platform/modules/guide/pages/, and prototype documents), as plain
    // Markdown (no JSX or expressions, so any .md file compiles; raw HTML shows as text): frontmatter (a first heading is the title when there's no `title`), GitHub-style Markdown, heading ids, and code highlighting with Shiki in both color modes.
    markdown(),
    markdown(true),
    // Prototype documents refresh through scripts/build/vite-markdown-refresh-plugin.js instead.
    react({ include: /\.(md|[jt]sx)$/, exclude: new RegExp(`[\\\\/](${prototypeFolders})[\\\\/].*\\.md$`) }),
    markdownRefresh(),
    importGuard(),
    css(),
    tailwindcss(),
    globs(),
    moduleEntries(),
    manifestWatch(),
    files(),
    systemProps(),
    spa404(),
  ],
});
