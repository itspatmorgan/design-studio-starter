---
title: "Changelog"
description: "What's changed in each release."
section: "Reference"
order: 90
---

## 0.1.0 (beta)

The first release, described in [How I Set Up a Prototyping Sandbox](https://www.unknownarts.com/p/TODO).

- The app: Prototypes page, prototype navigation, Systems page, Guide, and command palette
- File types, each a removable folder: views (`.tsx`), documents (`.md`), and canvases (`.excalidraw`)
- A source button in the Files row: read or edit a file's text in the app, while it runs locally
- Studio and product systems on shadcn/ui and Base UI
- Contributor folders, `pnpm new`, and `pnpm join`
- Scope checks before commit, before push, and on push to main
- The import guard
- A sample prototype, Feedback Inbox, that doubles as a tour: three screens on a working data store, a workflow canvas, and two documents
- A Product system with its own look (teal, tighter corners, system font) and 16 components, each with a page
- A small manifest: the file list of each prototype loads when you open it, so the deployed site stays fast as prototypes pile up
- Archiving: set a prototype aside; the deployed site leaves archived prototypes out
- The Handbook: team docs, agent rules, and skills, shown in the app, with a fixed shape and a check for it
- `AGENTS.md`, which points to the Handbook's rules, and the `setup-contributor` skill
