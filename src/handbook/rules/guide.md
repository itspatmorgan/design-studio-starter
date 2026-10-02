# Guide

The Guide is the human documentation, shown in the app at `/guide`, from Markdown pages. It is a module, so it can be turned off, and its pages go with it.

- **A page is a `.md` file** in `src/platform/modules/guide/pages/`, for what is about the app as a whole (getting started, agents, scopes). The file name is its address (`modules.md` is `/guide/modules`).
- **A module or file type's page lives in its README.** `src/platform/modules/<id>/README.md` or `src/platform/fileTypes/<type>/README.md` is a Guide page when it opens with the same frontmatter (and optionally `slug`, the address; the folder's name otherwise). The page is the README down to a `## For developers` heading, which starts what only people working on the code need (files, how it's built, how to remove it); the README's own `# ` title line is left out of the page. Put a feature's page here, so it goes with the folder when the module is removed.
- **Frontmatter**: `title` and `description` are required; `order` (a number) places it in the sidebar; `section` groups it under a heading (pages with no section come first); `toc: true` adds an "On this page" list.
- **Plain Markdown only.** No JSX, no expressions, and raw HTML shows as text. Code blocks are highlighted.
- **Write for designers, product managers, and engineers**: plain words, short sentences, what to do before how it works. The Guide describes what the person can do; the agent's instructions belong in the Handbook's rules.
- **Link between pages** with `/guide/<page>`. A link to a page that doesn't exist is dead, so check the address.
- After adding or renaming a page, no other file needs changing: the sidebar and the palette are built from the files.
