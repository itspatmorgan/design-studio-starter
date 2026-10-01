# Guide

The Guide is the human documentation, shown in the app at `/guide`, from the Markdown pages in `src/studio/guide/`. It is a module, so it can be turned off, and its pages go with it.

- **A page is a `.md` file** in `src/studio/guide/`. The file name is its address (`modules.md` is `/guide/modules`).
- **Frontmatter**: `title` and `description` are required; `order` (a number) places it in the sidebar; `section` groups it under a heading (pages with no section come first); `toc: true` adds an "On this page" list.
- **Plain Markdown only.** No JSX, no expressions, and raw HTML shows as text. Code blocks are highlighted.
- **Write for designers, product managers, and engineers**: plain words, short sentences, what to do before how it works. The Guide describes what the person can do; the agent's instructions belong in the Handbook's rules.
- **Link between pages** with `/guide/<page>`. A page that isn't in `src/studio/guide/` is a broken link, and the build says so.
- After adding or renaming a page, no other file needs changing: the sidebar and the palette are built from the files.
