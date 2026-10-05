# Diagram contract

A standalone diagram is one plain Mermaid diagram in a `.mermaid` or `.mmd` file, without Markdown fences. The file-type declaration supplies its editor language and preview surfaces; the shared renderer validates syntax when opened. Invalid diagrams remain available for source repair.

The optional module owns standalone files. Markdown Mermaid fences remain a shared-reader capability when this module is disabled or removed. Follow the [file-type contract](../../platform/context/file-types.md) for discovery, embeds, and disabled-file behavior.

## Implementation

- `module.ts`: optional module identity and agent routing.
- `type.ts`: `.mermaid` and `.mmd` extensions, plain text editing, new-file template, and canvas preview capability.
- `loader.ts`: raw source globs supplied by the shared file-type build layer; published archives are excluded.
- `load.ts`: local file reads and published source loading.
- `open.tsx`, `Diagram.tsx`, `DiagramEmbed.tsx`: page presentation, live local updates, and compact canvas previews.
- `src/platform/app/diagrams/`: shared Mermaid renderer and theme, independent of this optional module. Markdown maps its Mermaid fences to the same component.

The module adds a prototype file type rather than a separate rail destination. It does not add dependencies or a second renderer. Source syntax is validated when rendered, so malformed diagrams can still be opened and edited. Shared source editing supplies file permissions and conflict protection.
