# Documents

This rule applies to prototype Markdown when Documents is enabled. Format and rendering are described in the [module README](../../../platform/modules/document/README.md).

- Write prototype-specific context in a `.md` file outside underscore helpers. No registration is required.
- Use plain Markdown. Do not add JSX or embedded components.
- Use fenced `mermaid` code blocks for diagrams. Include `accTitle` and `accDescr` for accessible descriptions. The platform renders the diagram from its text; no image file is needed.
- Give the page a frontmatter title or an opening level-one heading.
- Link to prototype artifacts with relative paths. Include file extensions for links intended to work in ordinary Markdown readers.
- Studio links accept omitted extensions, but other readers may not resolve them.
- Embed a file from the same prototype using Markdown image syntax on its own line: `![Description](flow.mermaid)`, `![Screen](app/main.tsx)`, or `![Exploration](breadboard.excalidraw)`. The corresponding module must be enabled. Use relative paths with extensions.
- File embeds show read-only previews and an Open link; files without previews, including documents, show cards. Canvas previews keep documents and other canvases as cards to bound nesting.
- Reference the original file instead of copying diagram source or screen code into the document. Ordinary image files remain outside the prototype document convention.
- Put shared product context in the system context instead.
- Apply the [contributor scope rule](contributor-scope.md) before editing.

Write the file directly for the person. The local app discovers it and reflects edits.
