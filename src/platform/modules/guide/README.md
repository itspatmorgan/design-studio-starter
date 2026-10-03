# Documentation module

Documentation combines a curated **Guide** at `/guide` with complete **Reference** at `/reference`. Guide chapters introduce the studio to people. References describe capabilities, boundaries, and implementation contracts available to people and agents. You do not need to read or change them to begin creating.

Use the two sidebar tabs to switch reading modes. Reference lists only areas with supplied documentation. Separate contracts appear as child links. Each document has a collapsed **About this reference** section with its source path and related Handbook context and instructions. Visibility does not mean an agent automatically reads a reference.

The optional module retains the ID `guide` and existing Guide URLs. Disable it through studio commands to hide the Guide and its rail entry. Reference discovery, search, and direct access belong to the shared platform and remain available when this module is disabled or removed. Prototype Documents is independent of both reading modes.

- `module.ts`: who it is and its section.
- `app.tsx`: its rail button and routes.
- `pages/*.md`: the Guide's own pages, about the app as a whole, in the order their `order` frontmatter gives. Add a page by adding a file.
- A page for a module or file type is that folder's `README.md`, when it opens with Guide frontmatter: the Guide shows it down to a `## For developers` heading (`scripts/lib/guide-pages.js` finds them, `scripts/build/remark-readme-guide.js` trims them). Removing the folder removes the page.
- `src/platform/app/docs/DocumentationHeader.tsx`, `References.tsx`: the shared Documentation heading, Reference navigation, and reference metadata.
- `scripts/lib/platform-references.js`: indexes the same top-level core and enabled-module Markdown set as the shared reader. Related guidance comes from Handbook links and module declarations.
- `GuideLayout.tsx`, `GuidePage.tsx`, `loadGuide.ts`: the sidebar, reader, and enabled-page previous/next navigation. Releases remain outside the reading sequence.
- Diagrams are fenced `mermaid` blocks in the Markdown pages, rendered by the shared platform reader.

- `GuideEditor.tsx`, `source.ts`, `server.ts`: local Markdown editing through the shared source editor, with source allowlisting and version checks. Published builds omit the editor.
