---
title: "Documentation"
description: "Find human guidance and detailed platform contracts."
section: "Studio"
order: 14
toc: true
slug: "documentation"
---

# Documentation

Documentation has two tabs: **Guide** and **Reference**.

## Guide

The Guide introduces the main surfaces and essential concepts. Read what is useful now; you do not need to finish it before making a prototype.

## Reference

Reference exposes the documentation beside the platform code. **Platform foundations** covers shared contracts; **Modules** covers individual capabilities. Navigation labels match the titles of the pages they open.

Your agent can consult these files for implementation details. You can inspect them when you want to understand how something works, but they are not required reading for everyday design work.

## How it relates to the Handbook

Documentation explains the platform. The [Handbook](/documentation/guide/handbook) holds your team's context, constraints, and procedures. Both are file-based and available to your agent.

Use navigation for the [shared source workflow](/documentation/guide/home#working-with-files). Platform documentation does not offer rename or delete actions in these menus.

## For developers

Documentation opens at `/documentation` and combines a curated **Guide** at `/documentation/guide` with complete **Reference** at `/documentation/reference`. Guide chapters introduce the studio to people. References describe capabilities, boundaries, and implementation contracts available to people and agents. You do not need to read or change them to begin creating.

Follow the [Documentation standards](../../../handbook/rules/documentation-standards.md) when changing Guide or Reference content.

Use the two sidebar tabs to switch reading modes. Reference groups shared contracts under **Platform foundations** and enabled capabilities under **Modules**. Each module opens its README; additional contracts appear beneath their owning module. Modules with no supplied documentation are omitted. Navigation labels match the page titles: module names in Reference, surface names in the Guide. Both presentations use the same source file.

The Reference overview explains how contracts join the agent’s working context and when to consult or change them. Each document has a collapsed **About this reference** section with its source path and related Handbook context and instructions. Visibility does not mean an agent automatically reads a reference.

The optional module uses `documentation` for its folder, declaration ID, configuration key, and public section key. Disable it through studio commands to hide the Guide and its rail entry. Reference discovery and direct access belong to the shared platform and remain available when this module is disabled or removed. Guide and Reference, including their section links and individual pages, are excluded from the command palette. Prototype Documents is independent of both reading modes.

Right-click a file in either reading mode for **Edit source**, **Open in editor**, **Reveal in Finder**, **Copy link**, and **Copy path**. Use **⌘' / Ctrl+'** to toggle the selected file between its rendered view and source; **⌘S / Ctrl+S** saves. Returning with unsaved changes requires confirmation. Source editing opens from navigation, with no separate Edit button on the page. Local edits use the [shared platform editor](../../core/source.md) and detect external changes before saving. Guide chapter edits preserve the complete underlying README. Platform documentation has no rename or delete actions in these menus. Published pages support copying links and paths; local editing and operating-system actions are unavailable.

- `module.ts`: who it is and its section.
- `app.tsx`: its rail button and routes.
- `pages/*.md`: the Guide's own pages, about the app as a whole, in the order their `order` frontmatter gives. Add a page by adding a file.
- A page for a module or file type is that folder's `README.md`, when it opens with Guide frontmatter: the Guide shows it down to a `## For developers` heading (`scripts/lib/guide-pages.js` finds them, `scripts/build/remark-readme-guide.js` trims them). Removing the folder removes the page.
- `src/platform/app/docs/DocumentationHeader.tsx`, `References.tsx`: the shared Documentation heading, Reference navigation, and reference metadata.
- `scripts/lib/platform-references.js`: indexes the same top-level core and enabled-module Markdown set as the shared reader. Related guidance comes from Handbook links and module declarations.
- Platform foundations follow a general-to-specific reading order. Core Markdown uses numeric `referenceOrder` frontmatter; the Module contract sits at 30. Unordered foundations follow alphabetically by title. Module navigation keeps its own alphabetical hierarchy.
- `GuideLayout.tsx`, `GuidePage.tsx`, `loadGuide.ts`: the sidebar, reader, and enabled-page previous/next navigation.
- Diagrams are fenced `mermaid` blocks in the Markdown pages, rendered by the shared platform reader.

- `src/platform/app/docs/DocumentationNavItem.tsx`, `src/platform/app/shell/FileActionItems.tsx`: shared file-menu actions, also used by Handbook and prototype navigation.
- `src/platform/app/docs/DocumentationEditor.tsx`, `documentationSource.ts`, `scripts/build/files/source.js`: local reference source access, limited to indexed documentation, with version and size checks.
- Guide and Reference share `DocumentationEditor.tsx` and the documentation source endpoint. Standalone chapters remain repairable when their metadata is invalid. Published builds omit the editor.
