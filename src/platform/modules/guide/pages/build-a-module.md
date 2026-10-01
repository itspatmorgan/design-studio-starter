---
title: "Build a module"
description: "Make a module that other teams can add: what it can provide, and how to share it."
section: "Extending"
order: 30
toc: true
---

A module is a folder with a `module.ts` that says what it is. Everything else is optional, and each file adds one kind of thing. You can build one for your team, or share it for others to add with `pnpm studio add`.

## Start one

Ask your agent to create a module with a name, like "quote wall". It runs `pnpm studio create-module quote-wall`, which adds:

- `module.ts`: the module's name, version, and what it adds
- `app.tsx`: a button on the rail and a page at `/quote-wall`
- a Handbook rule: what an agent should know before changing it. It's installed into `src/handbook/rules/`, and `AGENTS.md` routes agents to it while the module is on

The module appears after you restart the dev server. To make one you can publish, ask for it in its own folder (`--out`); that folder is a **pack** you can put in a git repository.

## What a module can provide

| File | What it adds |
|---|---|
| `module.ts` | A **section**: an address, and a folder for its content. If the folder holds prototype-shaped items, you can say who may change them, and whether they open full-window like apps. |
| `app.tsx` | A button on the rail, routes, entries in the ⌘K palette, and entries in every prototype's "…" menu. |
| `server.ts` | Routes on the dev server, for things that need to change files. |
| `check.ts` | A check that runs with `pnpm check` while the module is on. |
| `lib/` | Code prototypes can import, as `@module/<name>`. This is the only way a prototype reaches into a module. |
| Handbook files | Rules and skills for agents, which are removed with the module. |

The full list, with every field, is in `src/platform/modules/README.md`.

## Share it

Put the pack in a git repository. Anyone can then ask their agent to add it by its address. They see a review of every file first, and nothing is run from your module while it's reviewed.

Keep a few things in mind:

- **Say what it needs.** `requires` is the oldest Design Studio version it works with. A module that needs a newer one is turned off, with a message, and doesn't break anything.
- **Contain it.** A module should touch only its own folder and the documented ways in. `pnpm check` fails a module that imports another module's files.
- **Name the license.** If your module is built around an open source library, include the library's license file and say where it came from in `module.ts` (`upstream`). Modules with no license, or one that isn't permissive, are refused unless the person adding them says it's fine.
- **Copy, don't depend, when you must change it.** A library module can carry a copy of the library in `vendor/`, with a short `CHANGES.md` listing what differs from the original. That's the point: it's the team's copy to change.

## Design systems

A design system is shared the same way. Start one with `pnpm studio create-system brand`, or share a folder with `system.ts`, `styles/theme.css`, and `components/` in a git repository.
