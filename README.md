# Prototype Sandbox

A starter template for a shared prototyping sandbox: one repo where designers and their coding agents build React prototypes side by side. It's the scaffold described in [How I Set Up a Prototyping Sandbox](https://www.unknownarts.com/p/TODO).

## Core ideas

- **Three contracts.** A prototype is a folder. A script turns folders into a manifest. The app reads the manifest and the URL.
- **Contributor scope.** You can change anything in your folder, but only your own folder. Everything else is the platform.
- **Two systems.** The studio system (`src/studio/`) is the app's own wrapper: nav, index, prototype navigation, palette, and the Systems page. The product system (`src/product/`) is a placeholder for your real product design system. Replace all of it with your own components and theme, keeping it in `src/product/` and scoped under `.product-theme`.
- **Prototype scope.** A prototype can depend only on its own folder, the product system (`src/product/`), and shared utilities (`src/lib/`).

## Getting started

Ask your agent to get you set up. It follows `agent/skills/setup-contributor/SKILL.md`. Under the hood, once [mise](https://mise.jdx.dev) is activated in your shell, that's:

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
- **Routing.** [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview), with code-based routes in `src/studio/app/router.tsx`. URLs are paths: `/` (search with `?q=`), `/systems`, `/<contributor>/<prototype>`, `/<contributor>/<prototype>/<view>`, and `/<contributor>/<prototype>/<group>/<view>`, like `/patrick/hello-world/lofi/main`. For anything about routes, links, or search params, TanStack's docs are the reference. `systems` is reserved, so it can't be a contributor key.
- **Components.** shadcn/ui on [Base UI](https://base-ui.com/react/overview/quick-start) (`@base-ui/react`). Compose with the `render` prop, e.g. `<DialogTrigger render={<Button />}>Open</DialogTrigger>`.
- **Icons.** The app UI (`src/studio/`) uses HugeIcons. Product components and prototypes use `lucide-react`, which shadcn/ui brings in.
- **Errors.** A view that throws shows its error with a Copy button. `pnpm build` fails on a broken `meta.json` or an out-of-scope import, and CI runs it on every push to main.

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
AGENTS.md              agent entry point; points to agent/rules/
agent/rules/           systems, prototype workflow, contributor scope
agent/skills/          agent skills (linked from .claude/skills, .agents/skills)
contributors.json      who owns which folder
scripts/               manifest, create, scope check, Vite plugins (plain Node .js)
.husky/                pre-commit and pre-push scope checks
.github/workflows/     scope check and build on push to main, build for deploy
src/studio/            the app wrapper and its components (routes in app/router.tsx)
src/product/           placeholder product system; replace with your own
src/lib/               shared utilities
src/prototypes/        one folder per contributor
```

## License

MIT. See [LICENSE](LICENSE).
