# Modules

A module is a part of Design Studio you can add or remove: the Guide, Tools, the Handbook, Systems, and anything a team or the community
builds. Each is a folder here with a `module.ts` that says what it is and what it adds. The build, the dev server, and the app read that
one list, so no list of sections is kept anywhere else, and a module needs no change to the code around it.

The design rules behind it:

- **One kind of module.** Parts that came with the kit and parts someone else built follow the same contract. There is no plugin framework and
  nothing is loaded at run time: a module's files are copied into your repo, where you can read and change them (the shadcn idea, for design tooling).
- **Plain words, a small config.** `studio.config.ts` holds only what nearly every team changes: the app's name, which optional modules are on, and
  the default design system. Everything else is code you own.
- **Every module can be removed.** Delete its folder, or turn it off in the config, and the app still builds. `pnpm baseline removal <module>` proves it.
  The Handbook and Systems stay required, because prototypes are built on them.

## What a module can provide

| File in the module's folder | What it gives the platform |
|---|---|
| `module.ts` | Who it is, and its **section**: an address (`/tools`), optionally a content folder, and if that folder holds prototype-shaped folders (`items: "prototypes"`, one per id like `src/tools/<id>/`), who may change them (`policy`) and whether they open as full-window apps on the deployed site (`standalone`). Also: `optional` (may be turned off), `requires` (oldest platform version), `lib`, `handbook`, `dependencies`, `upstream`. |
| `app.tsx` | Its **rail button**, **routes**, entries in the ⌘K palette (`places`, `palette`), and entries in every prototype's "…" menu (`useActions`). |
| `server.ts` | **Routes it adds to the dev server**, at `POST /__studio/<module>/<route>`. Dev only. |
| `check.ts` | A **check** that runs in `pnpm check` while the module is on. |
| `lib/index.ts(x)` | A **library** prototypes import as `@module/<id>`: the one door a prototype has into a module (`lib: true`). |
| `handbook/…` in a pack | **Rules and skills** for agents, installed into `src/handbook/`. The module lists them in `handbook`; `pnpm studio sync` keeps AGENTS.md routing to the ones whose module is on. |
| `vendor/` (convention) | Third-party code copied in. Give it its own `tsconfig.json` and start its files with `// @ts-nocheck`, so the build compiles it on its terms and the app's type check stays about the app's own code. |

A design system is its own kind of folder, `src/systems/<id>/`, with `system.ts`, `components/` and `styles/theme.css`; see `src/handbook/rules/systems.md`.

The contract is **0.x** (`PLATFORM_VERSION` in `index.ts`), so it can still change. A module says the oldest version it works with in `requires`; one that needs a
newer platform is turned off, and `pnpm check` says why. The types a module is written against are listed in `src/studio/core/api.ts`.

## Using them

```sh
pnpm studio list                      # what's installed and what's on
pnpm studio disable guide             # off in studio.config.ts (its files stay); enable puts it back
pnpm studio add <source>              # a folder, a git address (https or ssh, #branch/tag/commit), or an https .tar.gz
pnpm studio remove <module|system>    # delete it (--content also deletes the content it keeps)
pnpm studio create-module <id>        # start one (--out <folder> makes a pack to publish)
pnpm studio create-system <id>
pnpm studio sync                      # AGENTS.md's module lines
pnpm check                            # includes the modules, and what you changed in ones you added
```

Designers don't run these: they ask their agent, which runs them (`src/handbook/rules/modules.md`). `add`, `remove` and `create-*` show what they
would do and change nothing until run again with `--yes`. Restart the dev server after any of them; the build scripts read the module list once at start.

### What `add` guards against

A source is code that will run in your app, so adding one is a decision for a person. The command only helps make it an informed one:

- **Nothing is run.** The pack's `module.ts` is read as plain data (no calls, names, or templates), never imported. Install scripts are off for npm packages.
- **Files are checked before any is written:** no links, no paths that climb out of the folder, at most 500 files, 2 MB each, 20 MB in all, and a file never
  overwrites another. Handbook files go only where the module lists them.
- **Sources:** https or ssh git, https tarballs, or a folder. Not http, `file://`, or `git://`.
- **A library's license:** a module built around an open source library must carry its LICENSE file and a permissive license (`--allow-license` to override).
- **It puts things back** if a check fails after copying, and `studio.lock.json` records where each file came from, so `pnpm check` can say which you changed.

This is review, not a sandbox: a module you add has the same power as any code in your repo. Read what you add.

## How the app reads it

`scripts/lib/modules.js` (the build and dev server) and `src/studio/app/data/modules.ts` (the app) both find the `module.ts` files by folder. From that list:
`scripts/build/vite-globs-plugin.js` gives each file type its file lists; `scripts/build/build-manifest.js` scans each section of prototype-shaped folders into
`manifest.sections.<key>`; `src/studio/core/permissions.ts` answers who may change what; `src/studio/app/modules.ts` draws the rail, the routes and the palette.
Design systems are found the same way from `src/systems/*/system.ts` (`scripts/lib/systems.js`, `src/studio/app/data/systems.ts`), and the stylesheet's marker
comments are filled in by `scripts/build/vite-css-plugin.js`.

`pnpm check` confirms every declaration is well formed, no two modules claim the same address, no contributor uses a module's address, modules don't
import each other, and code outside a module reads only its `module.ts`.

File types (`src/studio/fileTypes/`) are modules of their own kind and keep their folders; see their README.
