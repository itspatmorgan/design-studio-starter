# Documentation contract

The Documentation module owns the human Guide at `/documentation/guide`. The shared platform owns Reference at `/documentation/reference`. Guide chapters explain using Studio; Reference displays the technical contracts in their original source files.

## Guide chapters

All human chapters live in `src/modules/documentation/pages/*.md`. Module READMEs are not Guide sources. Each chapter requires `title` and numeric `order` frontmatter. Optional `description` supplies a summary; optional `section` groups chapters in navigation. The filename supplies its URL slug; `index.md` opens at the Guide root.

A chapter about a capability declares `module: <id>`. Discovery includes it only when that module is installed and enabled. Disabling or removing the capability preserves the chapter file but hides it from navigation, search, and direct reading routes. Chapters without a module association remain available whenever the Guide is enabled.

Invalid chapter metadata produces a local warning and fails a strict build. Locally, source mode keeps malformed chapters repairable. Guide previous/next navigation follows the discovered reading order.

## Reference sources

Reference discovers top-level Markdown under `src/platform/core/`, the shared `src/modules/README.md` contract, and enabled modules’ folders. Module documents contain technical requirements and implementation details. They do not also supply human chapters.

Core pages use `referenceSection` (`understand`, `operate`, or `extend`) and optional numeric `referenceOrder`. Unclassified core pages appear under Extend Studio. Capability documents use their canonical titles. A module with one contract displays one navigation item; additional contracts stay under their owning module.

Related operating instructions are selected per document from system-content links. A module's primary contract (`README.md` or `reference.md`) also includes its declared instructions. The source path and related links appear under About this reference. Availability does not establish that an agent read a file.

## Availability and search

Disabling or removing Documentation hides the Guide and its rail entry. Reference discovery and direct access remain available through the shared platform. Prototype Documents is independent of both readers.

The command palette lists discovered Reference pages and enabled Guide chapters, labeled by reading mode. Search matches titles and source paths, not full document text.

## Source access

Guide and Reference each edit their own complete source document. They never edit another reading mode’s source implicitly. Navigation provides Edit source, Open in editor, Reveal in Finder, Copy link, and Copy path where local permissions allow them. Platform documentation has no rename or delete actions in these menus.

The [shared editor](../../platform/core/source.md) supplies keyboard controls, version checks, and unsaved-change handling. Published pages support reading and copying without repository editing or operating-system actions.

Source access is limited to indexed documentation and local Guide Markdown, including malformed chapters that need repair. Removing a capability removes its contracts from the allowlist; retained Guide files stay locally repairable.

## Implementation

- `module.ts`, `app.tsx`: module identity, rail entry, and Guide routes.
- `pages/*.md`: human chapters, ordered and filtered by their metadata.
- `GuideLayout.tsx`, `GuidePage.tsx`, `loadGuide.ts`: Guide navigation and reading.
- `src/platform/app/docs/References.tsx`: shared Reference navigation and overview.
- `scripts/build/build-manifest.js`: Guide discovery and validation.
- `scripts/lib/platform-references.js`: contract indexing and related instructions.
- `scripts/build/remark-title-from-heading.js`: extracts opening Markdown headings without hiding document sections.
- `src/platform/app/docs/DocumentationEditor.tsx`, `documentationSource.ts`, `scripts/build/files/source.js`: local allowlisted source editing.

Follow [Documentation standards](../../systems/studio/rules/documentation-standards.md) for writing policy and the [Maintain documentation skill](../../systems/studio/skills/maintain-documentation/SKILL.md) for verification.
