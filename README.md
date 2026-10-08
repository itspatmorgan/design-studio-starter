# Design Studio Starter

An open-source starter kit for your own design environment. Work with a coding agent to build interactive prototypes, sketch on canvases, and keep useful context alongside your designs.

Made for designers and product managers, working individually or with a team. Bring your own design system, customize the studio, and own the code and everything you create.

Created by [Patrick Morgan](https://itspatmorgan.com). Visit the [Design Studio landing page](https://itspatmorgan.com/design-studio) for an introduction.

## Get started

Choose one of four paths in [Set up Design Studio](SETUP.md): **Codex plugin**, **Claude Code plugin**, **Cursor plugin**, or **direct from the source repository**. Use your desktop app and a local session. The agent handles technical setup and opens a studio in a visible folder on your computer. Personal use does not require a GitHub account.

The first plugin release is planned around local and repository installs, without waiting for public-directory review. The package is currently experimental. See the [plugin release plan and test status](plugins/design-studio/README.md) for remaining checks. Public marketplace listings are a later stage.

If you prefer to set it up yourself:

1. Select **Use this template** on GitHub to create your own repository, then clone it locally.
2. Install [mise](https://mise.jdx.dev/installing-mise.html) if you do not already have it.
3. From the repository directory, run:

   ```sh
   mise install
   mise exec -- pnpm install
   mise exec -- pnpm dev
   ```

Open the local URL printed by Vite. You can explore the starter before configuring anything or opening it in a coding agent. See the [Manual](src/modules/documentation/pages/index.md) for what to do next.

## Learn more

The Manual at `/documentation/manual` is a concise reference for using, customizing, and troubleshooting Design Studio. Original platform and module instructions appear in Context & Skills at `/documentation/context/platform.core`. System guidance stays in Systems.

- [Overview](src/modules/documentation/pages/index.md) — how the studio works.
- [Share](src/modules/documentation/pages/share.md) — viewing links, working files, and handoff.
- [Modules](src/platform/context/modules.md) — customize and extend your studio.
- [Tech stack](src/platform/context/stack.md) — what's under the hood.

## Starter repository publishing

For any host, install with Node 24 and pnpm 12, run `pnpm build`, and publish `dist/`. The build validates source and types. Use `pnpm test` for focused regressions or `pnpm build:release` for full release verification. `pnpm build:inspect` reports startup asset size and requests. Your chosen host owns routing, caching, access, and deployment configuration.

The [Checks workflow](.github/workflows/scope-check.yml) publishes successful pushes to `main` only in `itspatmorgan/design-studio-starter`. The workflow runs scope, regressions, and bundling concurrently, caches dependencies, cancels obsolete validation, and checks commit freshness before deploying. Copies run checks without publishing; configure your own deployment when needed.

The starter repository uses GitHub Pages with **GitHub Actions** as its publishing source. Its configured site inherits `itspatmorgan.com` from the account’s user site and publishes at `/design-studio-starter/`; its custom-domain field is empty.

The workflow obtains the Pages base path and passes it to the build as `STUDIO_BASE_PATH`. To preview this repository’s subpath locally:

```sh
STUDIO_BASE_PATH=/design-studio-starter/ pnpm build
STUDIO_BASE_PATH=/design-studio-starter/ pnpm preview
```

See [Publishing](src/platform/context/publishing.md) for portable hosting, direct-link routing, and access requirements.

## Project status

Early beta, focused on local workflows: prototypes, canvases, documents, design systems, and system-owned context. See the [Changelog](CHANGELOG.md) for platform release history.

For bugs, ideas, and pull requests, see [Contributing](CONTRIBUTING.md). For the intended environment and private vulnerability reporting, see [Security](SECURITY.md).

## Follow the work

Follow Patrick’s writing about design, technology, and creative work at [Unknown Arts](https://www.unknownarts.com/).

- [Personal website](https://itspatmorgan.com)
- [Design Studio](https://itspatmorgan.com/design-studio)
- [Source on GitHub](https://github.com/itspatmorgan/design-studio-starter)
- [X](https://x.com/itspatmorgan) and [LinkedIn](https://www.linkedin.com/in/itspatmorgan)

## License

[MIT](LICENSE). Includes [Flexoki](https://stephango.com/flexoki) by Steph Ango (MIT) and [Pragmatic drag and drop](https://atlassian.design/components/pragmatic-drag-and-drop/) by Atlassian (Apache-2.0).
