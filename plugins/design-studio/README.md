# Design Studio plugin experiment

This private experiment tests setup through a local agent plugin. A designer asks “Create my Design Studio.” The agent downloads and prepares a complete studio in an ordinary folder, then opens its local preview. GitHub is optional.

The pilot targets macOS with a supported local code harness. It does not establish public ChatGPT distribution or a complete one-click installation flow.

## Ownership and setup

The default location is `~/Developer/My Design Studio`. The user can choose another visible folder. The plugin cache contains the setup tools; it does not contain the user's studio.

[Create studio](skills/create-studio/SKILL.md) owns first-time setup. [Open studio](skills/open-studio/SKILL.md) owns reopening existing work. These procedures delegate contributor registration and product configuration to the downloaded repository's instructions. [Use studio](skills/use-studio/SKILL.md) handles ongoing work in the identified workspace and follows its current context and skills.

[bootstrap.mjs](scripts/bootstrap.mjs) downloads a pinned public starter revision and creates a local Git repository without a remote. No GitHub account is required. It uses the existing studio configuration command for personal setup. Repeating setup preserves existing files and settings. Uninstalling the plugin leaves the studio intact.

Git, Node, and mise are prerequisites for the helper. The agent procedure handles missing tools through supported host mechanisms. Automatic installation of those prerequisites has not been tested on a clean computer. Preparation trusts the inspected studio's mise configuration, installs its tools and dependencies, and executes the downloaded starter's commands.

The receipt `design-studio.local.json` records setup state and is excluded locally from Git. The helper refuses unrelated folders, linked repository metadata, invalid receipts, and modified initial settings before applying defaults. It is not a general installer for arbitrary repositories.

## Packaging

[plugin.json](plugin.json) is the canonical portable manifest. It supplies identity, prompts, light and dark icons, and OpenAI create, open, and use skills. Run `node scripts/sync-manifest.mjs` from this directory after changing it. The generator writes the compatibility manifest in `.codex-plugin/plugin.json`.

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
| Private local marketplace | Plugin installed and enabled with Codex CLI 0.137.0 on the first host and 0.151.0 on the second. |
| Visible owned source | Public pinned source downloaded to `~/Design Studios/Plugin Experiment`; complete files and local Git present, no remote. |
| Setup | Dependencies installed and personal studio configuration applied. |
| Preview | Local preview opened at port 5183; home and Feedback Inbox rendered. |
| Repeat setup | Existing studio name and configuration preserved. |
| Automated checks | Eight bootstrap tests, sixteen canonical and plugin skill validators, and platform build checks. The restructure passes 197 platform tests and type checks. |
| Fresh conversation | Second-host fresh chat selected create-studio, created and configured the studio, and opened its preview. The person confirmed setup worked. |
| Native plugin UI | Person supplied screenshots of both native lists. Separate composer and listing assets are installed; final optical balance still needs visual confirmation. |
| Local workspace handoff | On October 5, 2026, the person opened the documented folder link. The new chat ran in `~/Developer/My Design Studio` and read local rules, configuration, and Guide content before answering. Persistent sidebar registration remains unverified. |
| Portable project skills | Canonical platform and enabled-module skills generate `.agents/skills` entries for Codex and Cursor and `.claude/skills` links for Claude Code. Automated tests cover canonical references, idempotence, collisions, preservation, and capability removal. Native Claude Code and Cursor activation remain unverified. |
| Knowledge browser | Documentation displays original platform and module READMEs, Context, and Skills. Systems displays each system’s Context and Skills beside its toolkit. Technical platform documents live under Context → Technical. Browser QA checked owner selection, README and technical source editors, legacy Reference source mode and anchors, Systems navigation, and the Guide diagram. |
| Installer revision | Experiment .8 pins restructure commit `2c0cdd52d5f7b1cd6e984ebf3269365664d8d795`. A fresh local-source checkout regenerated all 13 project skills successfully. The revision must be pushed to the public source remote before a fresh GitHub install can work. Existing studios follow their own current instructions and are not migrated by reopening. |
| Clean computer | Missing-tool installation, interrupted downloads, and permission prompts still need end-to-end testing. |
| Public discoverability | Submission, eligibility, review, and listing are separate release work. No public package was submitted. |
| Team use | GitHub publishing, joining a team, authentication, and concurrent work remain outside this pilot. Existing repository contributor procedures provide the starting point. |

Corepack on this computer initially shadowed mise's selected pnpm version. The launcher now requests `pnpm@12` explicitly through mise. Windows and Linux behavior is unverified.

The second-host studio was moved from `~/Design Studios/My Design Studio` to `~/Developer/My Design Studio`. Its directory identity, Git history, settings, contributor registration, and receipt were preserved; its preview restarted successfully. Create and open skills now use the documented [host handoff](skills/create-studio/references/host-handoff.md). The link was tested independently; the revised setup-to-handoff sequence still needs a fresh-chat test.

Before release, prove the complete designer journey in the actual target ChatGPT host: discover, install, invoke onboarding, obtain a visible folder, attach that folder as the working project, and open the preview. Then test reopening, restart, removal, updates that preserve user edits, failure recovery, and a separate team workflow.

## Maintainer verification

From the repository root:

```sh
node --test plugins/design-studio/scripts/bootstrap.test.mjs
mise exec pnpm@12 -- pnpm build
```

The bootstrap tests use local Git fixtures and cover ownership, preservation, path validation, failed fetches, receipts, and interrupted setup. The platform build covers existing studio checks. These checks do not prove host UI behavior or public distribution.

Official reference: [Codex plugins](https://developers.openai.com/codex/plugins/). Use current host documentation when choosing a public distribution route; this local marketplace is not evidence of ChatGPT listing support.

## Guidance ownership in experiment .8

The platform and each enabled module own their context and skills beside implementation. Systems own product and design context and specialized skills. Technical module contracts use `README.md`; procedures link to them. See [agent context routing](../../src/platform/context/technical/agent-context.md) for native adapter ownership and compatibility routes.

Preparation and development startup synchronize native project skills. Modified or unrelated adapters are preserved with a diagnostic. The plugin contains only host installation, reopening, and workspace-use entry points, so it does not carry a stale copy of every operating procedure.
