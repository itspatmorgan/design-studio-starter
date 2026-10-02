---
title: "Documents"
description: "Written context in a prototype: problem framing, open questions, handoff notes."
section: "Core concepts"
order: 14
toc: true
slug: "documents"
---

# Documents

A document is a page of Markdown in a prototype, for the context that shouldn't live only in a chat: the problem, open questions, feedback, or notes for whoever builds it. It's a plain `.md` file, so it opens in Obsidian, GitHub, or any Markdown editor, and anywhere in your prototype.

```text
src/prototypes/patrick/hello-world/
├── meta.json
├── prototype.tsx
├── problem-framing.md   # a document
└── research/
    └── interviews.md     # a document, in a folder
```

There's nothing to register. Add the file and it appears in the prototype's navigation, with a document icon, and opens at its path without the extension: `/prototypes/patrick/hello-world/research/interviews`.

## Make one

Choose **+ → New document** next to the prototype's title (or right-click a folder), or ask your agent to write one. A new document starts with a title and a line inviting you to fill it in.

You can name a document however you like. A document and a view in the same folder can't share a name (`notes.md` and `notes.tsx` would both be `/notes`); the build says so.

You can also write one yourself: use the source button in the Files row to edit its text, and press it again to see the document rendered.

## What goes in it

Write Markdown: headings, lists, tables, links, and code blocks with syntax highlighting. Frontmatter at the top is optional:

```md
---
title: Problem framing
description: Why this prototype exists.
toc: true
---
```

| Field | What it does |
| --- | --- |
| `title` | The page's heading. Without it, a first `# Heading` in the text is used |
| `description` | A line under the title |
| `toc` | `true` adds an "On this page" list of its headings |

It's standard Markdown (CommonMark with GitHub's tables, task lists, and strikethrough) and nothing more, so what you write here reads the same everywhere. There are no components, and raw HTML isn't shown. A document that can't be read shows what's wrong and where, and loads as soon as you fix the file.

## Linking to a view or another document

Link with a path relative to the document, the way you would in any folder of files:

```md
See the [main flow](./lofi/main) and the [interviews](./research/interviews).
```

Extensions are optional, so `./lofi/main.tsx` works too. Relative links keep working if you rename the prototype's folder, but not if you move either file, so check links after moving things around. Links to other sites open in a new tab.

A document shows in the app's own style, not your prototype's design system, so it can't embed a view. Link to it instead.

## Where documents belong

The Guide (the pages you're reading) is written the same way, in `src/platform/modules/guide/pages/` and in the READMEs of the modules and file types it describes. It's the platform's own documentation, kept by whoever maintains it. A document belongs to a prototype and its contributor, and follows the same scope as everything else in your folder.

## Not using them?

Documents are optional for a prototype, and for the platform: ask your agent to remove them, and the app runs without them. This page goes with them.

## For developers

**This folder is a self-contained file type.** Delete it and `.md` files become plain files; the app runs without it. How file types work is in `src/platform/fileTypes/README.md`.

- `type.ts`: what the build reads: the `.md` extension, a template (a title and an empty-document line), and the checks on frontmatter.
- `module.tsx`: the icon, how a document loads, and its page.
- `DocumentPage.tsx`: the page a document opens as, in the app's own style (not the prototype's design system).
- `loader.ts`: the glob of document files for the deployed site.

Agent contract: `src/handbook/rules/documents.md`.
