# Test Design Studio on another computer

The shared package is `0.1.0-experiment.11`. It adds numbered default installs (Design Studio, Design Studio 2, and so on) and clearer local-file messaging. Its pinned starter snapshot is `5a685c2bee285c1e85b0e537304742ec92af77f6`, which includes Welcome onboarding, shared project skills, and Check Design System. Existing studios are preserved and are not upgraded automatically.

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

- **Codex:** add this checkout as the local plugin marketplace and install the current Design Studio package. If an older experiment is installed, refresh or replace that installation using the plugin controls. Confirm the installed version is experiment .11, then start a fresh chat.
- **Claude Code plugin:** follow the local registration procedure in [SETUP.md](../../SETUP.md#claude-code-local-plugin-instructions), then test in Claude Desktop’s Code view with Local selected. Verify the plugin commands before asking it to create a studio. Keep unrelated work repositories out of this test.
- **Cursor plugin:** follow [local plugin installation](../../SETUP.md#cursor-local-plugin-instructions), reload the app, and verify its skills in Customize before starting a fresh local Agent chat.
- **Direct from source:** use [the plugin-free request](../../SETUP.md#4-direct-from-the-source-repository) in a local desktop agent without Design Studio installed.

Ask each agent: “Create my Design Studio in [your chosen new folder]. Handle setup and opening it for me.” The person should not need to clone the studio or run its setup commands themselves.

For each harness, check:

1. The agent creates complete source in the requested visible folder and opens its local preview.
2. Welcome appears. Explore its concepts, then open the Product example.
3. Continue with the agent in the owned studio folder. Confirm project skills are available and the contributor is resolved before prototype edits.
4. Ask for a small prototype using the Product system. Check that it uses that system and opens successfully.
5. Close and reopen the studio with the plugin. The prototype remains and Welcome does not repeat after a server restart or a preview-port change.

Record what the agent did, where it needed human help, and any unclear step. For skill discovery, note whether skills appear in the harness’s UI and whether the agent actually uses the appropriate procedure.

| Harness | Package/version | Setup + Welcome | Workspace + skills | First prototype | Reopen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Codex | experiment .11 | Person confirmed setup and numbered installs | Person confirmed folder handoff | Passed | Verify against updated starter pin | |
| Claude Desktop Code | experiment .11, locally registered | Person reports setup working well on 2026-10-06 | Plugin commands verified; folder controls inspected | Pending | Pending | Downloaded older pinned starter. Use a separate test studio and preserve unrelated workspaces. |
| Cursor | experiment .11 | Person reports setup working well on 2026-10-06 | Verify against packaged starter | Pending | Pending | Local directory install is the first-release path. |
| Direct from source | No plugin | Pending | Pending | Pending | Pending | |

## Follow-up checks

Create two studios without specifying names or paths. Verify numbered default folders, the local-files explanation, and preservation of the first studio. Reopen by the known folder and resume interrupted setup without allocating another number. Then try [direct setup](../../SETUP.md) without an installed plugin. Check occupied ports, an unrelated existing destination, and preservation after plugin removal or updates. Clean-computer prerequisite installation is still a separate gate if this computer already has the required tools. Windows and Linux remain unverified.

Automated checks and a prepared studio do not prove these native journeys. Record actual results in the [release readiness table](README.md#release-readiness). Public directory submission remains separate from this test package.

After the packaging refactor, repeat native setup using a fresh destination. Verify the studio contains app code, examples, project skill adapters, and its own README, with no plugin distribution catalogs or publishing workflows. Its setup receipt identifies the source revision; its Git HEAD is a new local baseline. Keep the generated compatibility manifests until installation, discovery, and updates are tested without them.
