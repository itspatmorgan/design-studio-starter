# Documentation module

Documentation opens at `/documentation` and combines a curated **Guide** at `/documentation/guide` with complete **Reference** at `/documentation/reference`. Guide chapters introduce the studio to people. References describe capabilities, boundaries, and implementation contracts available to people and agents. You do not need to read or change them to begin creating.

Follow the [Documentation standards](../../../handbook/rules/documentation-standards.md) when changing Guide or Reference content.

Use the two sidebar tabs to switch reading modes. Reference lists only areas with supplied documentation. Its overview explains how contracts join the agent’s working context and when to consult or change them. Separate contracts appear as child links. Each document has a collapsed **About this reference** section with its source path and related Handbook context and instructions. Visibility does not mean an agent automatically reads a reference.

The optional module retains the configuration ID `guide`; its public section key is `documentation`. Disable it through studio commands to hide the Guide and its rail entry. Reference discovery, search, and direct access belong to the shared platform and remain available when this module is disabled or removed. Prototype Documents is independent of both reading modes.

Right-click a file in either reading mode for **Edit source**, **Open in editor**, **Reveal in Finder**, **Copy link**, and **Copy path**. Local edits use the shared source editor and detect external changes before saving. Guide chapter edits preserve the complete underlying README. Platform documentation has no rename or delete actions in these menus. Published pages support copying links and paths; local editing and operating-system actions are unavailable.

- `module.ts`: who it is and its section.
- `app.tsx`: its rail button and routes.
- `pages/*.md`: the Guide's own pages, about the app as a whole, in the order their `order` frontmatter gives. Add a page by adding a file.
- A page for a module or file type is that folder's `README.md`, when it opens with Guide frontmatter: the Guide shows it down to a `## For developers` heading (`scripts/lib/guide-pages.js` finds them, `scripts/build/remark-readme-guide.js` trims them). Removing the folder removes the page.
- `src/platform/app/docs/DocumentationHeader.tsx`, `References.tsx`: the shared Documentation heading, Reference navigation, and reference metadata.
- `scripts/lib/platform-references.js`: indexes the same top-level core and enabled-module Markdown set as the shared reader. Related guidance comes from Handbook links and module declarations.
- `GuideLayout.tsx`, `GuidePage.tsx`, `loadGuide.ts`: the sidebar, reader, and enabled-page previous/next navigation. Releases remain outside the reading sequence.
- Diagrams are fenced `mermaid` blocks in the Markdown pages, rendered by the shared platform reader.

- `src/platform/app/docs/DocumentationNavItem.tsx`, `src/platform/app/shell/FileActionItems.tsx`: shared file-menu actions, also used by Handbook and prototype navigation.
- `src/platform/app/docs/DocumentationEditor.tsx`, `documentationSource.ts`, `scripts/build/files/documentation.js`: local reference source access, limited to indexed documentation, with version and size checks.
- `GuideEditor.tsx`, `source.ts`, `server.ts`: local Markdown editing through the shared source editor, with source allowlisting and version checks. Published builds omit the editor.
