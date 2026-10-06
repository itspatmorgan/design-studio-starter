# Test Design Studio on another computer

The shared package is `0.1.0-experiment.10`. Its pinned starter snapshot is `5a685c2bee285c1e85b0e537304742ec92af77f6`, which includes Welcome onboarding, shared project skills, and Check Design System. Existing studios are preserved and are not upgraded automatically.

## Get the current package

In an existing clean checkout on `main`, run:

```sh
git pull --ff-only
```

For a new checkout:

```sh
git clone https://github.com/itspatmorgan/design-studio-starter.git
cd design-studio-starter
```

Read the [plugin README](README.md) for installation commands. The plugin folder is `plugins/design-studio` inside this checkout. Record the checkout commit and harness version for each test. Use a separate, previously unused destination folder for each harness so an existing studio cannot hide a setup failure.

## Test each harness

- **Codex:** add this checkout as the local plugin marketplace and install the current Design Studio package. If an older experiment is installed, refresh or replace that installation using the plugin controls. Confirm the installed version is experiment .10, then start a fresh chat.
- **Claude Code:** run `claude --plugin-dir /absolute/path/to/design-studio-starter/plugins/design-studio`, then invoke `/design-studio:create-studio`. This local test does not change global plugin registrations. Repository marketplace installation can be checked afterward.
- **Cursor:** use Customize → From GitHub Repository, import `itspatmorgan/design-studio-starter`, and install Design Studio. Confirm the current package loads, then start a fresh agent chat.

Ask each agent: “Create my Design Studio in [your chosen new folder]. Handle setup and opening it for me.” The person should not need to clone the studio or run its setup commands themselves.

For each harness, check:

1. The agent creates complete source in the requested visible folder and opens its local preview.
2. Welcome appears. Explore its concepts, then open the Product example.
3. Continue with the agent in the owned studio folder. Confirm project skills are available and the contributor is resolved before prototype edits.
4. Ask for a small prototype using the Product system. Check that it uses that system and opens successfully.
5. Close and reopen the studio with the plugin. The prototype remains and Welcome does not repeat in the same browser origin.

Record what the agent did, where it needed human help, and any unclear step. For skill discovery, note whether skills appear in the harness’s UI and whether the agent actually uses the appropriate procedure.

| Harness | Package/version | Setup + Welcome | Workspace + skills | First prototype | Reopen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Codex | experiment .10 confirmed | Person reported successful setup on 2026-10-06; Welcome details not separately recorded | Pending | Pending | Pending | Codex CLI 0.137.0; checkout 291e657. Feedback: explain local file ownership, the exact destination, and the Developer folder. Shared create-studio wording updated afterward; revised wording needs a fresh native test. |
| Claude Code | Pending | Pending | Pending | Pending | Pending | |
| Cursor | Pending | Pending | Pending | Pending | Pending | |

## Follow-up checks

Try [direct setup](../../SETUP.md) without an installed plugin. Then check occupied ports, interrupted setup, an unrelated existing destination, and preservation after plugin removal or updates. Clean-computer prerequisite installation is still a separate gate if this computer already has the required tools. Windows and Linux remain unverified.

Automated checks and a prepared studio do not prove these native journeys. Record actual results in the [release readiness table](README.md#release-readiness). Public directory submission remains separate from this test package.
