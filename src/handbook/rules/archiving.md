# Archiving

Archiving sets a whole prototype aside without deleting it. Read this when the person wants to shelve or retire a prototype, or keep it out of the deployed site. Human docs: the Guide's Prototypes page (`src/studio/guide/prototypes.md`).

- Everything shows when the app runs locally. On the deployed site, an archived prototype is left out entirely: not built, listed, or shipped.
- Archive a prototype by adding `"status": "archived"` to its `meta.json`. Remove the line to unarchive. There are two statuses, `active` (the default, never written) and `archived`. Don't invent others: an unknown value fails the build.
- Prefer archiving to deleting when the person says they're done with a prototype but might need it later. Delete only when they say to.
- Individual views, documents, and canvases can't be archived. To tidy them away inside a prototype, move them into a folder.
- Before archiving a prototype, check that no active canvas or document links to it. `pnpm build` warns about these: the link would show a placeholder on the deployed site.
