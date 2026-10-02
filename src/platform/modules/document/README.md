---
title: "Documents"
description: "Keep decisions, questions, and handoff context beside a prototype."
section: "Working in the studio"
order: 11
toc: true
slug: "documents"
---

# Documents

A document is a Markdown file in a prototype. Use it for the problem, decisions, feedback, or questions that explain the work.

Documents use the platform's page style. They do not use the prototype's design-system theme.

## Create a document

Ask your agent to write a document from the context you provide. You can also create one locally:

1. Select **New** (+) in the Files row.
2. Select **New document**.
3. Enter the file name.

The document appears in the navigation. A document and another item cannot share a URL, such as `notes.md` and `notes.tsx`.

## Edit the text

1. Right-click the document.
2. Select **Edit source**.
3. Edit the text.
4. Save with Command+S on macOS or Ctrl+S on other systems.
5. Select **Done**.

Other contributors' documents are read-only in your local studio. The deployed site does not offer source editing.

## Supported Markdown

Use headings, lists, links, tables, task lists, strikethrough, and highlighted code blocks.

The app does not execute JSX or embedded components. Raw HTML appears as text, except HTML comments, which are hidden.

Optional frontmatter supplies page details:

```md
---
title: Problem framing
description: Why this prototype exists.
toc: true
---
```

| Field | Purpose |
| --- | --- |
| `title` | Page heading. Without it, the first level-one heading supplies the title. |
| `description` | Short text below the title. |
| `toc` | Set to `true` for an On this page list. |

## Link to items

Use a relative path from the document:

```md
See the [main flow](./lofi/main.tsx).
Read the [interviews](./research/interviews.md).
```

The app accepts paths with or without file extensions. Outside the studio, Markdown tools may handle these links differently.

Renaming the prototype folder preserves relative links. Moving either linked file can break them. Check links after moving files.

Links to external sites open in a new tab. To show a live screen beside written context, use a canvas rather than embedding it in a document.

## Shared versus prototype context

Keep decisions about this prototype here. Put context for the whole product in the Handbook.

Documents are an optional file-type module. Disabling the module preserves the files but hides them from normal prototype navigation. The Handbook and Guide keep their Markdown support.

## For developers

**This folder is a self-contained file type.** Delete it and `.md` files become plain files; the app runs without it. How file types work is in `src/platform/core/fileTypes.md`.

- `type.ts`: what the build reads: the `.md` extension, a template (a title and an empty-document line), and the checks on frontmatter.
- `open.tsx`: the icon, how a document loads, and its page.
- `src/platform/app/docs/`: the shared Markdown reader and page style. The Handbook uses this reader independently.
- `loader.ts`: the glob of document files for the deployed site.

Agent contract: `src/handbook/rules/documents.md`.
