# Documents

A document is written context in a prototype: problem framing, open questions, feedback, or handoff notes. Read this when the person asks for one. Human docs: the Guide's Documents page (`src/studio/guide/documents.md`).

- A document is any `.md` file in the prototype, at any depth, outside `components/`. There's nothing to register. Its URL is its path without the extension.
- Frontmatter is optional: `title`, `description`, and `toc: true` (an "On this page" list). Give it a `title`; without one, a first `# Heading` is used as the title. Write standard Markdown (CommonMark plus GitHub's tables, task lists, and strikethrough). No JSX, components, or raw HTML: they aren't rendered. A stray `{` or `<` is fine.
- Keep it portable: the file should read the same in Obsidian, GitHub, or any Markdown editor.
- Link to views and other documents with relative paths: `[the flow](./lofi/main)`, `[notes](../research/interviews)`. Extensions are optional. Don't use absolute paths (`/patrick/...`), which break if the prototype is renamed.
- A document renders in the app's own style, not the prototype's design system. It can't embed a view, so link instead. Don't import from views or `@/systems/product/`.
- Don't add images; describe them or link to the live view instead.
- Keep it short enough to read. The interactive truth lives in the views.
- To create one for the person, write the file. The app shows it and updates as you edit.
