# Design Studio Starter

An open-source starter kit for your own design environment. Designers and product managers work with coding agents to build interactive prototypes, arrange views and sketches on canvases, and curate the context that guides their work. Use it personally or with a team, bring your own design system, and own the code and the work you create.

The full docs live in the app itself: run it and open the Guide (`/guide`), or read the pages in [`src/platform/modules/guide/pages/`](src/platform/modules/guide/pages/). This is a beta (0.1.0), so expect changes.

The initial beta focuses on local setup, contributor onboarding, prototypes and their file types, design systems, and the Handbook. Tools is included but disabled by default. Hosted deployment and stronger scope enforcement remain areas of ongoing work. The development server is for a trusted local environment; prototype code runs in the same application, and its scope checks are architectural guardrails rather than a security sandbox.

## Core ideas

- **Three contracts.** A prototype is a folder. A script turns folders into a manifest. The app reads the manifest and the URL.
- **Contributor scope.** You can change anything in your folder, but only your own folder. Everything else is the platform.
- **Scoped design systems.** The platform system (`src/platform/`) is the app's own UI: nav, index, prototype navigation, palette, Systems pages, and Guide. Prototypes build with a prototype system instead, each in its own folder with its theme scoped under a class, found by their folders in `src/systems/`. The kit ships one, `product` (`src/systems/product/`), a placeholder for your product's design system. Replace it, or add others, like a `brand` system for marketing work.
- **Modules.** The Guide, Tools, the Handbook and Systems are modules: folders that say what they add in a `module.ts`, found by the build and the app with no list to edit. Turn an optional one off in `studio.config.ts`, delete it, or add one someone else built with `pnpm studio add <address>` (it shows what it would add and changes nothing until you say yes). See [src/platform/modules/README.md](src/platform/modules/README.md).
- **Handbook.** The team's context and instructions in `src/handbook/`: docs, agent rules, and skills (in the Agent Skills format). It's platform: shown in the app, changed through review.
- **Prototype scope.** A prototype can depend only on its own folder, its design system (`src/systems/product/` by default), and shared utilities (`src/lib/`).

## Getting started

Ask your agent to get you set up. For a new studio it follows `initialize-studio`; for joining an existing one it follows `setup-contributor`, both in `src/handbook/skills/`. Under the hood, once [mise](https://mise.jdx.dev) is activated in your shell, that's:

```sh
mise install    # installs the pinned Node and pnpm
pnpm install    # installs the project's packages
pnpm join       # proposes contributors/<key>.json; --yes writes it
pnpm dev        # starts the app at localhost:5173
```

`pnpm join` reads your name and email from Git and your username from the GitHub CLI, and creates your folder in `src/prototypes/`. Use the email matching your Git identity; personal studios accept personal email. (It's `join`, not `setup`, because `pnpm setup` is a built-in pnpm command.)

`patrick` is me, the kit's author, left in as an example contributor: one entry in `contributors.json`, and one folder in `src/prototypes/` that only I can change. When maintaining your own copy, remove the sample prototype folder after adding yourself. Before removing the `patrick` entry, transfer the sample tool's `maintainers` in `src/tools/quote-card/meta.json` to your key, or remove the sample folder `src/tools/quote-card/`. Run `pnpm build` to check the result. Contributors joining an existing team should leave the samples for the studio maintainer.

## Notes

- **TypeScript.** The kit is TypeScript (strict), and new views are `.tsx`. Plain `.jsx` views work too; they just aren't type-checked. `pnpm build` runs `pnpm typecheck` (`tsc -b`) first, so a type error fails the build and CI.
- **Routing.** [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview), with code-based routes in `src/platform/app/router.tsx`. URLs are paths: `/` (the front page), `/prototypes` (the gallery, search with `?q=`), `/systems/<system>/<page>`, `/guide`, `/prototypes/<person>/<prototype>`, and `/prototypes/<person>/<prototype>/<path>` for any item at any depth, like `/prototypes/patrick/hello-world/lofi/main`. A file's type comes from its extension (views are `.tsx`, documents are `.md`); folders are only for organizing. Each type is a self-contained module in `src/platform/modules/` that the platform runs without: see `src/platform/core/fileTypes.md`. For anything about routes, links, or search params, TanStack's docs are the reference. A module's address (`/systems`, `/guide`, `/handbook`, `/tools`, and any module you add) can't be a contributor key; `pnpm check` and `pnpm join` say so.
- **Components.** shadcn/ui on [Base UI](https://base-ui.com/react/overview/quick-start) (`@base-ui/react`). Compose with the `render` prop, e.g. `<DialogTrigger render={<Button />}>Open</DialogTrigger>`.
- **Icons.** The app UI (`src/platform/`) uses HugeIcons. Product components and prototypes use `lucide-react`, which shadcn/ui brings in.
- **Guide.** Pages are `.md` files in `src/platform/modules/guide/pages/`. Frontmatter sets the `title`, `description`, sidebar `section`, and `order`, plus `toc: true` for an "On this page" list. Adding a file adds the page.
- **Files in dev.** During `pnpm dev`, the prototype navigation is a live file tree (`scripts/build/vite-files-plugin.js`), and the app updates without reloading as files change (`scripts/build/vite-manifest-watch-plugin.js`). Neither exists on the deployed site.
- **Source.** In dev, the Files row has a source button that switches the open item between its page and its text (`?mode=source`): the open file's text in a CodeMirror editor, editable in your own prototypes (⌘S) and read-only in others'. Saves go through the file layer, which refuses a write if the file changed on disk since it was opened. The editor loads only in dev.
- **Errors.** A view that throws shows its error with a Copy button. `pnpm build` fails on a broken `meta.json` or an out-of-scope import (another prototype, `src/platform/`, or a design system the prototype doesn't use), and CI runs it on every push to main. It also fails on a plain `.css` import from a prototype, a system theme rule outside its class, and a view with no default export or a duplicate name. Files over 750 KB are blocked at commit and in CI (`scripts/check/check-asset-size.js`), and a commit whose Git identity doesn't match `contributors.json` gets a warning.

## Commands

```sh
pnpm dev                     # rebuild the manifest and start the dev server
pnpm build                   # rebuild the manifest, type-check, and build the static site to dist/
pnpm typecheck               # type-check only (tsc -b)
pnpm test                    # platform, module, canvas, and onboarding tests
pnpm canvas <file> <tool> '<json>'   # run a canvas tool on a canvas file (for agents; pnpm canvas help)
pnpm preview                 # serve dist/ locally
pnpm new "Prototype Name"    # create a prototype in your folder
pnpm join                    # add your contributors/<key>.json entry
pnpm studio list             # the modules and design systems, and which are on (add, remove, create-module: see pnpm studio)
pnpm studio status --json    # current local setup, for the agent
pnpm studio configure --name "My Studio" --usage personal --yes  # apply studio choices
pnpm check                   # confirm the file types and modules are well formed
node scripts/cli/resolve-contributor.js   # print your contributors.json key
```

## Hosting

The app uses TanStack Router's browser history, so URLs are clean paths like `/prototypes/patrick/hello-world`. Configure your host to rewrite all paths to `index.html` ([history types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types)). Until then, the build copies `index.html` to `404.html`, which keeps deep links working on hosts that serve `404.html` for unknown paths. If your host can do neither, switch to hash history: a one-line change where the router is created in `src/platform/app/router.tsx` (see the comment there, and the [docs](https://tanstack.com/router/latest/docs/framework/react/guide/history-types)).

## Repo map

```
AGENTS.md              agent entry point; points to src/handbook/rules/
src/handbook/          the team's context and instructions: docs/, rules/, skills/
.agents/skills, .claude/skills   symlinks to src/handbook/skills, so each agent finds the skills
contributors.json      starter contributors; contributors/<key>.json holds new entries
scripts/               manifest, create, scope check, Vite plugins (plain Node .js)
.husky/                pre-commit and pre-push scope checks
.github/workflows/     pull request checks, checked build artifact on push to main
src/platform/            the app: routes (app/router.tsx), components, the Guide's pages (guide/, Markdown),
                       and the kinds of file a prototype holds (modules/view, document, canvas), each a removable module
studio.config.ts       the few things nearly every team changes: the app's name, a one-line tagline for the deployed front page, which modules are off, the default system
studio.lock.json       what pnpm studio added from a source, and its checksums (only when something was)
src/platform/modules/    the modules: one folder each, with a module.ts (the Guide, Tools, the Handbook, Systems)
src/systems/           the design systems prototypes build with, one folder each (system.ts, components/, styles/theme.css)
  product/            placeholder product system; replace it, or add others beside it
src/lib/               shared utilities
src/prototypes/        one folder per contributor
```

## License

MIT. See [LICENSE](LICENSE).

The Source view's syntax colors are [Flexoki](https://stephango.com/flexoki) by Steph Ango (MIT).

Dragging in the file navigation uses [Pragmatic drag and drop](https://atlassian.design/components/pragmatic-drag-and-drop/) by Atlassian (Apache-2.0).

## Contributing and reporting issues

See [CONTRIBUTING.md](CONTRIBUTING.md) for local checks and pull requests. Use [GitHub issues](https://github.com/itspatmorgan/design-studio-starter/issues) for bugs and feature requests. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

### Preparing your studio for a team

The studio maintainer should set `studio.config.ts`, replace the Handbook principles and personas, add the team's design system, and decide which optional modules to keep. Contributors can then join without changing shared setup. Require reviewed pull requests and the Checks jobs on `main`. The supplied deployment workflow builds and uploads `dist/`; add your host's deployment step after the checks and configure access and deep-link rewrites before inviting the team.

The beta starter keeps Tools disabled and explicitly selects Product as the placeholder default. `usage` in `studio.config.ts` selects personal or team onboarding guidance (team when omitted); it does not change contributor permissions. Ask the agent to set up your own design system before treating the studio as initialized.
