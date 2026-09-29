# Documents

A document is written context in a prototype: problem framing, open questions, feedback, or handoff notes. Read this when the person asks for one. Human docs: the Guide's Documents page (`src/studio/guide/documents.mdx`).

- A document is any `.mdx` file in the prototype, at any depth, outside `components/`. There's nothing to register. Its URL is its path without the extension.
- Frontmatter is optional: `title`, `description`, and `toc: true` (an "On this page" list). Give it a `title`. Write plain Markdown; a small `<Callout title="…">` is built in.
- MDX is strict. In plain text, escape `{` and `<` (write `\{` or use backticks), or the file won't compile; the page shows the error.
- Link to views and other documents with relative paths: `[the flow](./lofi/main)`, `[notes](../research/interviews)`. Extensions are optional. Don't use absolute paths (`/patrick/...`), which break if the prototype is renamed.
- A document renders in the app's own style, not the prototype's design system. It can't embed a view or product components, so link instead. Don't import from views or `@/product/`.
- Don't add images; describe them or link to the live view instead.
- Keep it short enough to read. The interactive truth lives in the views.
- To create one for the person, write the file. The app shows it and updates as you edit.
