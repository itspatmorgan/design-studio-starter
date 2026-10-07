# Test Design Studio on another computer

The beta test package is `0.1.0-experiment.13`, adding optional public Sites publishing. Its pinned starter snapshot remains `b6fc5d9c790671da5a27810a08ff9e05de700474`, which includes canvas loading, editor fallback, automatic link repair, and configuration-backed Welcome fixes. New installs use a smaller working-studio package. Numbered default installs and local-file messaging remain. Existing studios are preserved and are not upgraded automatically.

The current development branch has later contributor-level Welcome, system-curation guidance, and separate asset pages. Those changes are not in the experiment .12 starter pin. Before testing them through the four installation paths, publish a tested starter revision and update the package pin. Record the downloaded revision from `design-studio.local.json`; the plugin version alone does not identify the studio code.

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

- **Codex:** add this checkout as the local plugin marketplace and install the current Design Studio package. If an older experiment is installed, refresh or replace that installation using the plugin controls. Confirm the installed version is experiment .13, then start a fresh chat.
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

## Test the Sites candidate

Use the checkout containing experiment .13. For the customer delivery test, use the public repository after these changes are merged and pushed to main. Begin without Design Studio installed and follow the combined installation-and-publishing prompt in [SETUP.md](../../SETUP.md#1-codex-plugin). Verify the installed version, then follow any restart or new-chat handoff. Sites must be installed and available; plugin tagging is optional.

Ask: “Create a new Design Studio named Design Studio Public Onboarding QA in my Developer folder and publish a public review link with ChatGPT Sites. Handle setup and opening it for me.”

Verify the complete local folder and preview, the saved Site identity, and a public viewing link. Check a prototype direct link and interaction without signing in. The agent should report local authoring and public viewing separately.

In a second fresh chat in that studio folder, ask: “Change my Studio tagline to Local creation. Public review. Same Studio. Then publish my Studio to its existing Site.” Verify the same project and URL, the new tagline, and continued public access. Record both chats' actual outcomes in the [Sites experiment record](experiments/sites-onboarding.md).

Before broader rollout, verify explicit private-audience requests remain private and interrupted publishing preserves the local studio and resumes the same Site. Ordinary local edits must not publish automatically. These remain pending beta checks. Do not treat package installation as proof that either fresh-chat journey passed.

## Test the path to your own system

After the first prototype, use a disposable studio to test these requests with its coding agent. Record agent decisions and the rendered result separately from command success.

| Request | Review |
| --- | --- |
| Designer: “Help me create a system with these components and visual choices for this prototype.” | The agent imports the chosen subset, preserves APIs, and verifies the theme and states. It keeps examples until asked to remove them. |
| Product manager: “Help me prototype a customer feedback dashboard with a system that fits it.” | The agent identifies screens, interactions, and a small supporting kit. It asks focused questions about missing intent and avoids installing a component catalog. |
| Existing product: “Assess how we can bring our React components and theme into this studio.” | The agent traces the selected subset, theme, fonts, icons, and application dependencies. It reports evidence and proposed adaptations before migration. Assessment does not alter production code. |
| Follow-up: “Import the agreed subset.” | The agent preserves the component API and exact theme, or identifies unresolved differences. Compare matching content, state, viewport, and mode with source examples. Reject service-shim chains as a shortcut. |
| Assets: “Bring in these fonts, custom icons, and shared images.” | The correct asset pages show local files and previews. Fonts and icons work in the actual system, beyond their Studio previews. Package dependencies remain explicit. |
| Joining contributor: “Help me join this team's studio.” | Shared configuration and existing work stay intact. The new profile explicitly declares `welcomeDismissed: false`, receives Welcome independently, and can create work in its own folder. |

Use real supplied product source for the import trial. A synthetic fixture can verify platform mechanics, but cannot prove production fidelity. Empty context and skills folders are valid; the agent should not invent product knowledge or install a skills catalog.

## Recorded native journeys

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
