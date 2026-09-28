# Design Studio Starter

The starter kit behind Design Studio, the prototype sandbox I built at Sublime Security: one repo where designers and their coding agents build React prototypes side by side. It's the scaffold described in [How I Set Up a Prototyping Sandbox](https://www.unknownarts.com/p/TODO).

The full docs live in the app itself: run it and open the Guide (`/guide`), or read the pages in [`src/guide/`](src/guide/). This is a beta (0.1.0), so expect changes.

## Core ideas

- **Three contracts.** A prototype is a folder. A script turns folders into a manifest. The app reads the manifest and the URL.
- **Contributor scope.** You can change anything in your folder, but only your own folder. Everything else is the platform.
- **Scoped design systems.** The studio system (`src/studio/`) is the app's own UI: nav, index, prototype navigation, palette, Systems pages, and Guide. Prototypes build with a prototype system instead, each in its own folder with its theme scoped under a class, listed in `src/systems.ts`. The kit ships one, `product` (`src/product/`), a placeholder for your product's design system. Replace it, or add others, like a `brand` system for marketing work.
- **Prototype scope.** A prototype can depend only on its own folder, its design system (`src/product/` by default), and shared utilities (`src/lib/`).

## Getting started

Ask your agent to get you set up. It follows `agents/skills/setup-contributor/SKILL.md`. Under the hood, once [mise](https://mise.jdx.dev) is activated in your shell, that's:

```sh
mise install    # installs the pinned Node and pnpm
pnpm install    # installs the project's packages
pnpm join       # proposes your contributors.json entry; --yes writes it
pnpm dev        # starts the app at localhost:5173
```

`pnpm join` reads your name and email from Git and your username from the GitHub CLI, and creates your folder in `src/prototypes/`. Use your work email. (It's `join`, not `setup`, because `pnpm setup` is a built-in pnpm command.)

`patrick` is me, the kit's author, left in as an example contributor: one entry in `contributors.json`, and one folder in `src/prototypes/` that only I can change. Delete both once you've added yourself.

## Notes

- **TypeScript.** The kit is TypeScript (strict), and new views are `.tsx`. Plain `.jsx` views work too; they just aren't type-checked. `pnpm build` runs `pnpm typecheck` (`tsc -b`) first, so a type error fails the build and CI.
- **Routing.** [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview), with code-based routes in `src/studio/app/router.tsx`. URLs are paths: `/` (search with `?q=`), `/systems/<system>/<page>`, `/guide`, `/<contributor>/<prototype>`, and `/<contributor>/<prototype>/<path>` for any item at any depth, like `/patrick/hello-world/lofi/main`. A file's type comes from its extension (`src/fileTypes.ts`); folders are only for organizing. For anything about routes, links, or search params, TanStack's docs are the reference. `systems` and `guide` are reserved, so they can't be contributor keys.
- **Components.** shadcn/ui on [Base UI](https://base-ui.com/react/overview/quick-start) (`@base-ui/react`). Compose with the `render` prop, e.g. `<DialogTrigger render={<Button />}>Open</DialogTrigger>`.
- **Icons.** The app UI (`src/studio/`) uses HugeIcons. Product components and prototypes use `lucide-react`, which shadcn/ui brings in.
- **Guide.** Pages are `.mdx` files in `src/guide/`. Frontmatter sets the `title`, `description`, sidebar `section`, and `order`, plus `toc: true` for an "On this page" list. Adding a file adds the page.
- **Files in dev.** During `pnpm dev`, the prototype navigation is a live file tree (`scripts/vite-files-plugin.js`), and the app updates without reloading as files change (`scripts/vite-manifest-watch-plugin.js`). Neither exists on the deployed site.
- **Errors.** A view that throws shows its error with a Copy button. `pnpm build` fails on a broken `meta.json` or an out-of-scope import (another prototype, `src/studio/`, or a design system the prototype doesn't use), and CI runs it on every push to main. It also fails on a plain `.css` import from a prototype, a system theme rule outside its class, and a view with no default export or a duplicate name. Files over 750 KB are blocked at commit and in CI (`scripts/check-asset-size.js`), and a commit whose Git identity doesn't match `contributors.json` gets a warning.

## Commands

```sh
pnpm dev                     # rebuild the manifest and start the dev server
pnpm build                   # rebuild the manifest, type-check, and build the static site to dist/
pnpm typecheck               # type-check only (tsc -b)
pnpm preview                 # serve dist/ locally
pnpm new "Prototype Name"    # create a prototype in your folder
pnpm join                    # add yourself to contributors.json
node scripts/resolve-contributor.js   # print your contributors.json key
```

## Hosting

The app uses TanStack Router's browser history, so URLs are clean paths like `/patrick/hello-world`. Configure your host to rewrite all paths to `index.html` ([history types](https://tanstack.com/router/latest/docs/framework/react/guide/history-types)). Until then, the build copies `index.html` to `404.html`, which keeps deep links working on hosts that serve `404.html` for unknown paths. If your host can do neither, switch to hash history: a one-line change where the router is created in `src/studio/app/router.tsx` (see the comment there, and the [docs](https://tanstack.com/router/latest/docs/framework/react/guide/history-types)).

## Repo map

```
AGENTS.md              agent entry point; points to agents/rules/
agents/                rules and skills for agents (the one source of truth)
.agents/skills, .claude/skills   symlinks to agents/skills, so each agent finds the skills
contributors.json      who owns which folder
scripts/               manifest, create, scope check, Vite plugins (plain Node .js)
.husky/                pre-commit and pre-push scope checks
.github/workflows/     scope check and build on push to main, build for deploy
src/studio/            the app wrapper and its components (routes in app/router.tsx)
src/systems.ts         the design systems prototypes can use
src/product/           placeholder product system; replace it, or add others beside it
src/guide/             the Guide's pages (MDX)
src/lib/               shared utilities
src/prototypes/        one folder per contributor
```

## License

MIT. See [LICENSE](LICENSE).
