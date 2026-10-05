# Document contract

Prototype documents are `.md` files rendered as plain Markdown, with optional frontmatter for title, description, and contents navigation. They do not execute JSX; raw HTML is displayed as text. The shared reader supplies GitHub-style Markdown, code highlighting, Mermaid fences, and same-prototype artifact embeds.

This module owns prototype Markdown. System knowledge and the Guide retain independent Markdown support when it is disabled or removed. Source access follows prototype ownership and the [shared editor contract](../../platform/core/source.md).

## Implementation

This optional module owns prototype Markdown. Follow the [module rule](../../systems/studio/rules/modules.md) for removal. See the [file-type contract](../../platform/core/fileTypes.md) for extension behavior.

- `type.ts`: what the build reads: the `.md` extension, a template (a title and an empty-document line), and the checks on frontmatter.
- `open.tsx`: the icon, how a document loads, and its page.
- `src/platform/app/docs/`: the shared Markdown reader and page style. The system context uses this reader independently.
- `scripts/build/rehype-mermaid.js`: preserves Mermaid fences before code highlighting. The shared reader maps them to `MermaidDiagram.tsx` for lazy SVG rendering.
- `loader.ts`: the glob of document files for the deployed site.

Agent contract: `src/systems/studio/rules/documents.md`.
