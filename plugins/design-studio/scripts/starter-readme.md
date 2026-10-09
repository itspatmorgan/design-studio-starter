# Design Studio

Your studio and all its source files live locally in this folder on your computer. You can customize the app and keep working without the installation plugin.

Created by [Patrick Morgan](https://itspatmorgan.com). Learn about [Design Studio](https://itspatmorgan.com/design-studio), follow his writing at [Unknown Arts](https://www.unknownarts.com/), or find him on [X](https://x.com/itspatmorgan) and [LinkedIn](https://www.linkedin.com/in/itspatmorgan).

## Open your studio

Ask your desktop coding agent to open this folder and follow `AGENTS.md`. The agent can prepare dependencies and start the local preview for you. Claude reads the same instructions through `CLAUDE.md`.

For manual setup, use the pinned tools:

```sh
mise install
mise exec -- pnpm install
mise exec -- pnpm dev
```

Open the local URL printed by Vite. See the [Manual](src/modules/documentation/pages/index.md) and [platform instructions](src/platform/README.md).

## Make it yours

Product and Marketing are example design systems. Feedback Inbox and Design Studio Marketing are example prototypes for learning. Customize, replace, or remove them to fit your needs. Keep Studio, the system used by the application itself.

Canonical skills live with their platform, module, or system. The generated `.agents/skills` entries expose them to Codex and Cursor; `.claude/skills` links expose the same entries to Claude. Run `pnpm studio sync` after changing registered capabilities. Preserve custom instructions and edit canonical skills instead of generated entries.

## Publish a viewing link

Ask your agent to follow [DEPLOY.md](DEPLOY.md) to publish with ChatGPT Sites, GitHub Pages, Netlify, or Vercel. It guides you through account setup and authentication, handles deployment, and verifies the viewing link. Authoring stays local; publish again when you want to share updates.

## Source and checks

This folder is an independent local Git repository with no upstream remote. Its setup receipt records the source revision used to create it. Your code and design work belong to you.

Run `pnpm build` to validate source structure, types, and production output. The working-studio build avoids rerunning the starter’s full regression suite on each publication. Source clones and packaged studios use the same build contract. Run `pnpm test` for focused regressions, `pnpm test:release` for production fixtures too, or `pnpm build:release` for full release checks. Run `pnpm build:inspect` after building to inspect startup asset size and references. See [Contributing](CONTRIBUTING.md), [Security](SECURITY.md), and the [MIT license](LICENSE). The original starter and plugin distribution files are maintained at [design-studio-starter on GitHub](https://github.com/itspatmorgan/design-studio-starter).
