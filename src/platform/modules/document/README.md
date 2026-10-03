---
title: "Add written context"
description: "Keep Markdown files alongside prototype views."
section: "Create"
order: 11
toc: true
slug: "documents"
---

# Documents

Documents adds Markdown pages inside a prototype. It is optional: disabling it hides those pages from normal prototype navigation and preserves their files. The Handbook and Guide retain their own Markdown support.

Documents use the platform's page style, rather than the prototype's design-system theme.

## Create and edit

Ask your agent to create a document, or select **New** (+), then **New document**, in the Files row.

1. Right-click the document and select **Edit source**.
2. Edit the Markdown text.
3. Save with Command+S on macOS or Ctrl+S on other systems.
4. Select **Done** to return to the page.

Other contributors' documents and published pages are read-only.

A document and another item cannot share a URL, such as `notes.md` and `notes.tsx`.

## Supported content

The reader supports headings, lists, links, tables, task lists, strikethrough, and highlighted code blocks. It does not execute JSX or embedded components. Raw HTML appears as text. HTML comments are hidden.

Frontmatter is an optional settings block at the start of a Markdown file. It controls the heading, description, and contents list:

```md
---
title: Notes
description: Context for this prototype.
toc: true
---
```

Without a frontmatter title, an opening level-one heading (`# Title`) supplies the title.

## Links and related context

Link to another item with a relative path:

```md
See the [main view](./prototype.tsx).
Read the [research](./research/notes.md).
```

The app accepts paths with or without extensions. External links open in a new tab. Moving linked files can break relative links. Renaming the prototype folder preserves them.

Documents link to views. Canvases can show live view previews alongside document cards.

Keep prototype-specific context here. The [Handbook](/guide/handbook) holds context shared across the studio.

## For developers

**This folder is a self-contained file type.** Delete it and `.md` files become plain files; the app runs without it. How file types work is in `src/platform/core/fileTypes.md`.

- `type.ts`: what the build reads: the `.md` extension, a template (a title and an empty-document line), and the checks on frontmatter.
- `open.tsx`: the icon, how a document loads, and its page.
- `src/platform/app/docs/`: the shared Markdown reader and page style. The Handbook uses this reader independently.
- `loader.ts`: the glob of document files for the deployed site.

Agent contract: `src/handbook/rules/documents.md`.
