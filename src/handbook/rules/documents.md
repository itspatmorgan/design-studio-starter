# Documents

This rule applies to prototype Markdown when Documents is enabled. Format and rendering are described in the [module README](../../platform/modules/document/README.md).

- Write prototype-specific context in a `.md` file outside underscore helpers. No registration is required.
- Use plain Markdown. Do not add JSX or embedded components.
- Use fenced `mermaid` code blocks for diagrams. Include `accTitle` and `accDescr` for accessible descriptions. The platform renders the diagram from its text; no image file is needed.
- Give the page a frontmatter title or an opening level-one heading.
- Link to prototype items with relative paths. Include file extensions for links intended to work in ordinary Markdown readers.
- Studio links accept omitted extensions, but other readers may not resolve them.
- With Diagrams enabled, embed an existing diagram from the same prototype using `![Description](flow.mermaid)` on its own line. `.mmd` is also supported. Use a relative path; do not copy its source into a Mermaid fence.
- Link to views instead of embedding them. Ordinary image files remain outside the prototype document convention.
- Put shared product context in the Handbook instead.
- Apply the [contributor scope rule](contributor-scope.md) before editing.

Write the file directly for the person. The local app discovers it and reflects edits.
