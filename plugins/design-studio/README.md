# Design Studio plugin

This beta package helps a local coding agent create, open, and use Design Studio. A designer asks “Create my Design Studio.” The agent handles downloading and preparation, opens a preview, and helps them continue in the owned studio folder.

Created by [Patrick Morgan](https://itspatmorgan.com). The plugin homepage is the [Design Studio landing page](https://itspatmorgan.com/design-studio); its source is [design-studio-starter on GitHub](https://github.com/itspatmorgan/design-studio-starter). Follow Patrick’s writing at [Unknown Arts](https://www.unknownarts.com/) and find him on [X](https://x.com/itspatmorgan) and [LinkedIn](https://www.linkedin.com/in/itspatmorgan).

## Beta distribution

The primary audience uses Codex desktop, Claude Desktop’s local Code view, and Cursor. The beta uses each tool’s supported local or repository plugin installation. Public-directory submissions and reviews are a later distribution stage, not a prerequisite for the beta.

[Set up Design Studio](../../SETUP.md) owns the four user paths: Codex plugin, Claude Code plugin, Cursor plugin, and direct from the source repository. Each plugin path starts with one prompt for installation and studio creation. The optional [ChatGPT Sites prompt](../../SETUP.md#set-up-and-publish-with-chatgpt-sites) includes publication. Repository catalogs are installation metadata; they do not imply a reviewed directory listing. Keep terminal commands in agent or maintainer instructions.

The current package pins the published starter with the latest local workflow fixes. Before broader beta rollout, test native setup with the newly packaged starter, including direct-source setup. Codex setup has passed; the person reports Claude Desktop and Cursor setup working well before this packaging refactor. Reopen and work-preservation checks remain separate evidence. The pilot targets macOS; Windows, Linux, and clean-computer prerequisite installation remain unverified.

## One setup flow

After plugin activation, follow [Create Studio](skills/create-studio/SKILL.md). The shared [environment and destination procedure](skills/create-studio/references/local-setup.md) owns audit, folder confirmation, installation, and recovery. Source remains usable after plugin removal. Personal use needs no GitHub account; creation makes a local Git repository without a remote.

The read-only `audit` command combines environment observations, folder recommendation, and destination validation. `plan` requires the exact confirmed destination and actual user response, saves an exclusive JSON record outside Studio, and returns `planFile`. An optional `--output` selects a durable record location. Lower-level `preflight` and `choose` remain available for diagnostics.

`setup --plan <file>` and normal `create --plan <file>` reject changed execution identity and destination/name mismatches before download or creation. Interrupted first-run `prepare` requires the plan; prepared studios retain their open workflow. Plans enforce consistency rather than authenticating a human response. Absolute local sources without plans are for maintainer fixtures. Cross-platform suggestions do not establish verified native installation support.

- [Create studio](skills/create-studio/SKILL.md) owns first-time setup.
- [Open studio](skills/open-studio/SKILL.md) reopens existing work without reinitializing it.
- [Use studio](skills/use-studio/SKILL.md) delegates ongoing work to that studio's current guidance.
- [Publish studio](skills/publish-studio/SKILL.md) handles requested local onboarding through public ChatGPT Sites publication and later updates.
- [Host handoff](skills/create-studio/references/host-handoff.md) adapts folder opening to the current coding tool.
- [Direct setup](../../SETUP.md) lets an agent use the same procedure without a plugin installed.

[bootstrap.mjs](scripts/bootstrap.mjs) implements downloading, inspection, preparation, and launch. `setup` combines creation and preparation; `exec --destination <folder> -- <command> [args...]` runs subsequent commands with verified Git and pinned Node. The helper probes actual Git execution rather than just command presence. It saves a Git-only shim under local Git metadata and a Git-excluded `mise.local.toml`, preserving custom local configuration. This keeps normal mise commands usable after handoff without exporting machine paths in published source. Git and Node are prerequisites; preparation also needs mise. The skill tells the agent to handle missing tools through supported mechanisms and official sources. Automatic prerequisite installation has not been proved on a clean computer.

Preparation trusts the inspected studio's mise configuration, installs pinned tools and dependencies, applies first-run personal defaults, and synchronizes project skills. The receipt `design-studio.local.json` records setup state and is excluded locally from Git. Repeating setup preserves existing configuration and work. Unrelated folders, linked metadata, invalid receipts, and modified initial settings are refused rather than overwritten.

The bootstrap pins a public starter revision in [bootstrap.mjs](scripts/bootstrap.mjs). The setup receipt records the downloaded revision; the plugin version alone does not identify the studio code. A release pin must identify a public, tested commit. Bootstrap changes do not automatically upgrade existing studios. [Setup benchmarks](experiments/benchmarking.md) define the timing boundaries; [historical measurements](experiments/setup-speed.md) record earlier packages.

## Packaging and ownership

[plugin.json](plugin.json) is the canonical identity and OpenAI interface manifest. [sync-manifest.mjs](scripts/sync-manifest.mjs) generates host packages and marketplace catalogs:

| Host | Plugin manifest | Repository marketplace |
| --- | --- | --- |
| Codex/OpenAI | `.codex-plugin/plugin.json`, plus portable root manifest | `.agents/plugins/marketplace.json` |
| Claude Code | `.claude-plugin/plugin.json` | `.claude-plugin/marketplace.json` |
| Cursor | `.cursor-plugin/plugin.json` | `.cursor-plugin/marketplace.json` |

All hosts load the same `skills/` and `scripts/`; no procedural copies are maintained. Run `pnpm harness:sync` after identity or guidance changes. `pnpm harness:check` checks all generated host manifests, catalogs, and project adapters without writing. The OpenAI marketplace retains its existing host policy fields. The portable definition owns shared identity; generated files are not authoring sources. The stable plugin and marketplace name is `design-studio`; release stage appears in the version and beta description. For earlier installations, follow [plugin update instructions](../../SETUP.md#update-an-existing-plugin-installation).

[starter-package.mjs](scripts/starter-package.mjs) declares the working-studio contents for every agent-assisted setup path. New studios omit this plugin package, distribution catalogs, publishing workflows, and maintainer evaluations. They retain project skills, app code, examples, tool configuration, and local verification commands. Their [README](scripts/starter-readme.md) explains local ownership and customization. Each receives a new local Git baseline; its setup receipt records the pinned source revision. Existing studios are not repackaged. Manual GitHub template copies still contain the full repository.

Source clones and packaged working studios share `pnpm build` for module, source, type, and production checks. `pnpm test` runs focused regressions, `pnpm test:release` adds setup/production fixtures and available distribution tests, and `pnpm build:release` runs full regressions followed by the build. Packaging preserves these commands without rewriting them. See the [setup speed measurements](experiments/setup-speed.md) for cache assumptions and remaining work.

The package also preserves `contributors.json` when present in an older pinned starter. Omitting that registry breaks its configuration and build checks. The [Sites onboarding experiment](experiments/sites-onboarding.md) found and verified this compatibility fix with a fresh install.

Plugin entry skills stay outside the Studio instruction browser. The owned repository exposes platform, enabled-module, and assigned-system procedures through project skill adapters. Its `CLAUDE.md` imports `AGENTS.md`, and `.claude/skills` links the same entries used by Codex and Cursor. The helper replaces only the exact older generated Claude entry with the import; custom entries are preserved. See [Agent context routing](../../src/platform/context/agent-context.md).

## Publishing with ChatGPT Sites

Ask “Create my Design Studio locally and publish a public viewing link with ChatGPT Sites.” Local setup completes first. Native Sites tools then publish the static build and retain the Site identity in the owned folder. New viewing sites default to public, so anyone with the link can review and interact with the built prototypes. An explicit private or restricted audience takes precedence. Later, ask “Publish my Studio” to update that same Site with its existing audience. Source synchronization also sends the local source to the Sites-managed repository; no GitHub account is required.

This path needs a host with both local execution and native Sites capabilities. It does not add a hosted editing backend or change other hosts' local setup. See [publish-studio](skills/publish-studio/SKILL.md) for the procedure and the [experiment record](experiments/sites-onboarding.md) for evidence and remaining tests. The plugin interface includes the publishing capability and onboarding prompt. Fresh installed-plugin onboarding, later-chat publication, and recovery checks remain pending.

## Maintainer testing

These commands verify the package for maintainers:

```sh
pnpm harness:check
node --test plugins/design-studio/scripts/*.test.mjs
pnpm build
```

Local Codex marketplace:

```sh
codex plugin marketplace add /absolute/path/to/this/repository
codex plugin add design-studio@design-studio
```

Claude Desktop pilot journey:

1. Open **Customize → Plugins → Add plugin → Add marketplace**. Add `itspatmorgan/design-studio-starter` once the current package is pushed. The inspected macOS app accepts a GitHub owner/repo or Git URL.
2. Install Design Studio, then start a **Code** session with **Local** selected. Use **No folder** for initial setup when available. Ask “Create my Design Studio.”
3. Verify the source folder and preview, then follow [Host handoff](skills/create-studio/references/host-handoff.md) to continue in that exact folder.
4. Create a first prototype, restart, and reopen the same studio. Remove disposable test installs after verification.

The marketplace dialog and folder selector were inspected on October 6, 2026. Local CLI registration made all three plugin commands available in Claude Desktop; the person then reported setup working well. This local-install evidence does not prove the repository-import journey or reopen and preservation checks.

Local Claude maintainer validation and optional CLI testing:

```sh
claude plugin validate --strict plugins/design-studio
claude plugin validate --strict .claude-plugin/marketplace.json
claude --plugin-dir /absolute/path/to/this/repository/plugins/design-studio
```

In that Claude session, invoke `/design-studio:create-studio`. This tests the package in place without changing global plugin registrations. For repository distribution after pushing these manifests, add `itspatmorgan/design-studio-starter` as a Claude marketplace and install `design-studio@design-studio`.

For the beta, test Cursor’s local directory installation described in [SETUP.md](../../SETUP.md#cursor-local-plugin-instructions). Current official documentation requires a copy inside `~/.cursor/plugins/local`; links outside that directory are skipped. Repository team catalogs and reviewed public listings are additional distribution paths. A valid manifest alone does not prove activation or handoff.

Official references: [Claude Desktop](https://code.claude.com/docs/en/desktop), [OpenAI packaging](https://developers.openai.com/plugins/build/plugins), [Claude plugins](https://code.claude.com/docs/en/plugins-reference), [Claude marketplaces](https://code.claude.com/docs/en/plugin-marketplaces), [Cursor plugins](https://cursor.com/docs/reference/plugins), [Cursor skills and imports](https://cursor.com/docs/skills).

## Release readiness

| Evidence | Status |
| --- | --- |
| Codex private installation and first-run setup | Person confirmed experiment .11 creation, numbered default installs, local-file messaging, workspace handoff, and first prototype on this Mac. |
| Visible source and workspace handoff | Person confirmed the Codex folder link opens a chat in the owned studio. Persistent sidebar registration remains unverified. |
| Shared package checks | Plugin/bootstrap tests cover numbered default installs, source pinning, starter selection, preservation, linked paths, receipts, Claude entries, generated manifests, and marketplace resolution. |
| Claude package and marketplace schema | Installed Claude Code 2.1.285 validator accepts both. This is schema evidence only. |
| Claude Desktop local Code journey | Local installation and desktop command discovery verified October 6, 2026. Person reports setup working well. Repository import, reopen, and work-preservation checks remain pending. |
| Cursor local plugin setup | Person reports setup working well on this Mac. Repository import, reopen, and work-preservation checks remain pending. |
| Starter revision | Public merged revision downloaded and prepared successfully in a disposable QA folder. Its home rendered in the browser; flat context, current instruction reader, project skills, and Claude import were verified. This host already has prerequisite tools. |
| Working-studio packaging | Existing public pin packaged successfully. A local source fixture passed the full exported-studio build and displayed Welcome in a disposable preview using existing dependencies. Native desktop setup with this layout and clean-computer preparation remain pending. |
| Latest setup changes | Local revision `b2f74787db1aec4a4d9576121a90b0b6ba66fb72` packaged and passed its full build on October 6, 2026: 228 included tests, typecheck, and Vite. Browser review verified Welcome and dismissal after reload; fixture checks verified independent contributor progress, missing-declaration rejection, project skills, and repeat-create preservation. This used installed host dependencies and pinned tools, not clean-computer preparation or a native agent journey. The public starter pin still predates these changes. |
| Direct setup request | Implemented; first-run agent journey remains pending. |
| Clean computer | Missing tools, permission prompts, and interrupted prerequisite installation remain pending. The current host already has dependencies. |
| Claude beta registration migration | Isolated Claude Code CLI profile verified migration from `0.1.0-experiment.16` to `0.2.0-beta.1` on October 8, 2026. Reusing the old catalog path retained its old identity; a separate beta checkout succeeded and preserved an unrelated installed plugin. Desktop activation and existing-studio reopening remain unverified. |
| Beta distribution | Current package is beta; the tested public starter pin is retained. Earlier packages verified Sites deployment and public viewing. Native beta installation and migration, fresh installed-plugin onboarding, later-chat publishing, and recovery remain pending. |
| Reviewed public directories | Later stage. Submission, review, and listing remain pending. |
| Team use | Disposable package checks verified a second contributor's explicit Welcome flag and preserved the first profile and shared configuration. Native join, first prototype, and sharing tests remain pending. |

For each entry path, verify the full journey: discover or obtain instructions, install/invoke, create the owned folder, open its preview, continue in that folder, and create a first prototype using its current context. Then reopen after restart and confirm plugin removal and updates preserve user work. Check failures with missing tools, an occupied preview port, an interrupted setup, an existing unrelated destination, and a custom instruction entry.

Do not mark a host ready from schema checks or an offered folder link. Record actual native outcomes and the user's visual confirmation. Keep public submission separate from engineering readiness.
