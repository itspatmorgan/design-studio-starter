# Documentation contract

The Documentation module owns the human Guide at `/documentation/guide`. The shared platform owns the Context and Skills browser at `/documentation/context/<owner>`. Guide chapters explain using Studio; the browser displays original README, context, and skill files.

## Guide chapters

Human chapters live in `src/modules/documentation/pages/*.md`. Each requires `title` and numeric `order` frontmatter. Optional `description` supplies a summary; `section` groups navigation. The filename supplies its slug; `index.md` opens at the Guide root.

A capability chapter declares `module: <id>`. Discovery includes it only when the module is installed and enabled. Disabling or removing the capability preserves the chapter but hides its reading route, navigation, and search target. Unassociated chapters remain available while Guide is enabled.

Invalid metadata produces a local warning and fails strict builds. Source mode keeps malformed chapters repairable. Previous/next navigation follows discovered order.

## Context and Skills sources

The shared browser uses registered owners from the manifest: Platform, enabled modules, and registered systems. Each owner's Overview renders its canonical README when present; without one it displays discovered context and skills. Additional top-level module contracts remain accessible under that owner.

A full-width Studio select switches between Platform, modules, and systems using their names. Context, Skills, and their folders start expanded; people can collapse them while browsing.

Platform knowledge lives in `src/platform/context/`, including detailed requirements under `technical/`. Module and system context and skills live under their respective owners. Component API pages remain beside components and are exposed by Systems.

The browser uses the same source inventory and file readers as system content. Skills retain their file picker for supporting references, scripts, and assets. Generated harness adapters are discovery outputs and have no separately authored procedure.

Legacy Reference, Knowledge, and system-content URLs redirect to the canonical browser. Redirects preserve source mode and anchors. They do not create another documentation source.

## Availability and search

Disabling or removing Documentation hides Guide and its module rail entry. The shared Context and Skills browser remains directly accessible. Prototype Documents is independent of both readers.

Search lists owner overviews, context and skills, and enabled Guide chapters. It matches titles and source paths, not full document text. Disabled or removed module guidance is excluded.

## Source access

Guide chapters and owner READMEs edit their own complete documents through the shared documentation editor. Context and skill files use their existing file access policies. Navigation exposes Edit source, Open in editor, Reveal in Finder, Copy link, and Copy path where local permissions allow them. Owner README menus have no rename or delete actions.

The [shared editor](../../platform/context/technical/source.md) supplies keyboard controls, version checks, and unsaved-change handling. Published pages retain reading and copying without repository editing or operating-system actions.

Source access is limited to indexed owner documents and locally repairable Guide files. Removing a capability removes its documents from the allowlist; retained chapters remain repairable when Documentation is enabled.

## Implementation

- `module.ts`, `app.tsx`, `GuideLayout.tsx`, `GuidePage.tsx`, `loadGuide.ts`: Guide availability, navigation, and reading.
- `pages/*.md`: authored human chapters.
- `src/platform/app/docs/KnowledgePage.tsx` and `src/platform/app/router.tsx`: the shared owner browser and overview routes.
- `scripts/build/build-manifest.js`: owner and Guide discovery.
- `scripts/lib/platform-references.js`: canonical owner document catalog.
- `scripts/build/remark-title-from-heading.js`: opening titles without hiding document sections.
- `src/platform/app/docs/DocumentationEditor.tsx`, `documentationSource.ts`, `scripts/build/files/source.js`: allowlisted document source editing.

Follow [Documentation standards](../../platform/context/documentation-standards.md) and [Maintain documentation](../../platform/skills/maintain-documentation/SKILL.md) for authoring and verification.
