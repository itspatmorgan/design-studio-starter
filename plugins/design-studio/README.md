# Design Studio plugin

Design Studio is an open-source prototype sandbox for designers and product managers who build. Work with your coding agent to turn ideas into interactive prototypes using your components, context, and design principles.

Follow [setup instructions](https://github.com/itspatmorgan/design-studio-starter/blob/main/SETUP.md), or visit the [Design Studio landing page](https://itspatmorgan.com/design-studio).

## Skills

- [Create Studio](skills/create-studio/SKILL.md): install Studio in a location you confirm and open its preview.
- [Open Studio](skills/open-studio/SKILL.md): reopen an existing Studio and preserve its work.
- [Use Studio](skills/use-studio/SKILL.md): work with the Studio's own prototype, system, and module procedures.
- [Publish Studio](skills/publish-studio/SKILL.md): publish a viewing site with ChatGPT Sites when requested and available.

## Package

The root manifest owns shared identity and Codex interface descriptions. Host manifests expose the same skills and runtime helpers to Codex, Claude Code, and Cursor. Icons and logos live in `assets/`.

`scripts/` contains the setup coordinator, environment audit, toolchain selection, working-studio packaging, and the README delivered into a new Studio. Studio source lives in its confirmed folder and remains usable independently of the plugin. Plugin updates do not automatically upgrade existing Studios.

Development tools, tests, benchmarks, and validation procedures live outside this package in the repository's [plugin maintenance directory](https://github.com/itspatmorgan/design-studio-starter/tree/main/scripts/plugins/design-studio).

Created by [Patrick Morgan](https://itspatmorgan.com). Source is available in [design-studio-starter](https://github.com/itspatmorgan/design-studio-starter) under the MIT license.
