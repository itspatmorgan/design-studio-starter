# Design Studio plugin

This experimental package helps a local coding agent create, open, and use Design Studio. A designer asks “Create my Design Studio.” The agent handles downloading and preparation, opens a preview, and helps them continue in the owned studio folder.

Public directory submission has not happened. Native Claude Code and Cursor setup journeys still need testing. The pilot targets macOS; Windows and Linux remain unverified.

## One setup flow

The default name and folder are **Design Studio** and `~/Developer/Design Studio`. Additional default installs use the first available **Design Studio 2**, **Design Studio 3**, and so on. The helper's read-only `choose` command selects the name and destination; `create` receives both and reserves the folder exclusively. Explicit names and locations take precedence. Resuming setup or reopening uses the known destination. People can change the studio name later. Complete source stays in the visible local folder, outside plugin caches, and remains usable after plugin removal. Personal use needs no GitHub account. The installer creates a local Git repository without a remote.

- [Create studio](skills/create-studio/SKILL.md) owns first-time setup.
- [Open studio](skills/open-studio/SKILL.md) reopens existing work without reinitializing it.
- [Use studio](skills/use-studio/SKILL.md) delegates ongoing work to that studio's current guidance.
- [Host handoff](skills/create-studio/references/host-handoff.md) adapts folder opening to the current coding tool.
- [Direct setup](../../SETUP.md) lets an agent use the same procedure without a plugin installed.

[bootstrap.mjs](scripts/bootstrap.mjs) implements downloading, inspection, preparation, and launch. Git and Node are prerequisites; preparation also needs mise. The skill tells the agent to handle missing tools through supported mechanisms and official sources. Automatic prerequisite installation has not been proved on a clean computer.

Preparation trusts the inspected studio's mise configuration, installs pinned tools and dependencies, applies first-run personal defaults, and synchronizes project skills. The receipt `design-studio.local.json` records setup state and is excluded locally from Git. Repeating setup preserves existing configuration and work. Unrelated folders, linked metadata, invalid receipts, and modified initial settings are refused rather than overwritten.

Experiment .11 pins the tested, publicly available integration snapshot at `5a685c2bee285c1e85b0e537304742ec92af77f6`. It includes portable setup, Welcome onboarding, and Check Design System. A release pin must identify a public, tested commit. New bootstrap changes do not automatically upgrade existing studios.

## Packaging and ownership

[plugin.json](plugin.json) is the canonical identity and OpenAI interface manifest. [sync-manifest.mjs](scripts/sync-manifest.mjs) generates host packages and marketplace catalogs:

| Host | Plugin manifest | Repository marketplace |
| --- | --- | --- |
| Codex/OpenAI | `.codex-plugin/plugin.json`, plus portable root manifest | `.agents/plugins/marketplace.json` |
| Claude Code | `.claude-plugin/plugin.json` | `.claude-plugin/marketplace.json` |
| Cursor | `.cursor-plugin/plugin.json` | `.cursor-plugin/marketplace.json` |

All hosts load the same `skills/` and `scripts/`; no procedural copies are maintained. Regenerate after identity changes with `node plugins/design-studio/scripts/sync-manifest.mjs`. Use `--check` to detect stale generated files without writing. The OpenAI marketplace retains its existing host policy fields.

Plugin entry skills stay outside the Studio instruction browser. The owned repository exposes platform, enabled-module, and assigned-system procedures through project skill adapters. Its `CLAUDE.md` imports `AGENTS.md`, and `.claude/skills` links the same entries used by Codex and Cursor. The helper replaces only the exact older generated Claude entry with the import; custom entries are preserved. See [Agent context routing](../../src/platform/context/agent-context.md).

## Maintainer testing

These are experiment commands, not the designer-facing installation experience:

```sh
node plugins/design-studio/scripts/sync-manifest.mjs --check
node --test plugins/design-studio/scripts/*.test.mjs
pnpm build
```

Local Codex marketplace:

```sh
codex plugin marketplace add /absolute/path/to/this/repository
codex plugin add design-studio@design-studio-experiment
```

Local Claude validation and testing:

```sh
claude plugin validate --strict plugins/design-studio
claude plugin validate --strict .claude-plugin/marketplace.json
claude --plugin-dir /absolute/path/to/this/repository/plugins/design-studio
```

In that Claude session, invoke `/design-studio:create-studio`. This tests the package in place without changing global plugin registrations. For repository distribution after pushing these manifests, add `itspatmorgan/design-studio-starter` as a Claude marketplace and install `design-studio@design-studio-experiment`.

Cursor supports repository marketplace imports through Customize → From GitHub Repository. That test requires the new `.cursor-plugin/marketplace.json` to be pushed first. Then install Design Studio and ask it to create a studio. A valid manifest alone does not prove import, activation, or handoff.

Official references: [OpenAI packaging](https://developers.openai.com/plugins/build/plugins), [Claude plugins](https://code.claude.com/docs/en/plugins-reference), [Claude marketplaces](https://code.claude.com/docs/en/plugin-marketplaces), [Cursor plugins](https://cursor.com/docs/reference/plugins), [Cursor skills and imports](https://cursor.com/docs/skills).

## Release readiness

| Evidence | Status |
| --- | --- |
| Codex private installation and first-run setup | Person confirmed experiment .10 setup on this Mac. Experiment .11 adds numbered default names and clearer local-file messaging; fresh native testing remains pending. |
| Visible source and workspace handoff | Person confirmed the Codex folder link opens a chat in the owned studio. Persistent sidebar registration remains unverified. |
| Shared package checks | Thirteen plugin/bootstrap tests cover numbered default installs, pinning, preservation, linked paths, receipts, Claude entries, generated manifests, and marketplace resolution. |
| Claude package and marketplace schema | Installed Claude Code 2.1.152 validator accepts both. Live setup/activation remains pending. |
| Cursor package | Follows current official format. Repository import and live activation remain pending. |
| Starter revision | Public merged revision downloaded and prepared successfully in a disposable QA folder. Its home rendered in the browser; flat context, current instruction reader, project skills, and Claude import were verified. This host already has prerequisite tools. |
| Direct setup request | Implemented; first-run agent journey remains pending. |
| Clean computer | Missing tools, permission prompts, and interrupted prerequisite installation remain pending. The current host already has dependencies. |
| Public distribution | Submission, review, and listing are pending for each host. |
| Team use | Separate onboarding and sharing tests are pending. |

For each entry path, verify the full journey: discover or obtain instructions, install/invoke, create the owned folder, open its preview, continue in that folder, and create a first prototype using its current context. Then reopen after restart and confirm plugin removal and updates preserve user work. Check failures with missing tools, an occupied preview port, an interrupted setup, an existing unrelated destination, and a custom instruction entry.

Do not mark a host ready from schema checks or an offered folder link. Record actual native outcomes and the user's visual confirmation. Keep public submission separate from engineering readiness.
