# Design Studio plugin experiment

This private experiment tests setup through a local agent plugin. A designer asks “Create my Design Studio.” The agent downloads and prepares a complete studio in an ordinary folder, then opens its local preview. GitHub is optional.

The pilot targets macOS with a supported local code harness. It does not establish public ChatGPT distribution or a complete one-click installation flow.

## Ownership and setup

The default location is `~/Developer/My Design Studio`. The user can choose another visible folder. The plugin cache contains the setup tools; it does not contain the user's studio.

[Create studio](skills/create-studio/SKILL.md) owns first-time setup. [Open studio](skills/open-studio/SKILL.md) owns reopening existing work. These procedures delegate contributor registration and product configuration to the downloaded repository's instructions.

[bootstrap.mjs](scripts/bootstrap.mjs) downloads a pinned public starter revision and creates a local Git repository without a remote. No GitHub account is required. It uses the existing studio configuration command for personal setup. Repeating setup preserves existing files and settings. Uninstalling the plugin leaves the studio intact.

Git, Node, and mise are prerequisites for the helper. The agent procedure handles missing tools through supported host mechanisms. Automatic installation of those prerequisites has not been tested on a clean computer. Preparation trusts the inspected studio's mise configuration, installs its tools and dependencies, and executes the downloaded starter's commands.

The receipt `design-studio.local.json` records setup state and is excluded locally from Git. The helper refuses unrelated folders, linked repository metadata, invalid receipts, and modified initial settings before applying defaults. It is not a general installer for arbitrary repositories.

## Packaging

[plugin.json](plugin.json) is the canonical portable manifest. It supplies identity, prompts, light and dark icons, and the OpenAI onboarding skill. Run `node scripts/sync-manifest.mjs` from this directory after changing it. The generator writes the compatibility manifest in `.codex-plugin/plugin.json`.

The repository marketplace lives at [marketplace.json](../../.agents/plugins/marketplace.json). Codex CLI 0.137.0 required the compatibility manifest during local installation. A portable root manifest alone failed in this test.

These maintainer commands install the private experiment from this checkout:

```sh
codex plugin marketplace add /absolute/path/to/this/repository
codex plugin add design-studio@design-studio-experiment
codex plugin list
```

They are test instructions for maintainers. The intended designer experience uses plugin discovery and the setup prompt.

## Results and release gates

| Area | Result |
| --- | --- |
| Private local marketplace | Plugin installed and enabled with Codex CLI 0.137.0. |
| Visible owned source | Public pinned source downloaded to `~/Design Studios/Plugin Experiment`; complete files and local Git present, no remote. |
| Setup | Dependencies installed and personal studio configuration applied. |
| Preview | Local preview opened at port 5183; home and Feedback Inbox rendered. |
| Repeat setup | Existing studio name and configuration preserved. |
| Automated checks | Eight bootstrap tests, two skill validators, and platform build checks. |
| Fresh conversation | Skill selection and onboarding still require testing after host refresh. Helpers were exercised directly, not by a fresh agent conversation. |
| Native plugin UI | Logo, placement, and onboarding presentation remain unverified. Native Codex UI automation was unavailable. |
| Local harness attachment | No supported project-registration API was available in this test. A browser preview does not prove project attachment. |
| Clean computer | Missing-tool installation, interrupted downloads, and permission prompts still need end-to-end testing. |
| Public discoverability | Submission, eligibility, review, and listing are separate release work. No public package was submitted. |
| Team use | GitHub publishing, joining a team, authentication, and concurrent work remain outside this pilot. Existing repository contributor procedures provide the starting point. |

Corepack on this computer initially shadowed mise's selected pnpm version. The launcher now requests `pnpm@12` explicitly through mise. Windows and Linux behavior is unverified.

Before release, prove the complete designer journey in the actual target ChatGPT host: discover, install, invoke onboarding, obtain a visible folder, attach that folder as the working project, and open the preview. Then test reopening, restart, removal, updates that preserve user edits, failure recovery, and a separate team workflow.

## Maintainer verification

From the repository root:

```sh
node --test plugins/design-studio/scripts/bootstrap.test.mjs
mise exec pnpm@12 -- pnpm build
```

The bootstrap tests use local Git fixtures and cover ownership, preservation, path validation, failed fetches, receipts, and interrupted setup. The platform build covers existing studio checks. These checks do not prove host UI behavior or public distribution.

Official reference: [Codex plugins](https://developers.openai.com/codex/plugins/). Use current host documentation when choosing a public distribution route; this local marketplace is not evidence of ChatGPT listing support.
