# Prototype Sandbox

A starter template for a shared prototyping sandbox: one repo where designers and their coding agents build React prototypes side by side. It's the scaffold described in [How I Set Up a Prototyping Sandbox](https://www.unknownarts.com/p/TODO).

## Core ideas

- **Three contracts.** A prototype is a folder. A script turns folders into a manifest. The app reads the manifest and the URL.
- **Contributor scope.** You can change anything in your folder, but only your own folder. Everything else is the platform.
- **Prototype scope.** A prototype can depend only on its own folder, the product system (`src/product/`), and shared utilities (`src/lib/`).

## Getting started

Ask your agent to get you set up. Under the hood, once [mise](https://mise.jdx.dev) is activated in your shell, that's:

```sh
mise install    # installs the pinned Node and pnpm
pnpm install    # installs the project's packages
pnpm dev        # starts the app at localhost:5173
```

Then add yourself to `contributors.json`. The key is your folder name in `src/prototypes/`:

```json
{
  "your-key": {
    "name": "Your Name",
    "github": "your-github-username",
    "email": "you@yourcompany.com"
  }
}
```

The `example` entry and `src/prototypes/example/` are there to show the shape. Delete them once you've made your own.

## Commands

```sh
pnpm dev                     # rebuild the manifest and start the dev server
pnpm build                   # rebuild the manifest and build the static site to dist/
pnpm new "Prototype Name"    # create a prototype in your folder
node scripts/resolve-contributor.js   # print your contributors.json key
```

## Repo map

```
AGENTS.md              agent entry point; points to agent/rules/
agent/rules/           systems, prototype workflow, contributor scope
contributors.json      who owns which folder
scripts/               manifest, create, scope check, Vite plugins
.husky/                pre-commit and pre-push scope checks
.github/workflows/     scope check on push to main, build for deploy
src/studio/            the app UI and its components
src/product/           components and theme that prototypes build with
src/lib/               shared utilities
src/prototypes/        one folder per contributor
```

## License

MIT. See [LICENSE](LICENSE).
