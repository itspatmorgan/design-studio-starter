# Prototype Sandbox

A starter template for a shared prototyping sandbox: one repo where designers and their coding agents build React prototypes side by side. It's the scaffold described in [How I Set Up a Prototyping Sandbox](https://www.unknownarts.com/p/TODO).

## Core ideas

- **Three contracts.** A prototype is a folder. A script turns folders into a manifest. The app reads the manifest and the URL.
- **Contributor scope.** You can change anything in your folder, but only your own folder. Everything else is the platform.
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

The `example` entry and `src/prototypes/example/` are there to show the shape. Delete them once you've made your own.

## Notes

- **TypeScript.** Views can be `.jsx` or `.tsx`. The kit itself is JavaScript.
- **Icons.** The app UI (`src/studio/`) uses HugeIcons. Product components and prototypes use `lucide-react`, which shadcn/ui brings in.
- **Errors.** A view that throws shows its error with a Copy button. `pnpm build` fails on a broken `meta.json` or an out-of-scope import, and CI runs it on every push to main.

## Commands

```sh
pnpm dev                     # rebuild the manifest and start the dev server
pnpm build                   # rebuild the manifest and build the static site to dist/
pnpm new "Prototype Name"    # create a prototype in your folder
pnpm join                    # add yourself to contributors.json
node scripts/resolve-contributor.js   # print your contributors.json key
```

## Repo map

```
AGENTS.md              agent entry point; points to agent/rules/
agent/rules/           systems, prototype workflow, contributor scope
agent/skills/          agent skills (linked from .claude/skills, .agents/skills)
contributors.json      who owns which folder
scripts/               manifest, create, scope check, Vite plugins
.husky/                pre-commit and pre-push scope checks
.github/workflows/     scope check and build on push to main, build for deploy
src/studio/            the app UI and its components
src/product/           components and theme that prototypes build with
src/lib/               shared utilities
src/prototypes/        one folder per contributor
```

## License

MIT. See [LICENSE](LICENSE).
