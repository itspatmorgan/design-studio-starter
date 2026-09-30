# Archiving

Archiving sets a prototype, or a view, document, or canvas in one, aside without deleting it. Read this when the person wants to shelve, retire, clean up, or keep out of the deployed site something they're done with. Human docs: the Guide's Prototypes page (`src/studio/guide/prototypes.md`).

- Everything shows when the app runs locally. On the deployed site, archived work is left out entirely: not built, listed, or shipped.
- Archive a whole prototype by adding `"status": "archived"` to its `meta.json`. Remove the line to unarchive.
- Archive a file by adding its tag, in the form its type uses, and remove the tag to unarchive. A view: `/** @status archived */` in a comment at the top, above any code. A document: `status: archived` in its frontmatter (add a frontmatter block if it has none). A canvas: a top-level `"status": "archived"` next to `studioVersion`; change it with a text edit, since the canvas tools don't touch it, and saving in the app keeps it. There are two statuses, `active` (the default, never written) and `archived`. Don't invent others: an unknown value fails the build.
- Prefer archiving to deleting when the person says they're done with something but might need it later. Delete only when they say to.
- Folders can't be archived. Archive the files in them, or the whole prototype.
- Check before archiving a file that an active canvas or document doesn't link to it. `pnpm build` warns about these: the link would show a placeholder on the deployed site.
- Work the person wants on the deployed site stays active. To tidy it away, move it into a folder.
